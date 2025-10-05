import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { createAIService } from "../../lib/aiService.js";

const prisma = new PrismaClient();
const aiService = createAIService();

export class AnalyticsService {
    /**
     * Get detailed progress tracking dashboards
     */
    async getProgressTrackingDashboard(userId, period = '30') {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(period));

        // Get user's study sessions
        const studySessions = await prisma.studySession.findMany({
            where: {
                userId,
                startTime: { gte: startDate }
            },
            orderBy: { startTime: 'asc' }
        });

        // Get user's quiz results
        const quizResults = await prisma.quizResult.findMany({
            where: {
                userId,
                completedAt: { gte: startDate }
            },
            include: {
                subjectQuiz: {
                    include: {
                        subject: {
                            include: {
                                class: true
                            }
                        }
                    }
                },
                chapterQuiz: {
                    include: {
                        chapter: {
                            include: {
                                subject: {
                                    include: {
                                        class: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { completedAt: 'asc' }
        });

        // Get user's lesson progress
        const lessonProgress = await prisma.chapterProgress.findMany({
            where: {
                userId,
                createdAt: { gte: startDate }
            },
            include: {
                chapter: {
                    include: {
                        subject: {
                            include: {
                                class: true
                            }
                        }
                    }
                }
            }
        });

        // Calculate study time trends
        const studyTimeTrends = this.calculateStudyTimeTrends(studySessions);

        // Calculate quiz performance trends
        const quizPerformanceTrends = this.calculateQuizPerformanceTrends(quizResults);

        // Calculate subject performance
        const subjectPerformance = this.calculateSubjectPerformance(quizResults);

        // Calculate lesson completion rates
        const lessonCompletion = this.calculateLessonCompletion(lessonProgress);

        return {
            studyTimeTrends,
            quizPerformanceTrends,
            subjectPerformance,
            lessonCompletion,
            totalStudyTime: studyTimeTrends.totalMinutes,
            averageQuizScore: quizPerformanceTrends.averageScore,
            completedLessons: lessonCompletion.completed,
            totalLessons: lessonCompletion.total
        };
    }

    /**
     * Calculate study time trends
     */
    calculateStudyTimeTrends(studySessions) {
        const dailyStudyTime = {};
        let totalMinutes = 0;

        studySessions.forEach(session => {
            if (session.endTime) {
                const date = session.startTime.toISOString().split('T')[0];
                const duration = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / (1000 * 60);

                if (!dailyStudyTime[date]) {
                    dailyStudyTime[date] = 0;
                }

                dailyStudyTime[date] += Math.round(duration);
                totalMinutes += duration;
            }
        });

        // Convert to array format for charting
        const trends = Object.entries(dailyStudyTime).map(([date, minutes]) => ({
            date,
            minutes: Math.round(minutes)
        }));

        return {
            trends,
            totalMinutes: Math.round(totalMinutes),
            averageDaily: trends.length > 0 ? Math.round(totalMinutes / trends.length) : 0
        };
    }

    /**
     * Calculate quiz performance trends
     */
    calculateQuizPerformanceTrends(quizResults) {
        const dailyScores = {};
        let totalScore = 0;

        quizResults.forEach(result => {
            const date = result.completedAt.toISOString().split('T')[0];
            const score = result.score;

            if (!dailyScores[date]) {
                dailyScores[date] = { total: 0, count: 0 };
            }

            dailyScores[date].total += score;
            dailyScores[date].count++;
            totalScore += score;
        });

        // Convert to array format for charting
        const trends = Object.entries(dailyScores).map(([date, data]) => ({
            date,
            averageScore: Math.round(data.total / data.count)
        }));

        return {
            trends,
            averageScore: quizResults.length > 0 ? Math.round(totalScore / quizResults.length) : 0,
            totalQuizzes: quizResults.length
        };
    }

    /**
     * Calculate subject performance
     */
    calculateSubjectPerformance(quizResults) {
        const subjectScores = {};

        quizResults.forEach(result => {
            const subject = result.subjectQuiz?.subject?.name ||
                result.chapterQuiz?.chapter?.subject?.name ||
                'General';
            const score = result.score;

            if (!subjectScores[subject]) {
                subjectScores[subject] = { total: 0, count: 0 };
            }

            subjectScores[subject].total += score;
            subjectScores[subject].count++;
        });

        // Convert to array format
        const performance = Object.entries(subjectScores).map(([subject, data]) => ({
            subject,
            averageScore: Math.round(data.total / data.count),
            quizCount: data.count
        }));

        return performance;
    }

    /**
     * Calculate lesson completion
     */
    calculateLessonCompletion(lessonProgress) {
        const completed = lessonProgress.filter(progress => progress.isCompleted).length;
        const total = lessonProgress.length;

        return {
            completed,
            total,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }

    /**
     * Get performance trend analysis
     */
    async getPerformanceTrendAnalysis(userId, period = '90') {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(period));

        // Get quiz results for trend analysis
        const quizResults = await prisma.quizResult.findMany({
            where: {
                userId,
                completedAt: { gte: startDate }
            },
            orderBy: { completedAt: 'asc' }
        });

        if (quizResults.length === 0) {
            return {
                trend: 'insufficient_data',
                improvement: 0,
                consistency: 0,
                recommendations: ['Take more quizzes to generate trend analysis']
            };
        }

        // Divide results into segments for trend analysis
        const segmentSize = Math.max(1, Math.floor(quizResults.length / 4));
        const segments = [];

        for (let i = 0; i < quizResults.length; i += segmentSize) {
            const segment = quizResults.slice(i, i + segmentSize);
            const average = segment.reduce((sum, result) => sum + result.score, 0) / segment.length;
            segments.push({
                start: segment[0].completedAt,
                end: segment[segment.length - 1].completedAt,
                average: Math.round(average),
                count: segment.length
            });
        }

        // Calculate improvement
        const firstSegment = segments[0];
        const lastSegment = segments[segments.length - 1];
        const improvement = lastSegment && firstSegment
            ? lastSegment.average - firstSegment.average
            : 0;

        // Calculate consistency (standard deviation)
        const scores = quizResults.map(r => r.score);
        const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length;
        const standardDeviation = Math.sqrt(variance);
        const consistency = Math.max(0, 100 - standardDeviation); // Invert so higher is better

        // Generate AI-powered recommendations
        let recommendations = [];
        try {
            const aiResponse = await aiService.generateStudySuggestions(
                [], // weak areas
                { averageScore: average, trend: improvement > 0 ? 'improving' : 'declining' },
                { userId, averageScore: average }
            );

            if (aiResponse.success) {
                const suggestions = JSON.parse(aiResponse.content);
                recommendations = suggestions.recommendedActions?.map(action => action.action) || [];
            }
        } catch (error) {
            console.error('AI recommendations failed:', error);
        }

        // Fallback recommendations
        if (recommendations.length === 0) {
            if (improvement > 5) {
                recommendations = [
                    'Continue your current study approach - it\'s working!',
                    'Focus on maintaining your improved performance',
                    'Challenge yourself with more difficult material'
                ];
            } else if (improvement < -5) {
                recommendations = [
                    'Review your study methods and try new approaches',
                    'Focus more time on weak subject areas',
                    'Consider joining a study group for additional support'
                ];
            } else {
                recommendations = [
                    'Maintain your consistent study schedule',
                    'Continue practicing with regular quizzes',
                    'Explore new study techniques to break through plateaus'
                ];
            }
        }

        return {
            segments,
            trend: improvement > 5 ? 'improving' : improvement < -5 ? 'declining' : 'stable',
            improvement: Math.round(improvement),
            consistency: Math.round(consistency),
            recommendations
        };
    }

    /**
     * Get predictive success modeling
     */
    async getPredictiveSuccessModeling(userId, examModuleId) {
        // Get user's performance history
        const quizResults = await prisma.quizResult.findMany({
            where: { userId },
            orderBy: { completedAt: 'desc' },
            take: 20
        });

        if (quizResults.length === 0) {
            return {
                prediction: 'insufficient_data',
                confidence: 0,
                recommendedActions: ['Take more practice quizzes to generate predictions']
            };
        }

        // Calculate recent performance metrics
        const recentScores = quizResults.slice(0, 10).map(r => r.score);
        const averageScore = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
        const trendScores = quizResults.slice(0, 5).map(r => r.score);
        const trendAverage = trendScores.reduce((sum, score) => sum + score, 0) / trendScores.length;

        // Get exam module details
        const examModule = await prisma.examModule.findUnique({
            where: { id: examModuleId }
        });

        const passingScore = examModule?.passingScore || 70;

        // Simple prediction model
        let probabilityOfSuccess = 0;
        let confidence = 70; // Base confidence

        if (averageScore >= passingScore) {
            probabilityOfSuccess = Math.min(95, 50 + (averageScore - passingScore) * 2);
        } else {
            probabilityOfSuccess = Math.max(5, 50 - (passingScore - averageScore) * 2);
        }

        // Adjust based on trend
        if (trendAverage > averageScore) {
            probabilityOfSuccess = Math.min(95, probabilityOfSuccess + 5);
        } else if (trendAverage < averageScore) {
            probabilityOfSuccess = Math.max(5, probabilityOfSuccess - 5);
            confidence = Math.max(50, confidence - 10);
        }

        // Generate AI-powered recommendations
        let recommendedActions = [];
        try {
            const aiResponse = await aiService.generateStudySuggestions(
                [], // weak areas
                {
                    averageScore: Math.round(averageScore),
                    trend: trendAverage > averageScore ? 'improving' :
                        trendAverage < averageScore ? 'declining' : 'stable'
                },
                {
                    userId,
                    averageScore: Math.round(averageScore),
                    targetScore: passingScore
                }
            );

            if (aiResponse.success) {
                const suggestions = JSON.parse(aiResponse.content);
                recommendedActions = suggestions.recommendedActions?.map(action => action.action) || [];
            }
        } catch (error) {
            console.error('AI recommendations failed:', error);
        }

        // Fallback recommendations
        if (recommendedActions.length === 0) {
            if (probabilityOfSuccess >= 80) {
                recommendedActions = [
                    'Continue your excellent preparation',
                    'Take a few more practice exams for confidence',
                    'Focus on maintaining your current performance level'
                ];
            } else if (probabilityOfSuccess >= 60) {
                recommendedActions = [
                    'Increase study time by 30 minutes daily',
                    'Focus on weak subject areas identified in previous quizzes',
                    'Take 2-3 more practice exams before the real test'
                ];
            } else {
                recommendedActions = [
                    'Significantly increase study time',
                    'Consider additional tutoring or study groups',
                    'Focus intensively on the lowest-performing subjects',
                    'Take daily practice quizzes to improve retention'
                ];
            }
        }

        return {
            probabilityOfSuccess: Math.round(probabilityOfSuccess),
            confidence: Math.round(confidence),
            currentAverage: Math.round(averageScore),
            passingScore,
            recommendedActions
        };
    }

    /**
     * Generate exportable reports
     */
    async generateExportableReport(userId, format = 'json') {
        // Get comprehensive user data
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                createdAt: true
            }
        });

        // Get progress tracking data
        const progressData = await this.getProgressTrackingDashboard(userId, '90');

        // Get performance trends
        const trendData = await this.getPerformanceTrendAnalysis(userId, '90');

        // Get achievements
        const achievementsData = await prisma.userAchievement.findMany({
            where: { userId },
            include: { achievement: true },
            orderBy: { unlockedAt: 'desc' }
        });

        // Get study streak
        const streakData = await prisma.learningStreak.findUnique({
            where: { userId }
        });

        // Compile report data
        const reportData = {
            user: {
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                memberSince: user.createdAt
            },
            progress: {
                totalStudyTime: progressData.totalStudyTime,
                averageQuizScore: progressData.averageQuizScore,
                lessonsCompleted: progressData.completedLessons,
                totalLessons: progressData.totalLessons,
                completionRate: progressData.lessonCompletion.completionRate
            },
            trends: {
                overallTrend: trendData.trend,
                improvement: trendData.improvement,
                consistency: trendData.consistency
            },
            achievements: {
                total: achievementsData.length,
                recent: achievementsData.slice(0, 5).map(a => ({
                    name: a.achievement.name,
                    unlockedAt: a.unlockedAt
                }))
            },
            streak: {
                current: streakData?.currentStreak || 0,
                longest: streakData?.longestStreak || 0
            },
            generatedAt: new Date()
        };

        // Format based on requested format
        if (format === 'csv') {
            return this.formatAsCSV(reportData);
        } else if (format === 'pdf') {
            return this.formatAsPDF(reportData);
        } else {
            return reportData;
        }
    }

    /**
     * Format report as CSV
     */
    formatAsCSV(reportData) {
        // This would typically use a CSV library
        // For now, returning a simple string representation
        return JSON.stringify(reportData, null, 2);
    }

    /**
     * Format report as PDF
     */
    formatAsPDF(reportData) {
        // This would typically use a PDF generation library
        // For now, returning a simple string representation
        return JSON.stringify(reportData, null, 2);
    }

    /**
     * Get class analytics for teachers
     */
    async getClassAnalytics(teacherId, classId) {
        // Verify teacher has access to this class
        const classData = await prisma.preparatoryClass.findFirst({
            where: {
                id: classId,
                teachers: {
                    some: {
                        teacherId
                    }
                }
            }
        });

        if (!classData) {
            throw new Error('Class not found or access denied');
        }

        // Get all students in the class
        const enrollments = await prisma.enrollment.findMany({
            where: { classId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        // Get quiz results for all students
        const studentIds = enrollments.map(e => e.userId);
        const quizResults = await prisma.quizResult.findMany({
            where: {
                userId: { in: studentIds }
            },
            include: {
                subjectQuiz: {
                    include: {
                        subject: true
                    }
                },
                chapterQuiz: {
                    include: {
                        chapter: {
                            include: {
                                subject: true
                            }
                        }
                    }
                }
            }
        });

        // Calculate class statistics
        const classAverage = quizResults.length > 0
            ? Math.round(quizResults.reduce((sum, result) => sum + result.score, 0) / quizResults.length)
            : 0;

        // Calculate subject averages
        const subjectScores = {};
        quizResults.forEach(result => {
            const subject = result.subjectQuiz?.subject?.name ||
                result.chapterQuiz?.chapter?.subject?.name ||
                'General';

            if (!subjectScores[subject]) {
                subjectScores[subject] = { total: 0, count: 0 };
            }

            subjectScores[subject].total += result.score;
            subjectScores[subject].count++;
        });

        const subjectAverages = Object.entries(subjectScores).map(([subject, data]) => ({
            subject,
            average: Math.round(data.total / data.count)
        }));

        // Get top performing students
        const studentPerformance = {};
        quizResults.forEach(result => {
            if (!studentPerformance[result.userId]) {
                studentPerformance[result.userId] = { total: 0, count: 0 };
            }

            studentPerformance[result.userId].total += result.score;
            studentPerformance[result.userId].count++;
        });

        const studentAverages = Object.entries(studentPerformance)
            .map(([studentId, data]) => ({
                studentId,
                average: Math.round(data.total / data.count)
            }))
            .sort((a, b) => b.average - a.average)
            .slice(0, 10);

        // Match student IDs to student data
        const topPerformers = studentAverages.map(studentAvg => {
            const enrollment = enrollments.find(e => e.userId === studentAvg.studentId);
            return {
                name: enrollment ? `${enrollment.user.firstName} ${enrollment.user.lastName}` : 'Unknown',
                average: studentAvg.average
            };
        });

        return {
            class: {
                name: classData.name,
                examType: classData.examType,
                studentCount: enrollments.length
            },
            performance: {
                classAverage,
                subjectAverages,
                topPerformers
            },
            activity: {
                totalQuizzes: quizResults.length,
                activeStudents: new Set(quizResults.map(r => r.userId)).size
            }
        };
    }
}