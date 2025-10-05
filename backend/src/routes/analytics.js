import express from "express";
import { authenticate } from '../middleware/auth.js';
import { AnalyticsController } from '../controllers/analytics/AnalyticsController.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();
const analyticsController = new AnalyticsController();

// Progress tracking dashboard
router.get('/progress-dashboard', authenticate, analyticsController.getProgressTrackingDashboard);

// Performance trend analysis
router.get('/trend-analysis', authenticate, analyticsController.getPerformanceTrendAnalysis);

// Predictive success modeling
router.get('/predictive-modeling', authenticate, analyticsController.getPredictiveSuccessModeling);

// Exportable reports
router.get('/export-report', authenticate, analyticsController.generateExportableReport);

// Class analytics (teacher only)
router.get('/class/:classId', authenticate, ...analyticsController.getClassAnalytics);

export default router;
