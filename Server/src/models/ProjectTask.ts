import mongoose, { Document, Schema } from 'mongoose';

export type ProjectTaskStatus = 'todo' | 'in_progress' | 'completed';

export interface IProjectTask extends Document {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  assigneeWorkerIds: mongoose.Types.ObjectId[];
  status: ProjectTaskStatus;
  priority: 'low' | 'medium' | 'high';
  dueDate: Date | null;
  completionNote: string | null;
  completedAt: Date | null;
  createdByCompanyUserId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectTaskSchema = new Schema<IProjectTask>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 240 },
    description: { type: String, default: '', trim: true, maxlength: 5000 },
    assigneeWorkerIds: [{ type: Schema.Types.ObjectId, ref: 'Worker', required: true }],
    status: { type: String, enum: ['todo', 'in_progress', 'completed'], default: 'todo', index: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    dueDate: { type: Date, default: null },
    completionNote: { type: String, default: null, trim: true, maxlength: 3000 },
    completedAt: { type: Date, default: null },
    createdByCompanyUserId: { type: Schema.Types.ObjectId, ref: 'CompanyAuth', required: true },
  },
  { timestamps: true },
);

projectTaskSchema.index({ projectId: 1, status: 1, updatedAt: -1 });
projectTaskSchema.index({ assigneeWorkerIds: 1, status: 1, dueDate: 1 });

export const ProjectTask = mongoose.model<IProjectTask>('ProjectTask', projectTaskSchema);
