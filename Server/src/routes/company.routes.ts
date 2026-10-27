import { Router } from 'express';
import {
  saveIdentity,
  saveBusinessDetails,
  submitKyb,
  getKybStatus,
  saveBilling,
  createSetupIntent,
  savePreferences,
  getMyCompany,
} from '../controllers/company.controller';
import {
  listCompanyTalentRequests,
  getCompanyTalentRequest,
  acceptSuggestedTalent,
  getTalentRequestHirePrefill,
  claimShortlistedTalentRequest,
  switchShortlistedTalentRequestProfile,
} from '../controllers/companyTalentRequests.controller';
import {
  acceptProjectContract,
  createProjectTask,
  listCompanyNotifications,
  listCompanyProjects,
  listCompanyProjectTasks,
  markCompanyNotificationRead,
  submitProjectPayment,
} from '../controllers/projects.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { kybUpload } from '../middleware/upload.middleware';

const router = Router();

// All company routes require auth
router.use(requireAuth);

router.get  ('/me',             getMyCompany);
router.post ('/identity',       saveIdentity);           // Step 2
router.post ('/business',       saveBusinessDetails);    // Step 3
router.post ('/kyb',            kybUpload, submitKyb);   // Step 4
router.get  ('/kyb/status',     getKybStatus);
router.post ('/billing/setup-intent', createSetupIntent);
router.post ('/billing',        saveBilling);            // Step 5
router.post ('/preferences',    savePreferences);        // Step 6
router.get  ('/projects', listCompanyProjects);
router.post ('/projects/:id/accept-contract', acceptProjectContract);
router.get  ('/projects/:id/tasks', listCompanyProjectTasks);
router.post ('/projects/:id/tasks', createProjectTask);
router.post ('/projects/:id/payment-submission', submitProjectPayment);
router.get  ('/notifications', listCompanyNotifications);
router.post ('/notifications/:id/read', markCompanyNotificationRead);
router.get  ('/talent-requests', listCompanyTalentRequests);
router.get  ('/talent-requests/:id', getCompanyTalentRequest);
router.post ('/talent-requests/:id/accept-suggestion', acceptSuggestedTalent);
router.post ('/talent-requests/:id/claim-shortlist', claimShortlistedTalentRequest);
router.post ('/talent-requests/:id/switch-shortlist-profile', switchShortlistedTalentRequestProfile);
router.get  ('/talent-requests/:id/hire-prefill', getTalentRequestHirePrefill);

export default router;
