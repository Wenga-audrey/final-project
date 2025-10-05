import { BaseController } from "../BaseController.js";
import { IntegrationService } from "../../services/integrations/IntegrationService.js";

const integrationService = new IntegrationService();

export class IntegrationController extends BaseController {
    /**
     * Integrate with calendar service
     */
    integrateWithCalendar = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const calendarData = req.body;

            const integration = await integrationService.integrateWithCalendar(userId, calendarData);

            return this.handleSuccess(res, { integration }, 'Calendar integration successful');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Get user's calendar integration
     */
    getUserCalendarIntegration = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { provider } = req.params;

            const integration = await integrationService.getUserCalendarIntegration(userId, provider);

            if (!integration) {
                return this.handleError(res, 'Calendar integration not found', 404);
            }

            return this.handleSuccess(res, { integration }, 'Calendar integration retrieved successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Sync study schedule with calendar
     */
    syncStudyScheduleWithCalendar = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const scheduleData = req.body;

            const event = await integrationService.syncStudyScheduleWithCalendar(userId, scheduleData);

            return this.handleSuccess(res, { event }, 'Study schedule synced with calendar successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Share achievement on social media
     */
    shareAchievementOnSocialMedia = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { achievementId, platform } = req.body;

            const result = await integrationService.shareAchievementOnSocialMedia(userId, achievementId, platform);

            return this.handleSuccess(res, result, 'Achievement shared successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Integrate with external educational resources
     */
    integrateEducationalResource = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const resourceData = req.body;

            const integration = await integrationService.integrateEducationalResource(userId, resourceData);

            return this.handleSuccess(res, { integration }, 'Educational resource integrated successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Get user's educational resource integrations
     */
    getUserEducationalIntegrations = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;

            const integrations = await integrationService.getUserEducationalIntegrations(userId);

            return this.handleSuccess(res, { integrations }, 'Educational integrations retrieved successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Create API token for third-party integrations
     */
    createAPIToken = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const tokenData = req.body;

            const result = await integrationService.createAPIToken(userId, tokenData);

            // Don't send the actual token in the response for security
            const response = {
                id: result.apiToken.id,
                name: result.apiToken.name,
                permissions: result.apiToken.permissions,
                createdAt: result.apiToken.createdAt,
                expiresAt: result.apiToken.expiresAt
            };

            return this.handleSuccess(res, { token: response }, 'API token created successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Get user's API tokens
     */
    getUserAPITokens = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;

            const tokens = await integrationService.getUserAPITokens(userId);

            return this.handleSuccess(res, { tokens }, 'API tokens retrieved successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Revoke API token
     */
    revokeAPIToken = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { tokenId } = req.params;

            const token = await integrationService.revokeAPIToken(userId, tokenId);

            return this.handleSuccess(res, { token }, 'API token revoked successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });
}