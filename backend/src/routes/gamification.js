import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { GamificationController } from '../controllers/gamification/GamificationController.js';

const router = express.Router();
const gamificationController = new GamificationController();

// Achievement routes
router.post('/achievements/award', authenticate, gamificationController.awardAchievement);
router.get('/achievements', authenticate, gamificationController.getUserAchievements);
router.post('/achievements/progress', authenticate, gamificationController.updateUserAchievementProgress);

// Leaderboard routes
router.get('/leaderboard', authenticate, gamificationController.getLeaderboard);

// Learning streak routes
router.post('/streak', authenticate, gamificationController.updateLearningStreak);
router.get('/streak', authenticate, gamificationController.getUserStreak);

// Daily goals routes
router.post('/daily-goals', authenticate, gamificationController.updateDailyGoals);
router.get('/daily-goals', authenticate, gamificationController.getUserDailyGoals);

// Virtual currency routes
router.get('/currency', authenticate, gamificationController.getVirtualCurrencyBalance);
router.post('/currency/award', authenticate, gamificationController.awardVirtualCurrency);

export default router;