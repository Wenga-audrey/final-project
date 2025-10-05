import express from "express";
import { authenticate } from '../middleware/auth.js';
import { AccessibilityController } from '../controllers/accessibility/AccessibilityController.js';

const router = express.Router();
const accessibilityController = new AccessibilityController();

// Accessibility preferences routes
router.post('/preferences', authenticate, accessibilityController.setUserAccessibilityPreferences);
router.get('/preferences', authenticate, accessibilityController.getUserAccessibilityPreferences);

// Content accessibility routes
router.get('/content/:contentId/screen-reader', authenticate, accessibilityController.generateScreenReaderContent);
router.get('/content/:contentId/high-contrast', authenticate, accessibilityController.generateHighContrastContent);
router.get('/content/:contentId/text-to-speech', authenticate, accessibilityController.generateTextToSpeechContent);
router.get('/content/:contentId/keyboard-validation', authenticate, accessibilityController.validateKeyboardNavigation);

// Accessibility reporting
router.get('/report', authenticate, accessibilityController.getAccessibilityReport);

export default router;