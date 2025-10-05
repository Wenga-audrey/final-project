import { BaseController } from "../BaseController.js";
import { ContentManagementService } from "../../services/contentManagement/ContentManagementService.js";
import { requireRole } from "../../middleware/auth.js";

const contentManagementService = new ContentManagementService();

export class ContentManagementController extends BaseController {
    /**
     * Add multimedia content to a lesson
     */
    addMultimediaContent = [
        requireRole(['TEACHER', 'CONTENT_CREATOR', 'ADMIN']),
        this.asyncHandler(async (req, res) => {
            try {
                const { lessonId } = req.params;
                const contentData = req.body;

                const content = await contentManagementService.addMultimediaContent(lessonId, contentData);

                return this.handleSuccess(res, { content }, 'Multimedia content added successfully');
            } catch (error) {
                return this.handleServerError(res, error);
            }
        })
    ];

    /**
     * Get all multimedia content for a lesson
     */
    getLessonMultimediaContent = this.asyncHandler(async (req, res) => {
        try {
            const { lessonId } = req.params;

            const content = await contentManagementService.getLessonMultimediaContent(lessonId);

            return this.handleSuccess(res, { content }, 'Multimedia content retrieved successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Create interactive simulation
     */
    createInteractiveSimulation = [
        requireRole(['TEACHER', 'CONTENT_CREATOR', 'ADMIN']),
        this.asyncHandler(async (req, res) => {
            try {
                const simulationData = req.body;

                const simulation = await contentManagementService.createInteractiveSimulation(simulationData);

                return this.handleSuccess(res, { simulation }, 'Interactive simulation created successfully');
            } catch (error) {
                return this.handleServerError(res, error);
            }
        })
    ];

    /**
     * Get interactive simulations for a lesson
     */
    getLessonSimulations = this.asyncHandler(async (req, res) => {
        try {
            const { lessonId } = req.params;

            const simulations = await contentManagementService.getLessonSimulations(lessonId);

            return this.handleSuccess(res, { simulations }, 'Interactive simulations retrieved successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Create content version
     */
    createContentVersion = [
        requireRole(['TEACHER', 'CONTENT_CREATOR', 'ADMIN']),
        this.asyncHandler(async (req, res) => {
            try {
                const { contentId } = req.params;
                const versionData = {
                    ...req.body,
                    authorId: req.user.id
                };

                const version = await contentManagementService.createContentVersion(contentId, versionData);

                return this.handleSuccess(res, { version }, 'Content version created successfully');
            } catch (error) {
                return this.handleServerError(res, error);
            }
        })
    ];

    /**
     * Get content version history
     */
    getContentVersionHistory = [
        requireRole(['TEACHER', 'CONTENT_CREATOR', 'ADMIN']),
        this.asyncHandler(async (req, res) => {
            try {
                const { contentId } = req.params;

                const versions = await contentManagementService.getContentVersionHistory(contentId);

                return this.handleSuccess(res, { versions }, 'Content version history retrieved successfully');
            } catch (error) {
                return this.handleServerError(res, error);
            }
        })
    ];

    /**
     * Add multilingual content
     */
    addMultilingualContent = [
        requireRole(['TEACHER', 'CONTENT_CREATOR', 'ADMIN', 'TRANSLATOR']),
        this.asyncHandler(async (req, res) => {
            try {
                const { contentId } = req.params;
                const { language } = req.params;
                const translationData = req.body;

                const content = await contentManagementService.addMultilingualContent(contentId, language, translationData);

                return this.handleSuccess(res, { content }, 'Multilingual content added successfully');
            } catch (error) {
                return this.handleServerError(res, error);
            }
        })
    ];

    /**
     * Get content in specific language
     */
    getContentInLanguage = this.asyncHandler(async (req, res) => {
        try {
            const { contentId, language } = req.params;

            const content = await contentManagementService.getContentInLanguage(contentId, language);

            if (!content) {
                return this.handleError(res, 'Content not found in specified language', 404);
            }

            return this.handleSuccess(res, { content }, 'Multilingual content retrieved successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Get all language versions of content
     */
    getAllLanguageVersions = this.asyncHandler(async (req, res) => {
        try {
            const { contentId } = req.params;

            const versions = await contentManagementService.getAllLanguageVersions(contentId);

            return this.handleSuccess(res, { versions }, 'All language versions retrieved successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });
}