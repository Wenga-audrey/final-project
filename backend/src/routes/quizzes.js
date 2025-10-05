import express from 'express';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { authenticate, requireRole } from '../middleware/auth.js';
import { createAIService } from '../lib/aiService.js';


const router = express.Router();
const prisma = new PrismaClient();
const aiService = createAIService();

// Get chapter quiz
router.get('/chapter/:chapterId', authenticate, async (req, res, next) => {
    try {
        const { chapterId } = req.params;
        const userId = req.user.id;

        const quiz = await prisma.chapterQuiz.findFirst({
            where: {
                chapterId,
                isActive: true
            },
            include: {
                questions: {
                    orderBy: { order: 'asc' }
                },
                results: {
                    where: { userId },
                    orderBy: { completedAt: 'desc' },
                    take: 1
                },
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

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found for this chapter' });
        }

        res.json(quiz);
    } catch (error) {
        next(error);
    }
});

// Get subject quiz
router.get('/subject/:subjectId', authenticate, async (req, res, next) => {
    try {
        const { subjectId } = req.params;
        const userId = req.user.id;

        const quiz = await prisma.subjectQuiz.findFirst({
            where: {
                subjectId,
                isActive: true
            },
            include: {
                questions: {
                    orderBy: { order: 'asc' }
                },
                results: {
                    where: { userId },
                    orderBy: { completedAt: 'desc' },
                    take: 1
                },
                subject: {
                    include: {
                        class: true,
                        chapters: {
                            where: { isPublished: true }
                        }
                    }
                }
            }
        });

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found for this subject' });
        }

        res.json(quiz);
    } catch (error) {
        next(error);
    }
});

// Create chapter quiz (Teachers and Prep Admin)
router.post('/chapter', authenticate, requireRole(['TEACHER', 'PREP_ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
    try {
        const {
            chapterId,
            title,
            description,
            timeLimit,
            passingScore,
            generateWithAI = false
        } = req.body;

        const quiz = await prisma.chapterQuiz.create({
            data: {
                chapterId,
                title,
                description,
                timeLimit: parseInt(timeLimit),
                passingScore: parseInt(passingScore),
                isActive: true,
                createdById: req.user.id,
                source: generateWithAI ? 'AI' : 'MANUAL'
            }
        });

        // Generate AI questions if requested
        if (generateWithAI) {
            try {
                const chapter = await prisma.chapter.findUnique({
                    where: { id: chapterId },
                    include: {
                        lessons: {
                            where: { isPublished: true }
                        },
                        subject: true
                    }
                });

                if (chapter) {
                    // Use our new consolidated AI service
                    const aiResponse = await aiService.generateAdaptiveQuizQuestions(chapter, 'chapter', {
                        questionCount: 10,
                        difficulty: 'MEDIUM'
                    });

                    if (aiResponse.success) {
                        try {
                            const aiQuestions = JSON.parse(aiResponse.content);

                            if (aiQuestions && aiQuestions.length > 0) {
                                await prisma.quizQuestion.createMany({
                                    data: aiQuestions.map((q, index) => ({
                                        chapterQuizId: quiz.id,
                                        question: q.question,
                                        type: q.type || 'multiple-choice',
                                        options: q.options ? q.options : undefined,
                                        correctAnswer: q.correctAnswer,
                                        explanation: q.explanation,
                                        difficulty: q.difficulty || 'MEDIUM',
                                        points: q.points || 1,
                                        order: index + 1,
                                        isAIGenerated: true
                                    }))
                                });
                            }
                        } catch (parseError) {
                            console.error('Failed to parse AI questions:', parseError);
                        }
                    }
                }
            } catch (aiError) {
                console.error('AI question generation failed:', aiError);
                // Continue without AI questions
            }
        }

        const completeQuiz = await prisma.chapterQuiz.findUnique({
            where: { id: quiz.id },
            include: {
                questions: true
            }
        });

        // Notify enrolled learners in the related class
        try {
            await notifyClassLearnersForChapterQuiz(prisma, chapterId, quiz.id, title || 'New Chapter Quiz');
        } catch (e) {
            console.error('Failed to send quiz notifications:', e);
        }

        res.status(201).json(completeQuiz);
    } catch (error) {
        next(error);
    }
});

// Create subject quiz (Teachers and Prep Admin)
router.post('/subject', authenticate, requireRole(['TEACHER', 'PREP_ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
    try {
        const {
            subjectId,
            title,
            description,
            timeLimit,
            passingScore,
            generateWithAI = false
        } = req.body;

        const quiz = await prisma.subjectQuiz.create({
            data: {
                subjectId,
                title,
                description,
                timeLimit: parseInt(timeLimit),
                passingScore: parseInt(passingScore),
                isActive: true,
                createdById: req.user.id,
                source: generateWithAI ? 'AI' : 'MANUAL'
            }
        });

        // Generate AI questions if requested
        if (generateWithAI) {
            try {
                const subject = await prisma.subject.findUnique({
                    where: { id: subjectId },
                    include: {
                        chapters: {
                            where: { isPublished: true }
                        },
                        class: true
                    }
                });

                if (subject) {
                    // Use our new consolidated AI service
                    const aiResponse = await aiService.generateAdaptiveQuizQuestions(subject, 'subject', {
                        questionCount: 15,
                        difficulty: 'MEDIUM'
                    });

                    if (aiResponse.success) {
                        try {
                            const aiQuestions = JSON.parse(aiResponse.content);

                            if (aiQuestions && aiQuestions.length > 0) {
                                await prisma.quizQuestion.createMany({
                                    data: aiQuestions.map((q, index) => ({
                                        subjectQuizId: quiz.id,
                                        question: q.question,
                                        type: q.type || 'multiple-choice',
                                        options: q.options ? q.options : undefined,
                                        correctAnswer: q.correctAnswer,
                                        explanation: q.explanation,
                                        difficulty: q.difficulty || 'MEDIUM',
                                        points: q.points || 1,
                                        order: index + 1,
                                        isAIGenerated: true
                                    }))
                                });
                            }
                        } catch (parseError) {
                            console.error('Failed to parse AI questions:', parseError);
                        }
                    }
                }
            } catch (aiError) {
                console.error('AI question generation failed:', aiError);
                // Continue without AI questions
            }
        }

        const completeQuiz = await prisma.subjectQuiz.findUnique({
            where: { id: quiz.id },
            include: {
                questions: true
            }
        });

        // Notify enrolled learners in the related class
        try {
            await notifyClassLearnersForSubjectQuiz(prisma, subjectId, quiz.id, title || 'New Subject Quiz');
        } catch (e) {
            console.error('Failed to send quiz notifications:', e);
        }

        res.status(201).json(completeQuiz);
    } catch (error) {
        next(error);
    }
});

// Submit chapter quiz answers
router.post('/chapter/:quizId/submit', authenticate, async (req, res, next) => {
    try {
        const { quizId } = req.params;
        const { answers } = req.body;
        const userId = req.user.id;

        const quiz = await prisma.chapterQuiz.findUnique({
            where: { id: quizId },
            include: { questions: true }
        });

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
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
                isCorrect
            };
        });

        const score = Math.round((correctAnswers / totalQuestions) * 100);

        // Save result
        const result = await prisma.quizResult.create({
            data: {
                chapterQuizId: quizId,
                userId,
                score,
                answers: questionResults,
                timeSpent: 0 // Would need to track this on frontend
            }
        });

        // Update user progress
        await updateUserProgress(prisma, userId, 'chapter_quiz', quizId, score);

        res.json({
            success: true,
            score,
            correctAnswers,
            totalQuestions,
            result
        });
    } catch (error) {
        next(error);
    }
});

// Submit subject quiz answers
router.post('/subject/:quizId/submit', authenticate, async (req, res, next) => {
    try {
        const { quizId } = req.params;
        const { answers } = req.body;
        const userId = req.user.id;

        const quiz = await prisma.subjectQuiz.findUnique({
            where: { id: quizId },
            include: { questions: true }
        });

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
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
                isCorrect
            };
        });

        const score = Math.round((correctAnswers / totalQuestions) * 100);

        // Save result
        const result = await prisma.quizResult.create({
            data: {
                subjectQuizId: quizId,
                userId,
                score,
                answers: questionResults,
                timeSpent: 0 // Would need to track this on frontend
            }
        });

        // Update user progress
        await updateUserProgress(prisma, userId, 'subject_quiz', quizId, score);

        res.json({
            success: true,
            score,
            correctAnswers,
            totalQuestions,
            result
        });
    } catch (error) {
        next(error);
    }
});

// Get quiz results
router.get('/results/:quizId', authenticate, async (req, res, next) => {
    try {
        const { quizId } = req.params;
        const userId = req.user.id;

        const results = await prisma.quizResult.findMany({
            where: {
                OR: [
                    { chapterQuizId: quizId },
                    { subjectQuizId: quizId }
                ],
                userId
            },
            orderBy: { completedAt: 'desc' }
        });

        res.json(results);
    } catch (error) {
        next(error);
    }
});

// Get quiz leaderboard
router.get('/leaderboard/:quizId', authenticate, async (req, res, next) => {
    try {
        const { quizId } = req.params;
        const { limit = 10 } = req.query;

        const results = await prisma.quizResult.findMany({
            where: {
                OR: [
                    { chapterQuizId: quizId },
                    { subjectQuizId: quizId }
                ]
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profilePicture: true
                    }
                }
            },
            orderBy: { score: 'desc' },
            take: parseInt(limit)
        });

        const leaderboard = results.map(result => ({
            userId: result.user.id,
            userName: result.user.name,
            userProfilePicture: result.user.profilePicture,
            score: result.score,
            completedAt: result.completedAt
        }));

        res.json(leaderboard);
    } catch (error) {
        next(error);
    }
});

// Helper functions
async function notifyClassLearnersForChapterQuiz(prisma, chapterId, quizId, quizTitle) {
    // Find class via chapter -> subject -> class
    const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        include: { subject: { include: { class: true } } }
    });
    if (!chapter) return;
    const classId = chapter.subject.class.id;

    const enrollments = await prisma.enrollment.findMany({
        where: { classId },
        select: { userId: true }
    });
    if (!enrollments.length) return;

    const notifications = enrollments.map(e => ({
        userId: e.userId,
        title: 'New Chapter Quiz Available',
        message: `A new quiz "${quizTitle}" has been published for chapter ${chapter.title}.`,
        type: 'quiz'
    }));
    await prisma.notification.createMany({ data: notifications });
}

async function notifyClassLearnersForSubjectQuiz(prisma, subjectId, quizId, quizTitle) {
    const subject = await prisma.subject.findUnique({
        where: { id: subjectId },
        include: { class: true }
    });
    if (!subject) return;
    const classId = subject.class.id;

    const enrollments = await prisma.enrollment.findMany({
        where: { classId },
        select: { userId: true }
    });
    if (!enrollments.length) return;

    const notifications = enrollments.map(e => ({
        userId: e.userId,
        title: 'New Subject Quiz Available',
        message: `A new quiz "${quizTitle}" has been published for subject ${subject.name}.`,
        type: 'quiz'
    }));
    await prisma.notification.createMany({ data: notifications });
}

async function updateUserProgress(prisma, userId, quizType, quizId, score) {
    // This would update user progress, achievements, etc.
    // Implementation depends on your specific requirements
    console.log(`User ${userId} scored ${score} on ${quizType} ${quizId}`);
}

export default router;