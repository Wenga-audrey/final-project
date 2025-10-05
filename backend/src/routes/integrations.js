import express from "express";
import { authenticate } from '../middleware/auth.js';
import { IntegrationController } from '../controllers/integrations/IntegrationController.js';

const router = express.Router();
const integrationController = new IntegrationController();

// Calendar integration routes
router.post('/calendar/:provider', authenticate, integrationController.integrateWithCalendar);
router.get('/calendar/:provider', authenticate, integrationController.getUserCalendarIntegration);
router.post('/calendar/sync', authenticate, integrationController.syncStudyScheduleWithCalendar);

// Social media sharing routes
router.post('/social-share', authenticate, integrationController.shareAchievementOnSocialMedia);

// Educational resource integration routes
router.post('/educational-resources', authenticate, integrationController.integrateEducationalResource);
router.get('/educational-resources', authenticate, integrationController.getUserEducationalIntegrations);

// API token routes
router.post('/api-tokens', authenticate, integrationController.createAPIToken);
router.get('/api-tokens', authenticate, integrationController.getUserAPITokens);
router.delete('/api-tokens/:tokenId', authenticate, integrationController.revokeAPIToken);

export default router;