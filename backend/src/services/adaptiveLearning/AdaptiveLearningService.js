import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { createAIService } from "../../lib/aiService.js";

const prisma = new PrismaClient();
const aiService = createAIService();

export class AdaptiveLearningService {
    /**
     * Build comprehensive learning profile for a user
     */
    async buildLearningProfile(userId) {
        // Get user's study sessions
        const studySessions = await prisma.studySession.findMany({
            where: { userId },
            orderBy: { startTime: 'desc' },
            take: 50
        });

        // Get user's assessment results
        const assessmentResults = await prisma.quizResult.findMany({
            where: { userId },
            include: {
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
                },
                subjectQuiz: {
                    include: {
                        subject: {
                            include: {
                                class: true
                            }
                        }
                    }
                }
            },
            orderBy: { completedAt: 'desc' },
            take: 30
        });

        // Calculate optimal session length
        const sessionDurations = studySessions
            .filter(s => s.endTime)
            .map(s => (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / (1000 * 60));

        const optimalSessionLength = sessionDurations.length > 0
            ? Math.round(sessionDurations.reduce((sum, duration) => sum + duration, 0) / sessionDurations.length)
            : 30;

        // Analyze subject performance
        const subjectPerformance = new Map();
        assessmentResults.forEach(result => {
            const subject = result.chapterQuiz?.chapter?.subject?.name ||
                result.subjectQuiz?.subject?.name ||
                'General';
            const score = result.score;

            if (!subjectPerformance.has(subject)) {
                subjectPerformance.set(subject, []);
            }
            subjectPerformance.get(subject).push(score);
        });

        const strongSubjects = Array.from(subjectPerformance.entries())
            .filter(([_, scores]) => scores.length >= 2 && scores.reduce((sum, s) => sum + s, 0) / scores.length >= 75)
            .map(([subject]) => subject);

        const weakSubjects = Array.from(subjectPerformance.entries())
            .filter(([_, scores]) => scores.length >= 2 && scores.reduce((sum, s) => sum + s, 0) / scores.length < 65)
            .map(([subject]) => subject);

        // Calculate retention rate (improvement over time)
        const recentScores = assessmentResults.slice(0, 10).map(r => r.score);
        const olderScores = assessmentResults.slice(10, 20).map(r => r.score);

        let retentionRate = 0.7; // Default
        if (recentScores.length > 0 && olderScores.length > 0) {
            const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
            const olderAvg = olderScores.reduce((sum, score) => sum + score, 0) / olderScores.length;
            retentionRate = Math.max(0.1, Math.min(0.9, (recentAvg - olderAvg) / 100 + 0.7));
        }

        // Analyze preferred time slots
        const hourCounts = new Map();
        studySessions.forEach(session => {
            const hour = new Date(session.startTime).getHours();
            hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
        });

        const preferredTimeSlots = Array.from(hourCounts.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([hour]) => `${hour.toString().padStart(2, '0')}:00`);

        // Determine learning style based on session patterns
        let learningStyle = 'mixed';
        if (optimalSessionLength > 60) {
            learningStyle = 'deep';
        } else if (optimalSessionLength < 20) {
            learningStyle = 'focused';
        } else {
            learningStyle = 'balanced';
        }

        return {
            userId,
            learningStyle,
            difficultyPreference: 'adaptive',
            retentionRate,
            strongSubjects,
            weakSubjects,
            optimalSessionLength,
            preferredTimeSlots,
            totalAssessments: assessmentResults.length,
            averageScore: assessmentResults.length > 0
                ? Math.round(assessmentResults.reduce((sum, r) => sum + r.score, 0) / assessmentResults.length)
                : 0
        };
    }

    /**
     * Generate personalized learning path
     */
    async generatePersonalizedLearningPath(userId, examType, targetDate, availableHours = 2) {
        const profile = await this.buildLearningProfile(userId);

        // Get user's enrollments
        const enrollments = await prisma.enrollment.findMany({
            where: { userId },
            include: {
                class: {
                    include: {
                        subjects: {
                            include: {
                                chapters: {
                                    include: {
                                        lessons: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Filter enrollments by exam type if specified
        const relevantEnrollments = examType
            ? enrollments.filter(e => e.class.examType === examType)
            : enrollments;

        if (relevantEnrollments.length === 0) {
            throw new Error('No relevant courses found for the specified exam type');
        }

        // Get user's progress
        const chapterProgress = await prisma.chapterProgress.findMany({
            where: { userId },
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

        // Identify incomplete chapters
        const incompleteChapters = [];
        relevantEnrollments.forEach(enrollment => {
            enrollment.class.subjects.forEach(subject => {
                subject.chapters.forEach(chapter => {
                    const progress = chapterProgress.find(cp => cp.chapterId === chapter.id);
                    if (!progress || !progress.isCompleted) {
                        incompleteChapters.push({
                            id: chapter.id,
                            title: chapter.title,
                            subject: subject.name,
                            class: enrollment.class.name,
                            examType: enrollment.class.examType,
                            isWeakSubject: profile.weakSubjects.includes(subject.name)
                        });
                    }
                });
            });
        });

        // Sort chapters by priority (weak subjects first, then by creation order)
        incompleteChapters.sort((a, b) => {
            if (a.isWeakSubject && !b.isWeakSubject) return -1;
            if (!a.isWeakSubject && b.isWeakSubject) return 1;
            return 0;
        });

        // Generate AI-powered learning path
        const userProfile = {
            id: userId,
            learningStyle: profile.learningStyle,
            strongSubjects: profile.strongSubjects,
            weakSubjects: profile.weakSubjects,
            averageScore: profile.averageScore,
            optimalSessionLength: profile.optimalSessionLength
        };

        const goals = {
            examType: examType || 'General',
            targetDate,
            chaptersToComplete: incompleteChapters.length
        };

        try {
            const aiResponse = await aiService.generateLearningPath(userProfile, goals, availableHours);

            if (aiResponse.success) {
                try {
                    const aiPath = JSON.parse(aiResponse.content);
                    return {
                        ...aiPath,
                        chapters: incompleteChapters.slice(0, 20) // Limit to 20 chapters
                    };
                } catch (parseError) {
                    console.error('Failed to parse AI learning path:', parseError);
                }
            }
        } catch (aiError) {
            console.error('AI learning path generation failed:', aiError);
        }

        // Fallback to simple path generation
        return {
            studyPlan: {
                totalDuration: `${Math.ceil(incompleteChapters.length / 5)} weeks`,
                dailyHours: availableHours,
                phases: [
                    {
                        phase: "Foundation Building",
                        duration: "2 weeks",
                        topics: profile.weakSubjects,
                        goals: "Strengthen weak areas"
                    },
                    {
                        phase: "Comprehensive Review",
                        duration: `${Math.max(1, Math.ceil(incompleteChapters.length / 5) - 2)} weeks`,
                        topics: incompleteChapters.map(c => c.subject),
                        goals: "Complete all remaining chapters"
                    }
                ],
                recommendations: [
                    "Focus 60% of study time on weak subjects",
                    "Take a practice quiz after each chapter",
                    "Review previous chapters weekly"
                ],
                milestones: [
                    "Complete all weak subject chapters",
                    "Achieve 80% average on practice quizzes",
                    "Finish entire curriculum"
                ]
            },
            chapters: incompleteChapters.slice(0, 20)
        };
    }

    /**
     * Generate intelligent question recommendations
     */
    async generateQuestionRecommendations(userId, count = 10) {
        const profile = await this.buildLearningProfile(userId);

        // Get user's recent incorrect answers
        const recentResults = await prisma.quizResult.findMany({
            where: { userId },
            include: { answers: true },
            orderBy: { completedAt: 'desc' },
            take: 5
        });

        // Extract weak areas from incorrect answers
        const weakAreas = [];
        recentResults.forEach(result => {
            if (result.answers) {
                result.answers.forEach(answer => {
                    if (!answer.isCorrect) {
                        weakAreas.push({
                            question: answer.question,
                            userAnswer: answer.userAnswer,
                            correctAnswer: answer.correctAnswer,
                            topic: 'General'
                        });
                    }
                });
            }
        });

        // Generate AI-powered question recommendations
        try {
            const aiResponse = await aiService.generateAdaptiveQuizQuestions(
                { weakAreas, userProfile: profile },
                'adaptive',
                { questionCount: count, difficulty: 'MEDIUM' }
            );

            if (aiResponse.success) {
                try {
                    const questions = JSON.parse(aiResponse.content);
                    return questions;
                } catch (parseError) {
                    console.error('Failed to parse AI questions:', parseError);
                }
            }
        } catch (aiError) {
            console.error('AI question generation failed:', aiError);
        }

        // Fallback to default questions
        return Array.from({ length: count }, (_, i) => ({
            question: `Question ${i + 1} based on your learning profile`,
            options: [
                "Option A",
                "Option B",
                "Option C",
                "Option D"
            ],
            correctAnswer: "Option A",
            explanation: "This is a sample explanation based on your learning needs",
            difficulty: "MEDIUM",
            topic: "Adaptive Learning",
            points: 1
        }));
    }

    /**
     * Identify weak areas for targeted practice
     */
    async identifyWeakAreas(userId) {
        const profile = await this.buildLearningProfile(userId);

        // Get detailed performance by chapter
        const chapterResults = await prisma.quizResult.findMany({
            where: { userId },
            include: {
                chapterQuiz: {
                    include: {
                        chapter: {
                            include: {
                                subject: true
                            }
                        }
                    }
                }
            },
            orderBy: { completedAt: 'desc' },
            take: 50
        });

        // Group results by chapter and calculate performance
        const chapterPerformance = new Map();
        chapterResults.forEach(result => {
            if (result.chapterQuiz && result.chapterQuiz.chapter) {
                const chapterId = result.chapterQuiz.chapter.id;
                const chapterTitle = result.chapterQuiz.chapter.title;
                const subjectName = result.chapterQuiz.chapter.subject.name;

                if (!chapterPerformance.has(chapterId)) {
                    chapterPerformance.set(chapterId, {
                        title: chapterTitle,
                        subject: subjectName,
                        scores: [],
                        attempts: 0
                    });
                }

                const chapterData = chapterPerformance.get(chapterId);
                chapterData.scores.push(result.score);
                chapterData.attempts++;
            }
        });

        // Calculate average scores and identify weak chapters
        const weakChapters = [];
        const strongChapters = [];

        chapterPerformance.forEach((data, chapterId) => {
            const averageScore = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length;
            const chapterInfo = {
                id: chapterId,
                title: data.title,
                subject: data.subject,
                averageScore: Math.round(averageScore),
                attempts: data.attempts
            };

            if (averageScore < 65) {
                weakChapters.push(chapterInfo);
            } else if (averageScore > 80) {
                strongChapters.push(chapterInfo);
            }
        });

        // Sort by performance
        weakChapters.sort((a, b) => a.averageScore - b.averageScore);
        strongChapters.sort((b, a) => a.averageScore - b.averageScore);

        return {
            profile,
            weakChapters: weakChapters.slice(0, 10), // Top 10 weak chapters
            strongChapters: strongChapters.slice(0, 10), // Top 10 strong chapters
            recommendations: [
                {
                    type: "focus",
                    title: "Focus on weak areas",
                    description: `You should prioritize studying: ${weakChapters.slice(0, 3).map(w => w.title).join(', ')}`
                },
                {
                    type: "review",
                    title: "Review strong areas",
                    description: "Regularly review your strong areas to maintain proficiency"
                },
                {
                    type: "practice",
                    title: "Practice with targeted quizzes",
                    description: "Take quizzes focused on your weak chapters to improve"
                }
            ]
        };
    }

    /**
     * Generate progress analytics and learning insights
     */
    async generateProgressAnalytics(userId) {
        const profile = await this.buildLearningProfile(userId);

        // Get user's study history
        const studySessions = await prisma.studySession.findMany({
            where: { userId },
            orderBy: { startTime: 'asc' }
        });

        // Get assessment history
        const assessmentResults = await prisma.quizResult.findMany({
            where: { userId },
            orderBy: { completedAt: 'asc' }
        });

        // Calculate study trends
        const studyTrends = {
            totalSessions: studySessions.length,
            totalStudyTime: studySessions.reduce((sum, session) => {
                if (session.endTime) {
                    return sum + (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / (1000 * 60);
                }
                return sum;
            }, 0),
            weeklyAverage: 0,
            streak: 0
        };

        // Calculate weekly average
        if (studySessions.length > 0) {
            const firstSession = new Date(studySessions[0].startTime);
            const lastSession = new Date(studySessions[studySessions.length - 1].startTime);
            const weeks = Math.ceil((lastSession - firstSession) / (7 * 24 * 60 * 60 * 1000));
            studyTrends.weeklyAverage = weeks > 0 ? Math.round(studyTrends.totalStudyTime / weeks) : 0;
        }

        // Calculate current streak
        let currentStreak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        const sessionDates = new Set(studySessions.map(session => {
            const date = new Date(session.startTime);
            date.setHours(0, 0, 0, 0);
            return date.getTime();
        }));

        while (sessionDates.has(currentDate.getTime())) {
            currentStreak++;
            currentDate.setDate(currentDate.getDate() - 1);
        }

        studyTrends.streak = currentStreak;

        // Assessment trends
        const assessmentTrends = {
            totalAssessments: assessmentResults.length,
            averageScore: assessmentResults.length > 0
                ? Math.round(assessmentResults.reduce((sum, result) => sum + result.score, 0) / assessmentResults.length)
                : 0,
            highestScore: assessmentResults.length > 0
                ? Math.max(...assessmentResults.map(r => r.score))
                : 0,
            lowestScore: assessmentResults.length > 0
                ? Math.min(...assessmentResults.map(r => r.score))
                : 0,
            improvement: 0
        };

        // Calculate improvement (difference between first and last third of assessments)
        if (assessmentResults.length >= 6) {
            const firstThird = assessmentResults.slice(0, Math.floor(assessmentResults.length / 3));
            const lastThird = assessmentResults.slice(-Math.floor(assessmentResults.length / 3));

            const firstAvg = firstThird.reduce((sum, r) => sum + r.score, 0) / firstThird.length;
            const lastAvg = lastThird.reduce((sum, r) => sum + r.score, 0) / lastThird.length;

            assessmentTrends.improvement = Math.round(lastAvg - firstAvg);
        }

        // Generate AI-powered insights
        try {
            const aiResponse = await aiService.analyzePerformance(assessmentResults, studyTrends.totalStudyTime);

            if (aiResponse.success) {
                try {
                    const insights = JSON.parse(aiResponse.content);
                    return {
                        profile,
                        studyTrends,
                        assessmentTrends,
                        aiInsights: insights
                    };
                } catch (parseError) {
                    console.error('Failed to parse AI insights:', parseError);
                }
            }
        } catch (aiError) {
            console.error('AI insights generation failed:', aiError);
        }

        // Fallback insights
        return {
            profile,
            studyTrends,
            assessmentTrends,
            aiInsights: {
                overallPerformance: assessmentTrends.averageScore >= 80 ? 'excellent' :
                    assessmentTrends.averageScore >= 65 ? 'good' :
                        assessmentTrends.averageScore >= 50 ? 'average' : 'needs_improvement',
                strengths: profile.strongSubjects,
                weaknesses: profile.weakSubjects,
                recommendations: [
                    "Maintain consistent study schedule",
                    "Focus on weak subject areas",
                    "Take regular practice quizzes"
                ],
                studyStrategy: `Based on your ${profile.learningStyle} learning style, we recommend ${profile.optimalSessionLength}-minute study sessions`,
                motivationalMessage: "You're making great progress! Keep up the consistent effort.",
                predictedOutcome: studyTrends.streak > 3
                    ? "Your consistent study habits suggest strong potential for success"
                    : "Establishing a regular study routine will help improve your performance"
            }
        };
    }
}