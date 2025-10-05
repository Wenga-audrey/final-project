import { BaseController } from "../BaseController.js";
import { AdaptiveLearningService } from "../../services/adaptiveLearning/AdaptiveLearningService.js";

const adaptiveLearningService = new AdaptiveLearningService();

export class AdaptiveLearningController extends BaseController {
    /**
     * Get user's learning profile
     */
    getLearningProfile = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const profile = await adaptiveLearningService.buildLearningProfile(userId);

            return this.handleSuccess(res, { profile }, 'Learning profile retrieved successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Generate personalized learning path
     */
    generateLearningPath = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { examType, targetDate, availableHours = 2 } = req.body;

            if (!targetDate) {
                return this.handleError(res, 'Target date is required', 400);
            }

            const learningPath = await adaptiveLearningService.generatePersonalizedLearningPath(
                userId,
                examType,
                new Date(targetDate),
                parseInt(availableHours)
            );

            return this.handleSuccess(res, { learningPath }, 'Personalized learning path generated successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Get question recommendations
     */
    getQuestionRecommendations = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { count = 10 } = req.query;

            const questions = await adaptiveLearningService.generateQuestionRecommendations(
                userId,
                parseInt(count)
            );

            return this.handleSuccess(res, { questions }, 'Question recommendations generated successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Identify weak areas
     */
    identifyWeakAreas = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const weakAreas = await adaptiveLearningService.identifyWeakAreas(userId);

            return this.handleSuccess(res, { weakAreas }, 'Weak areas identified successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Get progress analytics
     */
    getProgressAnalytics = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const analytics = await adaptiveLearningService.generateProgressAnalytics(userId);

            return this.handleSuccess(res, { analytics }, 'Progress analytics generated successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });
}