import express from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";
import multer from "multer";
import { createAIService } from "../lib/aiService.js";
import { LiveSessionService } from "../lib/liveSessionService.js";

const aiService = createAIService();
const upload = multer({ dest: "uploads/pdfs/" });

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Upload PDF for lesson or chapter
router.post("/lessons/:lessonId/upload-pdf", upload.single("pdf"), async (req, res, next) => {
  try {
    const lessonId = req.params.lessonId;
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }
    const pdfPath = `/uploads/pdfs/${req.file.filename}`;
    await prisma.lesson.update({
      where: { id: lessonId },
      data: { pdfUrl: pdfPath },
    });
    res.json({ success: true, pdfUrl: pdfPath });
  } catch (err) {
    next(err);
  }
});

// Assign quiz to class, subject, topic (manual or AI)
router.post("/quizzes/create", async (req, res, next) => {
  try {
    const { classId, subjectId, chapterId, title, questions, isAI } = req.body;
    const quiz = await prisma.quiz.create({
      data: {
        classId,
        subjectId,
        chapterId,
        title,
        questions,
        isAI,
      },
    });
    res.json({ success: true, quiz });
  } catch (err) {
    next(err);
  }
});

// Track/view learner progress
router.get("/prep-classes/:classId/learner-progress", async (req, res, next) => {
  try {
    const classId = req.params.classId;
    const learners = await prisma.enrollment.findMany({
      where: { classId, status: "ACTIVE" },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        progress: true,
      },
    });

    // Calculate progress percentage for each learner
    const learnersWithProgress = learners.map(learner => {
      const totalLessons = learner.progress.length;
      const completedLessons = learner.progress.filter(p => p.completedAt).length;
      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        user: learner.user,
        progress: progressPercentage,
        totalLessons,
        completedLessons
      };
    });

    res.json({ success: true, learners: learnersWithProgress });
  } catch (err) {
    next(err);
  }
});

// Get list of preparatory classes for the instructor
router.get("/prep-classes", async (req, res, next) => {
  try {
    // Assuming instructors are associated with classes through some relationship
    // For now, we'll return all active preparatory classes
    const prepClasses = await prisma.preparatoryClass.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        examType: true,
        startDate: true,
        endDate: true
      }
    });

    res.json({ success: true, prepClasses });
  } catch (err) {
    next(err);
  }
});

// Get lessons created by the instructor
router.get("/:instructorId/lessons", async (req, res, next) => {
  try {
    const instructorId = req.params.instructorId;
    const lessons = await prisma.lesson.findMany({
      where: { createdBy: instructorId },
      select: {
        id: true,
        title: true,
        description: true,
        isPublished: true,
        createdAt: true,
        chapter: {
          select: {
            title: true,
            subject: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    res.json({ success: true, lessons });
  } catch (err) {
    next(err);
  }
});

// Get quizzes created by the instructor
router.get("/:instructorId/quizzes", async (req, res, next) => {
  try {
    const instructorId = req.params.instructorId;
    const quizzes = await prisma.quiz.findMany({
      where: { createdById: instructorId },
      select: {
        id: true,
        title: true,
        description: true,
        isPublished: true,
        createdAt: true,
        subject: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            questions: true
          }
        }
      }
    });

    const quizzesWithQuestionCount = quizzes.map(quiz => ({
      ...quiz,
      questionCount: quiz._count.questions
    }));

    res.json({ success: true, quizzes: quizzesWithQuestionCount });
  } catch (err) {
    next(err);
  }
});

// Approve a quiz
router.post("/quizzes/:quizId/approve", async (req, res, next) => {
  try {
    const quizId = req.params.quizId;
    const quiz = await prisma.quiz.update({
      where: { id: quizId },
      data: { isPublished: true },
      select: {
        id: true,
        title: true,
        isPublished: true
      }
    });

    res.json({ success: true, quiz });
  } catch (err) {
    next(err);
  }
});

// Get analytics for a specific class
router.get("/prep-classes/:classId/analytics", async (req, res, next) => {
  try {
    const classId = req.params.classId;

    // Get all enrollments for the class
    const enrollments = await prisma.enrollment.findMany({
      where: { classId, status: "ACTIVE" },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        progress: true,
        quizResults: {
          select: {
            score: true,
            completedAt: true
          }
        }
      }
    });

    // Calculate analytics
    const totalLearners = enrollments.length;
    let totalCompletedLessons = 0;
    let totalPossibleLessons = 0;
    let totalQuizScores = 0;
    let totalQuizzesTaken = 0;

    enrollments.forEach(enrollment => {
      totalCompletedLessons += enrollment.progress.filter(p => p.completedAt).length;
      totalPossibleLessons += enrollment.progress.length;

      enrollment.quizResults.forEach(result => {
        totalQuizScores += result.score;
        totalQuizzesTaken++;
      });
    });

    const avgProgress = totalPossibleLessons > 0 ? Math.round((totalCompletedLessons / totalPossibleLessons) * 100) : 0;
    const avgQuizScore = totalQuizzesTaken > 0 ? Math.round(totalQuizScores / totalQuizzesTaken) : 0;

    // Get leaderboard (top 5 learners by average quiz score)
    const leaderboard = enrollments
      .map(enrollment => {
        const totalScore = enrollment.quizResults.reduce((sum, result) => sum + result.score, 0);
        const avgScore = enrollment.quizResults.length > 0 ? totalScore / enrollment.quizResults.length : 0;

        return {
          userId: enrollment.userId,
          name: `${enrollment.user.firstName} ${enrollment.user.lastName}`,
          avgScore: Math.round(avgScore),
          quizzesTaken: enrollment.quizResults.length
        };
      })
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5);

    res.json({
      success: true,
      analytics: {
        totalLearners,
        avgProgress,
        avgQuizScore,
        activeLearners: totalLearners, // For simplicity, all enrolled learners are active
        leaderboardTop: leaderboard
      }
    });
  } catch (err) {
    next(err);
  }
});

// Get pending content for approval
router.get("/:instructorId/pending-content", async (req, res, next) => {
  try {
    const instructorId = req.params.instructorId;

    // Get pending lessons
    const pendingLessons = await prisma.lesson.findMany({
      where: {
        isPublished: false,
        chapter: {
          subject: {
            class: {
              instructors: {
                some: {
                  id: instructorId
                }
              }
            }
          }
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        chapter: {
          select: {
            title: true,
            subject: {
              select: {
                name: true,
                class: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Get pending quizzes
    const pendingQuizzes = await prisma.quiz.findMany({
      where: {
        isPublished: false,
        subject: {
          class: {
            instructors: {
              some: {
                id: instructorId
              }
            }
          }
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        subject: {
          select: {
            name: true,
            class: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    // Combine and format pending content
    const pendingContent = [
      ...pendingLessons.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        type: 'lesson',
        description: lesson.description,
        createdAt: lesson.createdAt,
        location: `${lesson.chapter.subject.class.name} > ${lesson.chapter.subject.name} > ${lesson.chapter.title}`
      })),
      ...pendingQuizzes.map(quiz => ({
        id: quiz.id,
        title: quiz.title,
        type: 'quiz',
        description: quiz.description,
        createdAt: quiz.createdAt,
        location: `${quiz.subject.class.name} > ${quiz.subject.name}`
      }))
    ];

    res.json({ success: true, pending: pendingContent });
  } catch (err) {
    next(err);
  }
});

// Approve content
router.post("/content/:id/approve", async (req, res, next) => {
  try {
    const contentId = req.params.id;

    // Try to approve as lesson first
    try {
      const lesson = await prisma.lesson.update({
        where: { id: contentId },
        data: { isPublished: true },
        select: {
          id: true,
          title: true,
          isPublished: true
        }
      });

      return res.json({ success: true, content: lesson });
    } catch (lessonErr) {
      // If not a lesson, try as quiz
      try {
        const quiz = await prisma.quiz.update({
          where: { id: contentId },
          data: { isPublished: true },
          select: {
            id: true,
            title: true,
            isPublished: true
          }
        });

        return res.json({ success: true, content: quiz });
      } catch (quizErr) {
        return res.status(404).json({ success: false, error: "Content not found" });
      }
    }
  } catch (err) {
    next(err);
  }
});

// Send feedback to a learner
router.post("/feedback", async (req, res, next) => {
  try {
    const { learnerId, subjectId, feedback } = req.body;

    // Create feedback record
    const feedbackRecord = await prisma.feedback.create({
      data: {
        learnerId,
        subjectId,
        instructorId: req.user.id, // Assuming req.user contains the authenticated user
        content: feedback,
        type: 'INSTRUCTOR'
      },
      include: {
        learner: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        subject: {
          select: {
            name: true
          }
        }
      }
    });

    res.json({ success: true, feedback: feedbackRecord });
  } catch (err) {
    next(err);
  }
});

// QUIZ MANAGEMENT - Merged from quizzes.js
// Get chapter quiz
router.get('/quizzes/chapter/:chapterId', authenticate, async (req, res, next) => {
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
router.get('/quizzes/subject/:subjectId', authenticate, async (req, res, next) => {
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
router.post('/quizzes/chapter', authenticate, requireRole(['TEACHER', 'PREP_ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
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
router.post('/quizzes/subject', authenticate, requireRole(['TEACHER', 'PREP_ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
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
router.post('/quizzes/chapter/:quizId/submit', authenticate, async (req, res, next) => {
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
router.post('/quizzes/subject/:quizId/submit', authenticate, async (req, res, next) => {
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
router.get('/quizzes/results/:quizId', authenticate, async (req, res, next) => {
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
router.get('/quizzes/leaderboard/:quizId', authenticate, async (req, res, next) => {
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

// LIVE SESSION MANAGEMENT - Merged from liveSessions.js
// Create live session (Teachers only)
router.post('/live-sessions',
  authenticate,
  requireRole(['TEACHER', 'PREP_ADMIN']),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { title, description, classId, subjectId, scheduledAt, duration, maxParticipants } = req.body;

      if (!title || !classId || !scheduledAt || !duration) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const session = await LiveSessionService.createSession({
        title,
        description,
        teacherId: userId,
        classId,
        subjectId,
        scheduledAt: new Date(scheduledAt),
        duration: parseInt(duration),
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined
      });

      res.status(201).json({
        message: 'Live session created successfully',
        session
      });

    } catch (error) {
      console.error('Error creating live session:', error);
      res.status(500).json({ error: 'Failed to create live session' });
    }
  }
);

// Get sessions by teacher
router.get('/live-sessions/teacher/:teacherId',
  authenticate,
  async (req, res) => {
    try {
      const { teacherId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Only allow teachers to view their own sessions or admins to view any
      if (userId !== teacherId && !['PREP_ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const sessions = await LiveSessionService.getSessionsByTeacher(teacherId);

      res.json({ sessions });

    } catch (error) {
      console.error('Error fetching teacher sessions:', error);
      res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  }
);

// Get sessions by class
router.get('/live-sessions/class/:classId',
  authenticate,
  async (req, res) => {
    try {
      const { classId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Verify user has access to this class
      if (userRole === 'LEARNER') {
        const enrollment = await prisma.enrollment.findFirst({
          where: { userId, classId, status: 'ACTIVE' }
        });
        if (!enrollment) {
          return res.status(403).json({ error: 'Not enrolled in this class' });
        }
      } else if (userRole === 'TEACHER') {
        const teacherAssignment = await prisma.classTeacher.findFirst({
          where: { teacherId: userId, classId }
        });
        if (!teacherAssignment) {
          return res.status(403).json({ error: 'Not assigned to this class' });
        }
      }

      const sessions = await LiveSessionService.getSessionsByClass(classId);

      res.json({ sessions });

    } catch (error) {
      console.error('Error fetching class sessions:', error);
      res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  }
);

// Join live session
router.post('/live-sessions/:sessionId/join',
  authenticate,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const result = await LiveSessionService.joinSession(sessionId, userId);

      res.json({
        message: 'Joined session successfully',
        meetingUrl: result.meetingUrl,
        sessionId: result.sessionId
      });

    } catch (error) {
      console.error('Error joining session:', error);
      res.status(500).json({ error: error.message || 'Failed to join session' });
    }
  }
);

// Update session status
router.patch('/live-sessions/:sessionId/status',
  authenticate,
  requireRole(['TEACHER', 'PREP_ADMIN']),
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { status } = req.body;
      const userId = req.user.id;

      if (!['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      // Verify teacher owns this session or is prep admin
      const userRole = req.user.role;
      if (userRole !== 'PREP_ADMIN') {
        const session = await prisma.$queryRaw`
          SELECT * FROM live_sessions WHERE id = ${sessionId} AND teacher_id = ${userId}
        `;

        if (!session.length) {
          return res.status(403).json({ error: 'Access denied to this session' });
        }
      }

      await LiveSessionService.updateSessionStatus(sessionId, status);

      res.json({ message: 'Session status updated successfully' });

    } catch (error) {
      console.error('Error updating session status:', error);
      res.status(500).json({ error: 'Failed to update session status' });
    }
  }
);

// Record attendance
router.post('/live-sessions/:sessionId/attendance',
  authenticate,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { duration } = req.body;
      const userId = req.user.id;

      if (!duration || duration < 0) {
        return res.status(400).json({ error: 'Invalid duration' });
      }

      await LiveSessionService.recordAttendance(sessionId, userId, parseInt(duration));

      res.json({ message: 'Attendance recorded successfully' });

    } catch (error) {
      console.error('Error recording attendance:', error);
      res.status(500).json({ error: 'Failed to record attendance' });
    }
  }
);

export default router;