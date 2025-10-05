import { BaseController } from "../BaseController.js";
import { GamificationService } from "../../services/gamification/GamificationService.js";

const gamificationService = new GamificationService();

export class GamificationController extends BaseController {
    /**
     * Award achievement to user
     */
    awardAchievement = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { achievementId } = req.body;

            if (!achievementId) {
                return this.handleError(res, 'Achievement ID is required', 400);
            }

            const userAchievement = await gamificationService.awardAchievement(userId, achievementId);

            return this.handleSuccess(res, { userAchievement }, 'Achievement awarded successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Get user's achievements
     */
    getUserAchievements = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const achievements = await gamificationService.getUserAchievements(userId);

            return this.handleSuccess(res, { achievements }, 'User achievements retrieved successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Update user achievement progress
     */
    updateUserAchievementProgress = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { achievementId, progress } = req.body;

            if (!achievementId || progress === undefined) {
                return this.handleError(res, 'Achievement ID and progress are required', 400);
            }

            const result = await gamificationService.updateUserAchievementProgress(userId, achievementId, progress);

            return this.handleSuccess(res, result, 'Achievement progress updated successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Get leaderboard
     */
    getLeaderboard = this.asyncHandler(async (req, res) => {
        try {
            const { limit = 10 } = req.query;
            const leaderboard = await gamificationService.getLeaderboard(parseInt(limit));

            return this.handleSuccess(res, { leaderboard }, 'Leaderboard retrieved successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Update learning streak
     */
    updateLearningStreak = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const streak = await gamificationService.updateLearningStreak(userId);

            return this.handleSuccess(res, { streak }, 'Learning streak updated successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Get user's learning streak
     */
    getUserStreak = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const streak = await gamificationService.getUserStreak(userId);

            return this.handleSuccess(res, { streak }, 'Learning streak retrieved successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Update daily goals progress
     */
    updateDailyGoals = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { goalType, progress } = req.body;

            if (!goalType || progress === undefined) {
                return this.handleError(res, 'Goal type and progress are required', 400);
            }

            const updatedGoal = await gamificationService.updateDailyGoals(userId, goalType, progress);

            return this.handleSuccess(res, { goal: updatedGoal }, 'Daily goal updated successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Get user's daily goals
     */
    getUserDailyGoals = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const goals = await gamificationService.getUserDailyGoals(userId);

            return this.handleSuccess(res, { goals }, 'Daily goals retrieved successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Get virtual currency balance
     */
    getVirtualCurrencyBalance = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const balance = await gamificationService.getVirtualCurrencyBalance(userId);

            return this.handleSuccess(res, { balance }, 'Virtual currency balance retrieved successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Award virtual currency
     */
    awardVirtualCurrency = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { amount, reason } = req.body;

            if (!amount || !reason) {
                return this.handleError(res, 'Amount and reason are required', 400);
            }

            const result = await gamificationService.awardVirtualCurrency(userId, amount, reason);

            return this.handleSuccess(res, result, 'Virtual currency awarded successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });
}