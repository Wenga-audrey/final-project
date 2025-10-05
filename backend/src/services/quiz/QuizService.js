import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { createAIService } from "../../lib/aiService.js";

const prisma = new PrismaClient();
const aiService = createAIService();

export class QuizService {
    /**
     * Create a timed practice exam with realistic exam conditions
     */
    async createPracticeExam(userId, examConfig) {
        const {
            examType,
            subjectId,
            chapterId,
            timeLimit,
            questionCount = 20,
            difficulty = 'MEDIUM'
        } = examConfig;

        // Find relevant content based on parameters
        let content = null;
        let contentType = '';

        if (chapterId) {
            content = await prisma.chapter.findUnique({
                where: { id: chapterId },
                include: { lessons: true }
            });
            contentType = 'chapter';
        } else if (subjectId) {
            content = await prisma.subject.findUnique({
                where: { id: subjectId },
                include: { chapters: { include: { lessons: true } } }
            });
            contentType = 'subject';
        } else {
            // Get content based on exam type
            const classes = await prisma.preparatoryClass.findMany({
                where: { examType },
                include: { subjects: { include: { chapters: { include: { lessons: true } } } } }
            });

            content = {
                title: `${examType} Practice Exam`,
                subjects: classes.flatMap(c => c.subjects)
            };
            contentType = 'exam';
        }

        if (!content) {
            throw new Error('No content found for the specified parameters');
        }

        // Generate AI questions
        let questions = [];
        try {
            const aiResponse = await aiService.generateAdaptiveQuizQuestions(
                content,
                contentType,
                { questionCount, difficulty }
            );

            if (aiResponse.success) {
                questions = JSON.parse(aiResponse.content);
            }
        } catch (error) {
            console.error('AI question generation failed:', error);
            // Generate fallback questions
            questions = this.generateFallbackQuestions(questionCount);
        }

        // Create the practice exam
        const exam = await prisma.subjectQuiz.create({
            data: {
                subjectId: subjectId || (content.subjects ? content.subjects[0]?.id : null),
                title: `Practice Exam: ${content.title || examType}`,
                description: `Timed practice exam with ${questionCount} questions`,
                timeLimit: timeLimit || (questionCount * 2), // 2 minutes per question default
                passingScore: 70,
                isActive: true,
                createdById: userId,
                source: 'PRACTICE_EXAM',
                questions: {
                    create: questions.map((q, index) => ({
                        question: q.question,
                        type: q.type || 'multiple-choice',
                        options: q.options ? JSON.stringify(q.options) : undefined,
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation,
                        difficulty: q.difficulty || difficulty,
                        points: q.points || 1,
                        order: index + 1,
                        isAIGenerated: true
                    }))
                }
            },
            include: { questions: true }
        });

        return exam;
    }

    /**
     * Generate fallback questions when AI fails
     */
    generateFallbackQuestions(count) {
        return Array.from({ length: count }, (_, i) => ({
            question: `Practice Question ${i + 1}`,
            options: [
                "Option A",
                "Option B",
                "Option C",
                "Option D"
            ],
            correctAnswer: "Option A",
            explanation: "This is a sample explanation for the practice question",
            difficulty: "MEDIUM",
            topic: "General Knowledge",
            points: 1
        }));
    }

    /**
     * Submit quiz answers and calculate automatic grading
     */
    async submitQuizAnswers(userId, quizId, answers) {
        // Get the quiz with questions
        const quiz = await prisma.subjectQuiz.findUnique({
            where: { id: quizId },
            include: { questions: true }
        });

        if (!quiz) {
            throw new Error('Quiz not found');
        }

        // Calculate score
        let correctAnswers = 0;
        const totalQuestions = quiz.questions.length;

        const questionResults = quiz.questions.map(question => {
            const userAnswer = answers[question.id];
            const isCorrect = String(userAnswer).toLowerCase() === String(question.correctAnswer).toLowerCase();

            if (isCorrect) correctAnswers++;

            return {
                questionId: question.id,
                userAnswer: String(userAnswer),
                correctAnswer: String(question.correctAnswer),
                isCorrect,
                explanation: question.explanation
            };
        });

        const score = Math.round((correctAnswers / totalQuestions) * 100);

        // Save result
        const result = await prisma.quizResult.create({
            data: {
                subjectQuizId: quizId,
                userId,
                score,
                maxScore: 100,
                answers: questionResults,
                timeSpent: 0 // Would need to track this on frontend
            }
        });

        // Generate detailed feedback
        const feedback = {
            score,
            correctAnswers,
            totalQuestions,
            passingScore: quiz.passingScore,
            passed: score >= quiz.passingScore,
            detailedResults: questionResults,
            overallFeedback: this.generateOverallFeedback(score),
            weakAreas: this.identifyWeakAreas(questionResults),
            recommendations: this.generateRecommendations(score, questionResults)
        };

        return { result, feedback };
    }

    /**
     * Generate overall feedback based on score
     */
    generateOverallFeedback(score) {
        if (score >= 90) {
            return "Excellent work! You have a strong grasp of the material.";
        } else if (score >= 80) {
            return "Good job! You're doing well but there's still room for improvement.";
        } else if (score >= 70) {
            return "Satisfactory performance. Focus on reviewing the areas where you struggled.";
        } else if (score >= 60) {
            return "You're on the right track, but need to spend more time studying.";
        } else {
            return "You need to review the material more thoroughly. Consider taking additional practice quizzes.";
        }
    }

    /**
     * Identify weak areas from incorrect answers
     */
    identifyWeakAreas(questionResults) {
        const incorrectAnswers = questionResults.filter(q => !q.isCorrect);

        // Group by topic/explanation keywords
        const topicFrequency = {};
        incorrectAnswers.forEach(answer => {
            // Extract topic from explanation or question
            const topic = answer.explanation?.substring(0, 30) || "General";
            topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
        });

        // Sort by frequency
        return Object.entries(topicFrequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([topic, count]) => ({ topic, count }));
    }

    /**
     * Generate recommendations based on performance
     */
    generateRecommendations(score, questionResults) {
        const recommendations = [];

        if (score < 70) {
            recommendations.push("Review fundamental concepts before attempting more advanced topics");
            recommendations.push("Take additional practice quizzes on weak areas");
            recommendations.push("Consider scheduling a study session with a tutor");
        } else if (score < 85) {
            recommendations.push("Focus on the topics where you made mistakes");
            recommendations.push("Take one practice quiz daily to maintain your skills");
        } else {
            recommendations.push("Continue your excellent work!");
            recommendations.push("Challenge yourself with more difficult questions");
            recommendations.push("Help peers who may be struggling with the same topics");
        }

        // Specific recommendations based on question patterns
        const incorrectCount = questionResults.filter(q => !q.isCorrect).length;
        if (incorrectCount > 0) {
            recommendations.push(`Review ${incorrectCount} questions you answered incorrectly`);
        }

        return recommendations;
    }

    /**
     * Get performance comparison with peers
     */
    async getPeerComparison(userId, quizId) {
        // Get current user's result
        const userResult = await prisma.quizResult.findFirst({
            where: {
                subjectQuizId: quizId,
                userId
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        if (!userResult) {
            throw new Error('User has not taken this quiz');
        }

        // Get all results for this quiz
        const allResults = await prisma.quizResult.findMany({
            where: {
                subjectQuizId: quizId
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            },
            orderBy: {
                score: 'desc'
            }
        });

        // Calculate statistics
        const scores = allResults.map(r => r.score);
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const highestScore = Math.max(...scores);
        const lowestScore = Math.min(...scores);

        // Find user's rank
        const userRank = allResults.findIndex(r => r.userId === userId) + 1;
        const percentile = Math.round(((allResults.length - userRank + 1) / allResults.length) * 100);

        return {
            userResult: {
                score: userResult.score,
                rank: userRank,
                percentile,
                userName: `${userResult.user.firstName} ${userResult.user.lastName}`
            },
            statistics: {
                totalParticipants: allResults.length,
                averageScore: Math.round(averageScore),
                highestScore,
                lowestScore,
                userScore: userResult.score
            },
            topPerformers: allResults.slice(0, 5).map((result, index) => ({
                rank: index + 1,
                name: `${result.user.firstName} ${result.user.lastName}`,
                score: result.score
            }))
        };
    }

    /**
     * Get quiz history for a user
     */
    async getQuizHistory(userId, limit = 10) {
        const results = await prisma.quizResult.findMany({
            where: { userId },
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
            orderBy: { completedAt: 'desc' },
            take: parseInt(limit)
        });

        const formattedResults = results.map(result => ({
            id: result.id,
            score: result.score,
            maxScore: result.maxScore,
            timeSpent: result.timeSpent,
            completedAt: result.completedAt,
            quizType: result.subjectQuizId ? 'subject' : 'chapter',
            quizTitle: result.subjectQuiz?.title || result.chapterQuiz?.title || 'Unknown Quiz',
            subject: result.subjectQuiz?.subject?.name || result.chapterQuiz?.chapter?.subject?.name || 'Unknown Subject',
            class: result.subjectQuiz?.subject?.class?.name || result.chapterQuiz?.chapter?.subject?.class?.name || 'Unknown Class'
        }));

        return formattedResults;
    }

    /**
     * Get quiz statistics for a user
     */
    async getQuizStatistics(userId) {
        const results = await prisma.quizResult.findMany({
            where: { userId }
        });

        if (results.length === 0) {
            return {
                totalQuizzes: 0,
                averageScore: 0,
                highestScore: 0,
                lowestScore: 0,
                passRate: 0,
                totalQuestionsAnswered: 0,
                correctAnswers: 0
            };
        }

        const totalScores = results.reduce((sum, result) => sum + result.score, 0);
        const averageScore = totalScores / results.length;

        const passedQuizzes = results.filter(result => result.score >= 70);
        const passRate = (passedQuizzes.length / results.length) * 100;

        // Calculate total questions and correct answers from detailed results
        let totalQuestions = 0;
        let correctAnswers = 0;

        results.forEach(result => {
            if (result.answers && Array.isArray(result.answers)) {
                totalQuestions += result.answers.length;
                correctAnswers += result.answers.filter(answer => answer.isCorrect).length;
            }
        });

        return {
            totalQuizzes: results.length,
            averageScore: Math.round(averageScore),
            highestScore: Math.max(...results.map(r => r.score)),
            lowestScore: Math.min(...results.map(r => r.score)),
            passRate: Math.round(passRate),
            totalQuestionsAnswered: totalQuestions,
            correctAnswers,
            accuracyRate: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
        };
    }

    /**
     * Generate quiz report
     */
    async generateQuizReport(userId, quizId) {
        const result = await prisma.quizResult.findFirst({
            where: {
                userId,
                OR: [
                    { subjectQuizId: quizId },
                    { chapterQuizId: quizId }
                ]
            },
            include: {
                subjectQuiz: {
                    include: {
                        questions: true,
                        subject: true
                    }
                },
                chapterQuiz: {
                    include: {
                        questions: true,
                        chapter: {
                            include: {
                                subject: true
                            }
                        }
                    }
                }
            }
        });

        if (!result) {
            throw new Error('Quiz result not found');
        }

        const quiz = result.subjectQuiz || result.chapterQuiz;
        const questions = quiz.questions;
        const answers = result.answers;

        // Calculate topic performance
        const topicPerformance = {};
        answers.forEach((answer, index) => {
            const question = questions[index];
            if (question) {
                const topic = question.topic || 'General';
                if (!topicPerformance[topic]) {
                    topicPerformance[topic] = { total: 0, correct: 0 };
                }
                topicPerformance[topic].total++;
                if (answer.isCorrect) {
                    topicPerformance[topic].correct++;
                }
            }
        });

        // Format topic performance
        const topics = Object.entries(topicPerformance).map(([topic, data]) => ({
            name: topic,
            accuracy: Math.round((data.correct / data.total) * 100),
            correct: data.correct,
            total: data.total
        }));

        return {
            quizTitle: quiz.title,
            score: result.score,
            maxScore: result.maxScore,
            completedAt: result.completedAt,
            timeSpent: result.timeSpent,
            topics,
            recommendations: this.generateTopicRecommendations(topics)
        };
    }

    /**
     * Generate topic recommendations based on performance
     */
    generateTopicRecommendations(topics) {
        const recommendations = [];

        topics.forEach(topic => {
            if (topic.accuracy < 70) {
                recommendations.push({
                    topic: topic.name,
                    recommendation: `Focus on reviewing ${topic.name}. Your accuracy is ${topic.accuracy}%.`,
                    priority: 'high'
                });
            } else if (topic.accuracy < 85) {
                recommendations.push({
                    topic: topic.name,
                    recommendation: `Continue practicing ${topic.name} to improve your accuracy from ${topic.accuracy}% to 90%+.`,
                    priority: 'medium'
                });
            }
        });

        if (recommendations.length === 0) {
            recommendations.push({
                topic: 'General',
                recommendation: 'Great job! Continue maintaining your strong performance across all topics.',
                priority: 'low'
            });
        }

        return recommendations;
    }

    /**
     * Create custom quiz for teachers
     */
    async createCustomQuiz(teacherId, quizData) {
        const {
            subjectId,
            title,
            description,
            timeLimit,
            passingScore,
            questions
        } = quizData;

        // Validate that user is a teacher
        const teacher = await prisma.user.findUnique({
            where: { id: teacherId }
        });

        if (!teacher || (teacher.role !== 'TEACHER' && teacher.role !== 'PREP_ADMIN' && teacher.role !== 'SUPER_ADMIN')) {
            throw new Error('Only teachers can create custom quizzes');
        }

        // Create the quiz
        const quiz = await prisma.subjectQuiz.create({
            data: {
                subjectId,
                title,
                description,
                timeLimit: parseInt(timeLimit) || 30,
                passingScore: parseInt(passingScore) || 70,
                isActive: true,
                createdById: teacherId,
                source: 'MANUAL',
                questions: {
                    create: questions.map((q, index) => ({
                        question: q.question,
                        type: q.type || 'multiple-choice',
                        options: q.options ? JSON.stringify(q.options) : undefined,
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation,
                        difficulty: q.difficulty || 'MEDIUM',
                        points: q.points || 1,
                        order: index + 1,
                        isAIGenerated: false
                    }))
                }
            },
            include: { questions: true }
        });

        // Notify enrolled students
        await this.notifyStudents(subjectId, quiz.id, title);

        return quiz;
    }

    /**
     * Notify students when a new quiz is created
     */
    async notifyStudents(subjectId, quizId, quizTitle) {
        try {
            // Find all enrolled students in classes with this subject
            const enrollments = await prisma.enrollment.findMany({
                where: {
                    class: {
                        subjects: {
                            some: {
                                id: subjectId
                            }
                        }
                    }
                },
                select: {
                    userId: true
                }
            });

            if (enrollments.length > 0) {
                const notifications = enrollments.map(enrollment => ({
                    userId: enrollment.userId,
                    title: 'New Quiz Available',
                    message: `A new quiz "${quizTitle}" has been published for your course.`,
                    type: 'quiz'
                }));

                await prisma.notification.createMany({
                    data: notifications
                });
            }
        } catch (error) {
            console.error('Failed to send quiz notifications:', error);
        }
    }

    /**
     * Create exam simulation
     */
    async createExamSimulation(userId, examModuleId, config = {}) {
        const examModule = await prisma.examModule.findUnique({
            where: { id: examModuleId },
            include: {
                sections: {
                    include: {
                        topics: true
                    }
                }
            }
        });

        if (!examModule) {
            throw new Error('Exam module not found');
        }

        // Generate questions for each section
        const allQuestions = [];
        let questionOrder = 1;

        for (const section of examModule.sections) {
            try {
                const aiResponse = await aiService.generateAdaptiveQuizQuestions(
                    {
                        section: section.name,
                        topics: section.topics.map(t => t.name),
                        examType: examModule.name
                    },
                    'exam_section',
                    {
                        questionCount: section.questionCount || 10,
                        difficulty: config.difficulty || 'MEDIUM'
                    }
                );

                if (aiResponse.success) {
                    const sectionQuestions = JSON.parse(aiResponse.content);
                    sectionQuestions.forEach(q => {
                        allQuestions.push({
                            ...q,
                            sectionId: section.id,
                            order: questionOrder++
                        });
                    });
                }
            } catch (error) {
                console.error(`Failed to generate questions for section ${section.name}:`, error);
            }
        }

        // Create the exam simulation
        const simulation = await prisma.examSimulation.create({
            data: {
                userId,
                examModuleId,
                title: `${examModule.name} Practice Exam`,
                description: `Full-length practice exam for ${examModule.name}`,
                timeLimit: examModule.timeLimit,
                passingScore: examModule.passingScore,
                totalQuestions: allQuestions.length,
                questions: {
                    create: allQuestions.map((q, index) => ({
                        question: q.question,
                        type: q.type || 'multiple-choice',
                        options: q.options ? JSON.stringify(q.options) : undefined,
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation,
                        difficulty: q.difficulty || 'MEDIUM',
                        points: q.points || 1,
                        sectionId: q.sectionId,
                        order: q.order
                    }))
                }
            },
            include: {
                examModule: true,
                questions: {
                    include: {
                        section: true
                    }
                }
            }
        });

        return simulation;
    }
}
