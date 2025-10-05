import { BaseController } from "../BaseController.js";
import { QuizService } from "../../services/quiz/QuizService.js";
import { requireRole } from "../../middleware/auth.js";

const quizService = new QuizService();

export class QuizController extends BaseController {
    /**
     * Create a timed practice exam
     */
    createPracticeExam = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const examConfig = req.body;

            const exam = await quizService.createPracticeExam(userId, examConfig);

            return this.handleSuccess(res, { exam }, 'Practice exam created successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Submit quiz answers
     */
    submitQuizAnswers = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { quizId, answers } = req.body;

            if (!quizId || !answers) {
                return this.handleError(res, 'Quiz ID and answers are required', 400);
            }

            const { result, feedback } = await quizService.submitQuizAnswers(userId, quizId, answers);

            return this.handleSuccess(res, { result, feedback }, 'Quiz submitted successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Get peer comparison
     */
    getPeerComparison = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { quizId } = req.params;

            if (!quizId) {
                return this.handleError(res, 'Quiz ID is required', 400);
            }

            const comparison = await quizService.getPeerComparison(userId, quizId);

            return this.handleSuccess(res, { comparison }, 'Peer comparison retrieved successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Create custom quiz (teacher only)
     */
    createCustomQuiz = [
        requireRole(['TEACHER', 'PREP_ADMIN', 'SUPER_ADMIN']),
        this.asyncHandler(async (req, res) => {
            try {
                const teacherId = req.user.id;
                const quizData = req.body;

                const quiz = await quizService.createCustomQuiz(teacherId, quizData);

                return this.handleSuccess(res, { quiz }, 'Custom quiz created successfully');
            } catch (error) {
                return this.handleServerError(res, error);
            }
        })
    ];

    /**
     * Get quiz history for a user
     */
    getQuizHistory = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { limit = 10 } = req.query;

            const history = await quizService.getQuizHistory(userId, parseInt(limit));

            return this.handleSuccess(res, { history }, 'Quiz history retrieved successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Get quiz statistics for a user
     */
    getQuizStatistics = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const statistics = await quizService.getQuizStatistics(userId);

            return this.handleSuccess(res, { statistics }, 'Quiz statistics retrieved successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Generate quiz report
     */
    generateQuizReport = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { quizId } = req.params;

            if (!quizId) {
                return this.handleError(res, 'Quiz ID is required', 400);
            }

            const report = await quizService.generateQuizReport(userId, quizId);

            return this.handleSuccess(res, { report }, 'Quiz report generated successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Create exam simulation
     */
    createExamSimulation = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { examModuleId, config } = req.body;

            if (!examModuleId) {
                return this.handleError(res, 'Exam module ID is required', 400);
            }

            const simulation = await quizService.createExamSimulation(userId, examModuleId, config);

            return this.handleSuccess(res, { simulation }, 'Exam simulation created successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });
}
