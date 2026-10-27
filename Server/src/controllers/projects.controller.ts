import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { Company } from '../models/Company';
import { CompanyAuth } from '../models/CompanyAuth';
import { CompanyNotification } from '../models/CompanyNotification';
import { ContractorNotification } from '../models/ContractorNotification';
import { Project } from '../models/Project';
import { ProjectTask } from '../models/ProjectTask';
import { TalentRequest } from '../models/TalentRequest';
import { Worker } from '../models/Worker';
import { env } from '../config/env';
import { AppError, Errors, created, ok } from '../utils/response';
import { sendEmail } from '../utils/email';
import { logger } from '../utils/logger';

const teamMemberSchema = z.object({
  workerId: z.string().trim().min(1),
  role: z.string().trim().min(2).max(120),
});

const projectSchema = z.object({
  talentRequestId: z.string().trim().min(1).optional(),
  companyId: z.string().trim().min(1).optional(),
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().min(10).max(5000),
  scope: z.string().trim().min(10).max(5000),
  budget: z.coerce.number().min(0),
  currency: z.enum(['USD', 'INR', 'AED']),
  paymentTerms: z.string().trim().min(3).max(1200),
  startDate: z.string().datetime().optional().nullable(),
  targetEndDate: z.string().datetime().optional().nullable(),
  deliverables: z.array(z.string().trim().min(1).max(600)).min(1).max(50),
  teamMembers: z.array(teamMemberSchema).min(1).max(20),
}).refine((value) => Boolean(value.talentRequestId || value.companyId), {
  message: 'A talent request or company is required.',
  path: ['companyId'],
});

const taskSchema = z.object({
  title: z.string().trim().min(3).max(240),
  description: z.string().trim().max(5000).default(''),
  assigneeWorkerIds: z.array(z.string().trim().min(1)).min(1).max(20),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().datetime().optional().nullable(),
});

function getAdminEmails(): string[] {
  return env.DECHUB_ADMIN_EMAILS.split(',').map((email) => email.trim().toLowerCase()).filter(Boolean);
}

async function getCompanyForUser(userId: string) {
  const account = await CompanyAuth.findById(userId).select('companyId');
  const company = account?.companyId
    ? await Company.findById(account.companyId)
    : await Company.findOne({ ownerId: userId });
  if (!company) throw Errors.NotFound('Company');
  return company;
}

async function getWorkerFromRequest(req: Request) {
  const workerId = req.worker?.sub;
  if (!workerId) throw Errors.Unauthorized();
  const worker = await Worker.findById(workerId);
  if (!worker) throw Errors.NotFound('Team member');
  return worker;
}

function projectActionUrl(projectId: string): string {
  return `/dashboard?tab=projects&project=${projectId}`;
}

async function notifyWorkers(project: InstanceType<typeof Project>, title: string, message: string): Promise<void> {
  const actionUrl = `/contractor/dashboard?tab=projects&project=${project._id}`;
  await ContractorNotification.insertMany(project.teamMembers.map((member) => ({
    workerId: member.workerId,
    type: 'general',
    title,
    message,
    actionUrl,
  })));

  const workers = await Worker.find({ _id: { $in: project.teamMembers.map((member) => member.workerId) } }).select('email firstName');
  await Promise.allSettled(workers.map((worker) => sendEmail(
    worker.email,
    title,
    `<p>Hi ${worker.firstName},</p><p>${message}</p><p>Open Dechub-Bridge to view your project and assigned tasks.</p>`,
  )));
}

async function sendAdminEmail(subject: string, message: string): Promise<void> {
  const emails = getAdminEmails();
  await Promise.allSettled(emails.map((email) => sendEmail(email, subject, `<p>${message}</p>`, { includeLogo: false })));
}

function serializeProject(project: InstanceType<typeof Project>) {
  return project.toObject();
}

async function serializeCompanyProjects(projects: Array<InstanceType<typeof Project>>) {
  const workerIds = [...new Set(projects.flatMap((project) => project.teamMembers.map((member) => member.workerId.toString())))];
  const projectIds = projects.map((project) => project._id);
  const [workers, tasks] = await Promise.all([
    Worker.find({ _id: { $in: workerIds } }).select('firstName lastName email status lastLoginAt'),
    ProjectTask.find({ projectId: { $in: projectIds } }).select('projectId assigneeWorkerIds status'),
  ]);
  const workersById = new Map(workers.map((worker) => [worker._id.toString(), worker]));

  return projects.map((project) => {
    const projectTasks = tasks.filter((task) => task.projectId.toString() === project._id.toString());
    return {
      ...serializeProject(project),
      teamAccess: project.teamMembers.map((member) => {
        const worker = workersById.get(member.workerId.toString());
        const memberTasks = projectTasks.filter((task) => task.assigneeWorkerIds.some((workerId) => workerId.toString() === member.workerId.toString()));
        return {
          workerId: member.workerId.toString(),
          role: member.role,
          name: worker ? `${worker.firstName} ${worker.lastName}` : 'Delivery team member',
          email: worker?.email ?? '',
          accountStatus: worker?.status ?? 'inactive',
          lastLoginAt: worker?.lastLoginAt ?? null,
          projectAccess: project.status === 'active' ? 'active' : project.status === 'contract_sent' ? 'pending client acceptance' : project.status,
          taskSummary: {
            total: memberTasks.length,
            todo: memberTasks.filter((task) => task.status === 'todo').length,
            inProgress: memberTasks.filter((task) => task.status === 'in_progress').length,
            completed: memberTasks.filter((task) => task.status === 'completed').length,
          },
        };
      }),
    };
  });
}

export async function createProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = projectSchema.parse(req.body);
    let companyId = data.companyId;
    let talentRequestId: string | undefined;

    if (data.talentRequestId) {
      const request = await TalentRequest.findById(data.talentRequestId);
      if (!request?.companyId) throw new AppError('The selected request is not linked to a signed-up company.', 400, 'COMPANY_REQUIRED');
      companyId = request.companyId.toString();
      talentRequestId = request._id.toString();
    }

    const company = await Company.findById(companyId);
    if (!company) throw Errors.NotFound('Client company');

    const uniqueWorkerIds = [...new Set(data.teamMembers.map((member) => member.workerId))];
    if (uniqueWorkerIds.length !== data.teamMembers.length) throw new AppError('A team member can be added only once.', 400, 'DUPLICATE_TEAM_MEMBER');
    const workers = await Worker.find({ _id: { $in: uniqueWorkerIds }, status: { $ne: 'terminated' } }).select('_id');
    if (workers.length !== uniqueWorkerIds.length) throw new AppError('One or more selected team members are unavailable.', 400, 'INVALID_TEAM_MEMBER');

    const project = await Project.create({
      ...data,
      companyId: company._id,
      talentRequestId: talentRequestId ?? null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      targetEndDate: data.targetEndDate ? new Date(data.targetEndDate) : null,
      createdByAdminEmail: req.user!.email,
    });

    created(res, serializeProject(project));
  } catch (error) {
    if (error instanceof AppError || error instanceof z.ZodError) {
      next(error);
      return;
    }
    next(new AppError(
      `Project could not be created: ${error instanceof Error ? error.message : 'Unknown database error'}`,
      500,
      'PROJECT_CREATE_FAILED',
    ));
  }
}

export async function listAdminProjects(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const projects = await Project.find().sort({ createdAt: -1 }).limit(200);
    ok(res, projects.map(serializeProject));
  } catch (error) { next(error); }
}

export async function sendProjectContract(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) throw Errors.NotFound('Project');
    if (project.status !== 'draft') throw new AppError('Only draft projects can be sent for client acceptance.', 400, 'INVALID_PROJECT_STATUS');

    const company = await Company.findById(project.companyId);
    if (!company) throw Errors.NotFound('Client company');

    // Older sign-up records may have a company owner but no CompanyAuth.companyId.
    // Resolve that legacy link before sending the contract and repair it once found.
    let account = await CompanyAuth.findOne({ companyId: project.companyId }).sort({ createdAt: 1 });
    if (!account && company.ownerId) {
      account = await CompanyAuth.findById(company.ownerId);
    }
    if (!account && project.talentRequestId) {
      const request = await TalentRequest.findById(project.talentRequestId).select('email');
      if (request?.email) {
        account = await CompanyAuth.findOne({ email: request.email.trim().toLowerCase() });
      }
    }
    if (!account) throw new AppError('Client company account is not available. Ask the client to complete signup with the request email before sending the contract.', 400, 'COMPANY_ACCOUNT_REQUIRED');
    if (!account.companyId || account.companyId.toString() !== company._id.toString()) {
      account.companyId = company._id;
      await account.save();
    }

    project.status = 'contract_sent';
    project.contractSentAt = new Date();
    await project.save();

    const actionUrl = projectActionUrl(project._id.toString());
    await CompanyNotification.create({
      companyId: project.companyId,
      projectId: project._id,
      type: 'project_contract',
      title: 'Project contract ready for review',
      message: `The Dechub-Bridge project contract for ${project.title} is ready for your acceptance.`,
      actionUrl,
    });
    let emailSent = true;
    try {
      await sendEmail(account.email, `Review project contract: ${project.title}`, `<p>Hi ${account.firstName},</p><p>Your Dechub-Bridge project contract is ready for review and acceptance.</p><p><strong>Project:</strong> ${project.title}</p><p><strong>Budget:</strong> ${project.currency} ${project.budget.toLocaleString()}</p><p>Open your dashboard to review and accept it.</p>`);
    } catch (emailError) {
      emailSent = false;
      logger.error(`Project contract email failed for ${project._id.toString()}`, emailError);
    }

    ok(res, { ...serializeProject(project), emailSent });
  } catch (error) {
    if (error instanceof AppError || error instanceof z.ZodError) {
      next(error);
      return;
    }
    next(new AppError(
      `Project contract could not be sent: ${error instanceof Error ? error.message : 'Unknown database error'}`,
      500,
      'PROJECT_SEND_FAILED',
    ));
  }
}

export async function acceptProjectContract(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const company = await getCompanyForUser(req.user!.sub);
    const account = await CompanyAuth.findById(req.user!.sub).select('firstName lastName email');
    if (!account) throw Errors.NotFound('Company account');
    const project = await Project.findOne({ _id: req.params.id, companyId: company._id });
    if (!project) throw Errors.NotFound('Project');
    if (project.status !== 'contract_sent') throw new AppError('This project contract is not awaiting acceptance.', 400, 'INVALID_PROJECT_STATUS');

    project.status = 'active';
    project.clientAcceptedAt = new Date();
    project.clientAcceptedBy = account.email;
    await project.save();

    await notifyWorkers(project, 'Project activated', `You have been added to ${project.title}. The client has accepted the project contract.`);
    await sendAdminEmail(`Client accepted project: ${project.title}`, `${company.companyName ?? 'Client company'} accepted the project contract for ${project.title}.`);
    await CompanyNotification.create({
      companyId: company._id,
      projectId: project._id,
      type: 'project_active',
      title: 'Project is active',
      message: `${project.title} is active. You can now create tasks for the delivery team.`,
      actionUrl: projectActionUrl(project._id.toString()),
    });

    ok(res, serializeProject(project));
  } catch (error) { next(error); }
}

export async function listCompanyProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const company = await getCompanyForUser(req.user!.sub);
    const projects = await Project.find({ companyId: company._id }).sort({ createdAt: -1 });
    ok(res, await serializeCompanyProjects(projects));
  } catch (error) { next(error); }
}

export async function createProjectTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = taskSchema.parse(req.body);
    const company = await getCompanyForUser(req.user!.sub);
    const project = await Project.findOne({ _id: req.params.id, companyId: company._id, status: 'active' });
    if (!project) throw new AppError('Only active projects can receive tasks.', 400, 'PROJECT_NOT_ACTIVE');

    const permittedWorkerIds = new Set(project.teamMembers.map((member) => member.workerId.toString()));
    if (data.assigneeWorkerIds.some((workerId) => !permittedWorkerIds.has(workerId))) throw Errors.Forbidden();

    const task = await ProjectTask.create({
      ...data,
      projectId: project._id,
      companyId: company._id,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      createdByCompanyUserId: req.user!.sub,
    });

    const workers = await Worker.find({ _id: { $in: data.assigneeWorkerIds } }).select('email firstName');
    await ContractorNotification.insertMany(data.assigneeWorkerIds.map((workerId) => ({
      workerId,
      type: 'general',
      title: 'New project task assigned',
      message: `You have been assigned "${task.title}" in ${project.title}.`,
      actionUrl: `/contractor/dashboard?tab=projects&project=${project._id}`,
    })));
    await Promise.allSettled(workers.map((worker) => sendEmail(worker.email, `New task: ${task.title}`, `<p>Hi ${worker.firstName},</p><p>You have a new task in ${project.title}: <strong>${task.title}</strong>.</p>`)));

    created(res, task.toObject());
  } catch (error) { next(error); }
}

export async function listCompanyProjectTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const company = await getCompanyForUser(req.user!.sub);
    const project = await Project.findOne({ _id: req.params.id, companyId: company._id });
    if (!project) throw Errors.NotFound('Project');
    const tasks = await ProjectTask.find({ projectId: project._id }).sort({ createdAt: -1 });
    ok(res, tasks.map((task) => task.toObject()));
  } catch (error) { next(error); }
}

export async function submitProjectPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = z.object({ paymentReference: z.string().trim().min(3).max(240), paymentProofUrl: z.string().trim().url().max(1000).optional() }).parse(req.body);
    const company = await getCompanyForUser(req.user!.sub);
    const project = await Project.findOne({ _id: req.params.id, companyId: company._id });
    if (!project) throw Errors.NotFound('Project');
    if (project.status !== 'active') throw new AppError('Payment can be submitted only for an active project.', 400, 'INVALID_PROJECT_STATUS');

    project.status = 'payment_submitted';
    project.paymentReference = data.paymentReference;
    project.paymentProofUrl = data.paymentProofUrl ?? null;
    project.paymentSubmittedAt = new Date();
    await project.save();
    await sendAdminEmail(`Payment submitted: ${project.title}`, `Client payment reference ${data.paymentReference} was submitted for ${project.title}. Verify it in the admin dashboard.`);
    ok(res, serializeProject(project));
  } catch (error) { next(error); }
}

export async function verifyProjectPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) throw Errors.NotFound('Project');
    if (project.status !== 'payment_submitted') throw new AppError('No payment submission is awaiting verification.', 400, 'INVALID_PROJECT_STATUS');

    project.status = 'completed';
    project.paymentVerifiedAt = new Date();
    project.paymentVerifiedBy = req.user!.email;
    project.completedAt = new Date();
    await project.save();

    await CompanyNotification.create({ companyId: project.companyId, projectId: project._id, type: 'project_completed', title: 'Project completed', message: `${project.title} has been marked completed after payment verification.`, actionUrl: projectActionUrl(project._id.toString()) });
    await notifyWorkers(project, 'Project completed', `${project.title} is complete and payment has been verified.`);
    await sendAdminEmail(`Project completed: ${project.title}`, `Payment was verified and ${project.title} is now completed.`);
    ok(res, serializeProject(project));
  } catch (error) { next(error); }
}

export async function listWorkerProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const worker = await getWorkerFromRequest(req);
    const projects = await Project.find({ 'teamMembers.workerId': worker._id, status: { $in: ['active', 'payment_submitted', 'completed'] } }).sort({ updatedAt: -1 });
    ok(res, projects.map(serializeProject));
  } catch (error) { next(error); }
}

export async function listWorkerProjectTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const worker = await getWorkerFromRequest(req);
    const project = await Project.findOne({ _id: req.params.id, 'teamMembers.workerId': worker._id });
    if (!project) throw Errors.NotFound('Project');
    const tasks = await ProjectTask.find({ projectId: project._id, assigneeWorkerIds: worker._id }).sort({ dueDate: 1, createdAt: -1 });
    ok(res, tasks.map((task) => task.toObject()));
  } catch (error) { next(error); }
}

export async function updateWorkerProjectTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = z.object({ status: z.enum(['todo', 'in_progress', 'completed']), completionNote: z.string().trim().max(3000).optional() }).parse(req.body);
    const worker = await getWorkerFromRequest(req);
    const task = await ProjectTask.findOne({ _id: req.params.taskId, assigneeWorkerIds: worker._id });
    if (!task) throw Errors.NotFound('Assigned task');
    const project = await Project.findOne({ _id: task.projectId, 'teamMembers.workerId': worker._id });
    if (!project || project.status !== 'active') throw new AppError('This task cannot be updated.', 400, 'TASK_NOT_ACTIVE');

    task.status = data.status;
    task.completionNote = data.completionNote ?? task.completionNote;
    task.completedAt = data.status === 'completed' ? new Date() : null;
    await task.save();

    if (data.status === 'completed') {
      await CompanyNotification.create({ companyId: project.companyId, projectId: project._id, type: 'task_completed', title: 'Task completed', message: `${worker.firstName} completed "${task.title}" in ${project.title}.`, actionUrl: projectActionUrl(project._id.toString()) });
    }
    ok(res, task.toObject());
  } catch (error) { next(error); }
}

export async function listCompanyNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const company = await getCompanyForUser(req.user!.sub);
    const notifications = await CompanyNotification.find({ companyId: company._id }).sort({ createdAt: -1 }).limit(50);
    ok(res, notifications.map((notification) => notification.toObject()));
  } catch (error) { next(error); }
}

export async function markCompanyNotificationRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const company = await getCompanyForUser(req.user!.sub);
    const notification = await CompanyNotification.findOneAndUpdate({ _id: req.params.id, companyId: company._id }, { readAt: new Date() }, { new: true });
    if (!notification) throw Errors.NotFound('Notification');
    ok(res, notification.toObject());
  } catch (error) { next(error); }
}
