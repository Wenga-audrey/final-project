import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { QuizController } from '../controllers/quiz/QuizController.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();
const quizController = new QuizController();

// Create a timed practice exam
router.post('/practice-exam', authenticate, quizController.createPracticeExam);

// Submit quiz answers
router.post('/submit', authenticate, quizController.submitQuizAnswers);

// Get peer comparison
router.get('/comparison/:quizId', authenticate, quizController.getPeerComparison);

// Create custom quiz (teacher only)
router.post('/custom', authenticate, requireRole('teacher'), quizController.createCustomQuiz);

// Get quiz history
router.get('/history', authenticate, quizController.getQuizHistory);

// Get quiz statistics
router.get('/statistics', authenticate, quizController.getQuizStatistics);

// Generate quiz report
router.get('/report/:quizId', authenticate, quizController.generateQuizReport);

// Create exam simulation
router.post('/simulation', authenticate, quizController.createExamSimulation);

export default router;