import express from "express";
import { authenticate } from '../middleware/auth.js';
import { ContentManagementController } from '../controllers/contentManagement/ContentManagementController.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();
const contentManagementController = new ContentManagementController();

// Multimedia content routes
router.post('/lessons/:lessonId/multimedia', authenticate, ...contentManagementController.addMultimediaContent);
router.get('/lessons/:lessonId/multimedia', authenticate, contentManagementController.getLessonMultimediaContent);

// Interactive simulation routes
router.post('/simulations', authenticate, ...contentManagementController.createInteractiveSimulation);
router.get('/lessons/:lessonId/simulations', authenticate, contentManagementController.getLessonSimulations);

// Content versioning routes
router.post('/content/:contentId/versions', authenticate, ...contentManagementController.createContentVersion);
router.get('/content/:contentId/versions', authenticate, ...contentManagementController.getContentVersionHistory);

// Multilingual content routes
router.post('/content/:contentId/languages/:language', authenticate, ...contentManagementController.addMultilingualContent);
router.get('/content/:contentId/languages/:language', authenticate, contentManagementController.getContentInLanguage);
router.get('/content/:contentId/languages', authenticate, contentManagementController.getAllLanguageVersions);

export default router;