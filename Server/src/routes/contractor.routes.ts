import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { requireContractorAuth } from '../middleware/contractorAuth.middleware';
import { profileImageUpload } from '../middleware/upload.middleware';
import {
  verifyToken,
  setPassword,
  selfSignup,
  savePersonalDetails,
  uploadKyc,
  saveBankDetails,
  updateSkills,
  uploadProfileAsset,
  updateProfile,
  getMyContract,
  getSigningUrl,
  signMyContract,
  rejectMyContract,
  docusignWebhook,
  getMe,
  listMyNotifications,
  markNotificationRead,
  submitInvoice,
  getMyInvoices,
} from '../controllers/contractor.controller';
import { listWorkerProjects, listWorkerProjectTasks, updateWorkerProjectTask } from '../controllers/projects.controller';

const router = Router();

// ── KYC file upload config ────────────────────────────────────────────────────

const kycStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, process.env.UPLOAD_DIR ?? 'uploads'),
  filename:    (_req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const name = `kyc-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});

const kycUpload = multer({
  storage: kycStorage,
  limits:  { fileSize: (Number(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/i;
    if (allowed.test(path.extname(file.originalname))) cb(null, true);
    else cb(new Error('Only JPG, PNG, and PDF files are allowed'));
  },
}).fields([
  { name: 'idFront', maxCount: 1 },
  { name: 'idBack',  maxCount: 1 },
  { name: 'selfie',  maxCount: 1 },
]);

// ── Public routes (no auth needed) ───────────────────────────────────────────

router.get ('/verify-token/:token', verifyToken);
router.post('/set-password',        setPassword);
router.post('/self-signup',         selfSignup);

// ── DocuSign webhook (signed by DocuSign, not by user JWT) ───────────────────
router.post('/docusign/webhook', docusignWebhook);

// ── Protected routes (contractor JWT required) ───────────────────────────────

router.use(requireContractorAuth);

// Onboarding
router.post('/onboarding/personal-details', savePersonalDetails);
router.post('/onboarding/kyc',              kycUpload, uploadKyc);
router.post('/onboarding/bank-details',     saveBankDetails);
router.put ('/me/skills',                   updateSkills);
router.post('/me/profile/assets',           profileImageUpload.single('image'), uploadProfileAsset);
router.put ('/me/profile',                  updateProfile);

// Contract + signing
router.get ('/contract',             getMyContract);
router.post('/contract/sign',        signMyContract);
router.post('/contract/reject',      rejectMyContract);
router.post('/contract/signing-url', getSigningUrl);

// Project delivery workspace
router.get('/projects', listWorkerProjects);
router.get('/projects/:id/tasks', listWorkerProjectTasks);
router.patch('/project-tasks/:taskId', updateWorkerProjectTask);

// Dashboard
router.get('/me', getMe);
router.get('/notifications', listMyNotifications);
router.post('/notifications/:id/read', markNotificationRead);

// Invoices
router.get ('/invoices',       getMyInvoices);
router.post('/invoices',       submitInvoice);

export default router;
