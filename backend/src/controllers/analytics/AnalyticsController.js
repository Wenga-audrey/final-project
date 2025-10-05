import { BaseController } from "../BaseController.js";
import { AnalyticsService } from "../../services/analytics/AnalyticsService.js";
import { requireRole } from "../../middleware/auth.js";

const analyticsService = new AnalyticsService();

export class AnalyticsController extends BaseController {
    /**
     * Get progress tracking dashboard
     */
    getProgressTrackingDashboard = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { period = '30' } = req.query;

            const dashboard = await analyticsService.getProgressTrackingDashboard(userId, period);

            return this.handleSuccess(res, { dashboard }, 'Progress tracking dashboard retrieved successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Get performance trend analysis
     */
    getPerformanceTrendAnalysis = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { period = '90' } = req.query;

            const analysis = await analyticsService.getPerformanceTrendAnalysis(userId, period);

            return this.handleSuccess(res, { analysis }, 'Performance trend analysis retrieved successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Get predictive success modeling
     */
    getPredictiveSuccessModeling = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { examModuleId } = req.query;

            if (!examModuleId) {
                return this.handleError(res, 'Exam module ID is required', 400);
            }

            const prediction = await analyticsService.getPredictiveSuccessModeling(userId, examModuleId);

            return this.handleSuccess(res, { prediction }, 'Predictive success modeling retrieved successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Generate exportable report
     */
    generateExportableReport = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { format = 'json' } = req.query;

            const report = await analyticsService.generateExportableReport(userId, format);

            // Set appropriate headers for download
            if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=progress-report.csv');
            } else if (format === 'pdf') {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename=progress-report.pdf');
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', 'attachment; filename=progress-report.json');
            }

            return res.send(report);
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Get class analytics (teacher only)
     */
    getClassAnalytics = [
        requireRole(['TEACHER', 'PREP_ADMIN', 'SUPER_ADMIN']),
        this.asyncHandler(async (req, res) => {
            try {
                const teacherId = req.user.id;
                const { classId } = req.params;

                if (!classId) {
                    return this.handleError(res, 'Class ID is required', 400);
                }

                const analytics = await analyticsService.getClassAnalytics(teacherId, classId);

                return this.handleSuccess(res, { analytics }, 'Class analytics retrieved successfully');
            } catch (error) {
                return this.handleServerError(res, error);
            }
        })
    ];
}