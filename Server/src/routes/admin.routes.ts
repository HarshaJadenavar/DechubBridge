import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireDechubAdmin } from '../middleware/admin.middleware';
import {
  login,
  refresh,
  listTalentRequests,
  getTalentRequest,
  updateTalentRequestStatus,
  unreadCount,
  markAsRead,
  sendTalentRequestShortlist,
  listMarketplaceCandidatesForAdmin,
} from '../controllers/admin.controller';
import { createProject, listAdminProjects, sendProjectContract, verifyProjectPayment } from '../controllers/projects.controller';

const router = Router();

router.post('/login', login);
router.post('/refresh', refresh);

router.use(requireAuth, requireDechubAdmin);

router.get('/talent-requests', listTalentRequests);
router.get('/marketplace-candidates', listMarketplaceCandidatesForAdmin);
router.get('/projects', listAdminProjects);
router.post('/projects', createProject);
router.post('/projects/:id/send-contract', sendProjectContract);
router.post('/projects/:id/verify-payment', verifyProjectPayment);
router.get('/talent-requests/unread-count', unreadCount);
router.get('/talent-requests/:id', getTalentRequest);
router.post('/talent-requests/:id/mark-as-read', markAsRead);
router.patch('/talent-requests/:id/status', updateTalentRequestStatus);
router.post('/talent-requests/:id/send-shortlist', sendTalentRequestShortlist);

export default router;
