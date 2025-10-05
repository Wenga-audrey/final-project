import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { AdaptiveLearningController } from '../controllers/adaptiveLearning/AdaptiveLearningController.js';

const router = express.Router();
const adaptiveLearningController = new AdaptiveLearningController();

// Get user's learning profile
router.get('/profile', authenticate, adaptiveLearningController.getLearningProfile);

// Generate personalized learning path
router.post('/learning-path', authenticate, adaptiveLearningController.generateLearningPath);

// Get question recommendations
router.get('/recommendations/questions', authenticate, adaptiveLearningController.getQuestionRecommendations);

// Identify weak areas
router.get('/weak-areas', authenticate, adaptiveLearningController.identifyWeakAreas);

// Get progress analytics
router.get('/analytics', authenticate, adaptiveLearningController.getProgressAnalytics);

export default router;