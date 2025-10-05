import { BaseController } from "../BaseController.js";
import { AccessibilityService } from "../../services/accessibility/AccessibilityService.js";

const accessibilityService = new AccessibilityService();

export class AccessibilityController extends BaseController {
    /**
     * Set user accessibility preferences
     */
    setUserAccessibilityPreferences = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const preferences = req.body;

            const accessibilityPrefs = await accessibilityService.setUserAccessibilityPreferences(userId, preferences);

            return this.handleSuccess(res, { preferences: accessibilityPrefs }, 'Accessibility preferences updated successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Get user accessibility preferences
     */
    getUserAccessibilityPreferences = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;

            const preferences = await accessibilityService.getUserAccessibilityPreferences(userId);

            return this.handleSuccess(res, { preferences }, 'Accessibility preferences retrieved successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Generate screen reader friendly content
     */
    generateScreenReaderContent = this.asyncHandler(async (req, res) => {
        try {
            const { contentId } = req.params;

            const content = await accessibilityService.generateScreenReaderContent(contentId);

            return this.handleSuccess(res, { content }, 'Screen reader friendly content generated successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Generate high contrast version of content
     */
    generateHighContrastContent = this.asyncHandler(async (req, res) => {
        try {
            const { contentId } = req.params;

            const content = await accessibilityService.generateHighContrastContent(contentId);

            return this.handleSuccess(res, { content }, 'High contrast content generated successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Generate text-to-speech version of content
     */
    generateTextToSpeechContent = this.asyncHandler(async (req, res) => {
        try {
            const { contentId } = req.params;

            const content = await accessibilityService.generateTextToSpeechContent(contentId);

            return this.handleSuccess(res, { content }, 'Text-to-speech content generated successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Validate keyboard navigation for content
     */
    validateKeyboardNavigation = this.asyncHandler(async (req, res) => {
        try {
            const { contentId } = req.params;

            const validation = await accessibilityService.validateKeyboardNavigation(contentId);

            return this.handleSuccess(res, { validation }, 'Keyboard navigation validation completed');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Get accessibility report for user
     */
    getAccessibilityReport = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;

            const report = await accessibilityService.getAccessibilityReport(userId);

            return this.handleSuccess(res, { report }, 'Accessibility report generated successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });
}