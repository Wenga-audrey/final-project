import express from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";
import { validate } from "../middleware/validation.js";

// Validation schemas
const submitAssessmentSchema = z.object({
  answers: z.record(z.string(), z.any()),
});

const createSubscriptionSchema = z.object({
  body: z.object({
    planType: z.enum(["FREE", "MONTHLY", "ANNUAL", "LIFETIME"]),
    stripeId: z.string().optional(),
  }),
});

const createLearningPathSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    examType: z.enum([
      "ENAM",
      "ENS",
      "POLICE",
      "CUSTOMS",
      "UNIVERSITY",
      "PROFESSIONAL",
    ]),
    targetDate: z.string().datetime().optional(),
    courseIds: z.array(z.string()).min(1),
  }),
});

const updateLearningPathSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    targetDate: z.string().datetime().optional(),
    isActive: z.boolean().optional(),
  }),
});

const router = express.Router();

// GET /api/learner/context
// Returns active enrollment class (examType), subjects with chapter counts and progress for the learner
router.get("/context", authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find active enrollment with related class and subjects/chapters
    const enrollment = await prisma.enrollment.findFirst({
      where: { userId, status: "ACTIVE" },
      include: {
        class: {
          include: {
            subjects: {
              include: {
                chapters: {
                  select: { id: true }
                }
              },
              orderBy: { order: "asc" }
            }
          }
        }
      }
    });

    if (!enrollment) {
      return res.json({
        success: true,
        data: { activeClass: null, subjects: [] }
      });
    }

    // Compute per-subject progress using ChapterProgress
    const chapterIds = enrollment.class.subjects.flatMap(s => s.chapters.map(c => c.id));
    const progress = await prisma.chapterProgress.findMany({
      where: { userId, chapterId: { in: chapterIds } },
      select: { chapterId: true, isCompleted: true, timeSpent: true, updatedAt: true }
    });

    const subjects = enrollment.class.subjects.map(s => {
      const sChapterIds = s.chapters.map(c => c.id);
      const sProgress = progress.filter(p => sChapterIds.includes(p.chapterId));
      const totalChapters = sChapterIds.length;
      const completedChapters = sProgress.filter(p => p.isCompleted).length;
      const timeSpent = sProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
      const lastAccessed = sProgress.reduce < Date | null > ((latest, p) => {
        const d = new Date(p.updatedAt);
        return !latest || d > latest ? d : latest;
      }, null);

      return {
        id: s.id,
        title: s.name,
        examType: enrollment.class.examType,
        totalLessons: totalChapters,
        completedLessons: completedChapters,
        progress: totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0,
        lastAccessed: lastAccessed ? lastAccessed.toISOString() : enrollment.enrolledAt.toISOString(),
        thumbnail: null
      };
    });

    res.json({
      success: true,
      data: {
        activeClass: {
          id: enrollment.class.id,
          name: enrollment.class.name,
          examType: enrollment.class.examType,
          startDate: enrollment.class.startDate,
          endDate: enrollment.class.endDate,
        },
        subjects
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/learner/dashboard
// Returns KPIs: courses enrolled, completed, total assessments, average score, study time (this week & total), rank, totalStudents
router.get("/dashboard", authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [enrollments, quizResults, chapterProgress, totalStudents] = await Promise.all([
      prisma.enrollment.findMany({ where: { userId } }),
      prisma.quizResult.findMany({ where: { userId } }),
      prisma.chapterProgress.findMany({ where: { userId } }),
      prisma.user.count({ where: { role: "LEARNER" } })
    ]);

    const totalCourses = enrollments.length;
    const completedCourses = 0; // Optional: derive based on all chapters completed per class

    const totalAssessments = quizResults.length;
    const averageScore = totalAssessments > 0
      ? Math.round(quizResults.reduce((s, r) => s + ((r.score / r.maxScore) * 100), 0) / totalAssessments)
      : 0;

    // Study time
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const studyTimeTotal = Math.round(chapterProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0));
    const studyTimeThisWeek = Math.round(chapterProgress
      .filter(p => new Date(p.updatedAt) >= oneWeekAgo)
      .reduce((sum, p) => sum + (p.timeSpent || 0), 0));

    // Rank placeholder: 1 for now (can be improved with average score comparison)
    const rank = 1;

    res.json({
      success: true,
      data: {
        totalCourses,
        completedCourses,
        totalAssessments,
        averageScore,
        studyTimeThisWeek,
        studyTimeTotal,
        rank,
        totalStudents
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/learner/recent-quiz-results
router.get("/recent-quiz-results", authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const results = await prisma.quizResult.findMany({
      where: { userId },
      orderBy: { completedAt: "desc" },
      take: 10,
      include: {
        chapterQuiz: { select: { title: true } },
        subjectQuiz: { select: { title: true } }
      }
    });

    const mapped = results.map(r => ({
      id: r.id,
      title: r.chapterQuiz?.title || r.subjectQuiz?.title || "Quiz",
      score: r.score,
      maxScore: r.maxScore,
      completedAt: r.completedAt,
      difficulty: undefined,
      subject: undefined
    }));

    res.json({ success: true, data: mapped });
  } catch (err) {
    next(err);
  }
});

// Get enrolled subject with chapters, lessons, quizzes, and PDFs for learner (consolidated from learner student.js)
router.get("/subjects/:subjectId", authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const subjectId = req.params.subjectId;

    // Find subject with its class to check enrollment
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        class: true,
        chapters: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                title: true,
                pdfUrl: true,
                isCompleted: true,
                order: true,
              },
            },
            quizzes: {
              select: {
                id: true,
                title: true,
                isCompleted: true,
                isAI: true,
                score: true,
                order: true,
              },
            },
          },
        },
        subjectQuizzes: {
          select: {
            id: true,
            title: true,
            isCompleted: true,
            isAI: true,
            score: true,
            order: true,
          },
        },
      },
    });

    if (!subject) return res.status(404).json({ success: false, error: "Subject not found" });

    // Check if user is enrolled in the class containing this subject
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        classId: subject.class.id,
        status: "ACTIVE"
      }
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        error: "You must be enrolled in the preparatory class to access this subject"
      });
    }

    res.json({ success: true, data: subject });
  } catch (err) {
    next(err);
  }
});

// ASSESSMENT MANAGEMENT - Merged from assessments.js
// Get assessments for a lesson
router.get('/assessments/lesson/:lessonId', authenticate, async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    // Check if lesson exists and user is enrolled
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: true },
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.courseId,
        },
      },
    });

    if (!enrollment) {
      return res
        .status(403)
        .json({
          error: 'You must be enrolled in the course to access assessments',
        });
    }

    const assessments = await prisma.assessment.findMany({
      where: {
        lessonId,
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        timeLimit: true,
        passingScore: true,
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

    // Get user's results for these assessments
    const results = await prisma.assessmentResult.findMany({
      where: {
        userId,
        assessmentId: {
          in: assessments.map((a) => a.id),
        },
      },
      select: {
        assessmentId: true,
        score: true,
        completedAt: true,
      },
    });

    const assessmentsWithResults = assessments.map((assessment) => ({
      ...assessment,
      userResult: results.find((r) => r.assessmentId === assessment.id),
    }));

    res.json({ assessments: assessmentsWithResults });
  } catch (error) {
    next(error);
  }
});

// Get single assessment with questions
router.get('/assessments/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        lesson: {
          include: {
            course: true,
          },
        },
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            question: true,
            type: true,
            options: true,
            difficulty: true,
            points: true,
            order: true,
            // Don't include correctAnswer or explanation
          },
        },
      },
    });

    if (!assessment || !assessment.isPublished) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Check enrollment if assessment is linked to a lesson
    if (assessment.lesson) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: assessment.lesson.courseId,
          },
        },
      });

      if (!enrollment) {
        return res
          .status(403)
          .json({
            error:
              'You must be enrolled in the course to access this assessment',
          });
      }
    }

    res.json({ assessment });
  } catch (error) {
    next(error);
  }
});

// Submit assessment
router.post(
  '/assessments/:id/submit',
  authenticate,
  validate(submitAssessmentSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { answers } = req.body;
      const userId = req.user.id;

      // Get assessment with questions
      const assessment = await prisma.assessment.findUnique({
        where: { id },
        include: {
          questions: true,
          lesson: {
            include: {
              course: true,
            },
          },
        },
      });

      if (!assessment || !assessment.isPublished) {
        return res.status(404).json({ error: 'Assessment not found' });
      }

      // Check enrollment if assessment is linked to a lesson
      if (assessment.lesson) {
        const enrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId,
              courseId: assessment.lesson.courseId,
            },
          },
        });

        if (!enrollment) {
          return res
            .status(403)
            .json({
              error:
                'You must be enrolled in the course to submit this assessment',
            });
        }
      }

      // Check if user has already submitted this assessment
      const existingResult = await prisma.assessmentResult.findFirst({
        where: {
          userId,
          assessmentId: id,
        },
      });

      if (existingResult) {
        return res
          .status(400)
          .json({ error: 'Assessment already submitted' });
      }

      // Calculate score
      let correctAnswers = 0;
      const totalQuestions = assessment.questions.length;

      assessment.questions.forEach((question) => {
        const userAnswer = answers[question.id];
        const correctAnswer = JSON.parse(question.correctAnswer);

        if (question.type === 'multiple_choice') {
          if (userAnswer === correctAnswer) {
            correctAnswers++;
          }
        } else if (question.type === 'true_false') {
          if (userAnswer === correctAnswer) {
            correctAnswers++;
          }
        }
      });

      const score = Math.round((correctAnswers / totalQuestions) * 100);
      const passed = score >= assessment.passingScore;

      // Save result
      const result = await prisma.assessmentResult.create({
        data: {
          userId,
          assessmentId: id,
          score,
          totalPoints: totalQuestions,
          answers: {
            create: Object.entries(answers).map(
              ([questionId, answer]) => {
                const question = assessment.questions.find(
                  (q) => q.id === questionId,
                );
                const correctAnswer = question
                  ? JSON.parse(question.correctAnswer)
                  : null;
                return {
                  questionId,
                  answer: JSON.stringify(answer),
                  isCorrect: answer === correctAnswer,
                };
              },
            ),
          },
        },
        include: {
          assessment: {
            include: {
              lesson: {
                include: {
                  course: true,
                },
              },
            },
          },
        },
      });

      res.json({
        result,
        feedback: {
          score,
          passed,
          correctAnswers,
          totalQuestions,
          passingScore: assessment.passingScore,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// Get user's assessment results
router.get('/assessments/results', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = '10', offset = '0' } = req.query;

    const results = await prisma.assessmentResult.findMany({
      where: { userId },
      include: {
        assessment: {
          select: {
            id: true,
            title: true,
            type: true,
            lesson: {
              select: {
                id: true,
                title: true,
                course: {
                  select: {
                    id: true,
                    title: true,
                    examType: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { completedAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.assessmentResult.count({ where: { userId } });

    res.json({
      results,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get specific assessment result
router.get('/assessments/results/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await prisma.assessmentResult.findUnique({
      where: {
        id,
        userId,
      },
      include: {
        assessment: {
          include: {
            lesson: {
              include: {
                course: true,
                subject: true,
              },
            },
            questions: {
              select: {
                id: true,
                question: true,
                type: true,
                options: true,
                difficulty: true,
                points: true,
                order: true,
                explanation: true,
              },
            },
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!result) {
      return res.status(404).json({ error: 'Result not found' });
    }

    res.json({ result });
  } catch (error) {
    next(error);
  }
});

// SUBSCRIPTION MANAGEMENT - Merged from subscriptions.js
// Get user's current subscription
router.get('/subscriptions/current', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
      orderBy: { endDate: 'desc' },
    });

    if (!subscription) {
      return res.json({
        subscription: null,
        hasActiveSubscription: false,
        planType: 'FREE',
      });
    }

    const isExpired = subscription.endDate < new Date();
    if (isExpired) {
      // Update subscription status if expired
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'EXPIRED' },
      });

      return res.json({
        subscription: null,
        hasActiveSubscription: false,
        planType: 'FREE',
      });
    }

    res.json({
      subscription,
      hasActiveSubscription: true,
      planType: subscription.planType,
      daysRemaining: Math.ceil(
        (subscription.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      ),
    });
  } catch (error) {
    next(error);
  }
});

// Get subscription history
router.get('/subscriptions/history', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = '1', limit = '10' } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.subscription.count({ where: { userId } }),
    ]);

    res.json({
      subscriptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Create subscription
router.post(
  '/subscriptions',
  authenticate,
  validate(createSubscriptionSchema),
  async (req, res, next) => {
    try {
      const { planType, stripeId } = req.body;
      const userId = req.user.id;

      // Check if user already has an active subscription
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: 'ACTIVE',
        },
      });

      if (existingSubscription && existingSubscription.endDate > new Date()) {
        return res
          .status(409)
          .json({ error: 'User already has an active subscription' });
      }

      // Calculate end date based on plan type
      let endDate = new Date();
      switch (planType) {
        case 'MONTHLY':
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case 'ANNUAL':
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
        case 'LIFETIME':
          endDate.setFullYear(endDate.getFullYear() + 100); // Far future date
          break;
        case 'FREE':
          endDate.setDate(endDate.getDate() + 7); // 7-day free trial
          break;
      }

      const subscription = await prisma.subscription.create({
        data: {
          userId,
          planType,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate,
          stripeId,
        },
      });

      // Create welcome notification
      await prisma.notification.create({
        data: {
          userId,
          title: 'Welcome to Mindboost!',
          message: `Your ${planType.toLowerCase()} subscription is now active. Start learning today!`,
          type: 'SYSTEM',
        },
      });

      res.status(201).json({
        message: 'Subscription created successfully',
        subscription,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Cancel subscription
router.put('/subscriptions/cancel', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'CANCELLED' },
    });

    // Create cancellation notification
    await prisma.notification.create({
      data: {
        userId,
        title: 'Subscription Cancelled',
        message:
          'Your subscription has been cancelled. You can continue using Mindboost until your current billing period ends.',
        type: 'SYSTEM',
      },
    });

    res.json({
      message: 'Subscription cancelled successfully',
      subscription: updatedSubscription,
    });
  } catch (error) {
    next(error);
  }
});

// Process payment for preparatory class subscription
router.post('/subscriptions/prep-classes/:classId/pay', authenticate, async (req, res, next) => {
  try {
    // Note: This would need to be properly implemented with actual payment processing
    // For now, we're just consolidating the route
    const { amount, paymentMethod } = req.body;
    const userId = req.user.id;
    const classId = req.params.classId;

    // In a real implementation, this would process the payment
    // For now, we'll just create a payment record

    const payment = await prisma.payment.create({
      data: {
        userId,
        classId,
        amount: parseFloat(amount),
        status: 'PAID',
        paymentMethod: paymentMethod || 'STRIPE'
      }
    });

    // Also create an enrollment for the user in this class
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        classId,
        status: 'ACTIVE',
        enrolledAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Payment processed and enrollment created successfully',
      payment,
      enrollment
    });
  } catch (error) {
    next(error);
  }
});

// NOTIFICATION MANAGEMENT - Merged from notifications.js
// Get user notifications
router.get('/notifications', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0, unreadOnly = false } = req.query;

    const where = { userId };
    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false }
    });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount
      }
    });
  } catch (error) {
    next(error);
  }
});

// Mark notification as read
router.patch('/notifications/:id/read', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true }
    });

    if (notification.count === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    next(error);
  }
});

// Mark all notifications as read
router.patch('/notifications/read-all', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
});

// Create notification (internal use)
router.post('/notifications', authenticate, async (req, res, next) => {
  try {
    const { userId, title, message, type } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({ error: 'User ID, title, and message are required' });
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: type || 'info'
      }
    });

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
});

// ACHIEVEMENT MANAGEMENT - Merged from achievements.js
// Get user achievements
router.get('/achievements', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true
      },
      orderBy: { unlockedAt: 'desc' }
    });

    const allAchievements = await prisma.achievement.findMany({
      orderBy: { points: 'desc' }
    });

    const achievedIds = userAchievements.map(ua => ua.achievementId);
    const availableAchievements = allAchievements.filter(a => !achievedIds.includes(a.id));

    res.json({
      success: true,
      data: {
        unlocked: userAchievements,
        available: availableAchievements,
        totalPoints: userAchievements.reduce((sum, ua) => sum + ua.achievement.points, 0)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get leaderboard
router.get('/achievements/leaderboard', async (req, res, next) => {
  try {
    const topUsers = await prisma.userAchievement.groupBy({
      by: ['userId'],
      _sum: {
        achievement: {
          points: true,
        },
      },
      orderBy: {
        _sum: {
          achievement: {
            points: 'desc',
          },
        },
      },
      take: 10,
    });

    const leaderboard = await Promise.all(
      topUsers.map(async (entry) => {
        const user = await prisma.user.findUnique({
          where: { id: entry.userId },
          select: { id: true, firstName: true, lastName: true },
        });
        return {
          userId: entry.userId,
          name: `${user?.firstName} ${user?.lastName}`,
          totalPoints: entry._sum.achievement?.points || 0,
        };
      })
    );

    res.json({
      success: true,
      data: {
        leaderboard
      }
    });
  } catch (error) {
    next(error);
  }
});

// FORUM MANAGEMENT - Merged from forums.js
// Get all forum topics with pagination
router.get('/forums', async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [topics, total] = await Promise.all([
      prisma.forumTopic.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true
            }
          },
          replies: {
            select: { id: true },
            take: 1
          },
          _count: {
            select: {
              replies: true,
              likes: true
            }
          }
        },
        orderBy: [
          { isPinned: 'desc' },
          { updatedAt: 'desc' }
        ],
        skip,
        take: Number(limit)
      }),
      prisma.forumTopic.count({ where })
    ]);

    const formattedTopics = topics.map(topic => ({
      id: topic.id,
      title: topic.title,
      content: topic.content,
      category: topic.category,
      author: `${topic.author.firstName} ${topic.author.lastName}`,
      authorRole: topic.author.role,
      replies: topic._count.replies,
      likes: topic._count.likes,
      views: topic.views,
      isPinned: topic.isPinned,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
      hasNewReplies: topic.replies.length > 0
    }));

    res.json({
      success: true,
      data: {
        topics: formattedTopics,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get single topic with replies
router.get('/forums/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Increment view count
    await prisma.forumTopic.update({
      where: { id },
      data: { views: { increment: 1 } }
    });

    const topic = await prisma.forumTopic.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true
          }
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
                avatar: true
              }
            },
            _count: {
              select: { likes: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: {
            replies: true,
            likes: true
          }
        }
      }
    });

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    const formattedTopic = {
      id: topic.id,
      title: topic.title,
      content: topic.content,
      category: topic.category,
      author: `${topic.author.firstName} ${topic.author.lastName}`,
      authorRole: topic.author.role,
      authorAvatar: topic.author.avatar,
      replies: topic._count.replies,
      likes: topic._count.likes,
      views: topic.views,
      isPinned: topic.isPinned,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
      repliesData: topic.replies.map(reply => ({
        id: reply.id,
        content: reply.content,
        author: `${reply.author.firstName} ${reply.author.lastName}`,
        authorRole: reply.author.role,
        authorAvatar: reply.author.avatar,
        likes: reply._count.likes,
        createdAt: reply.createdAt,
        isInstructor: reply.author.role === 'TEACHER'
      }))
    };

    res.json({
      success: true,
      data: formattedTopic
    });
  } catch (error) {
    next(error);
  }
});

// Create new topic
router.post('/forums', authenticate, async (req, res, next) => {
  try {
    const { title, content, category } = req.body;
    const userId = req.user.id;

    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Title, content, and category are required' });
    }

    const newTopic = await prisma.forumTopic.create({
      data: {
        title,
        content,
        category,
        authorId: userId,
        isPinned: false
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        _count: {
          select: {
            replies: true,
            likes: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: newTopic
    });
  } catch (error) {
    next(error);
  }
});

// Add reply to topic
router.post('/forums/:id/replies', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Check if topic exists
    const topic = await prisma.forumTopic.findUnique({ where: { id } });
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    const newReply = await prisma.forumReply.create({
      data: {
        content,
        topicId: id,
        authorId: userId
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true
          }
        }
      }
    });

    // Update topic's updatedAt timestamp
    const updatedTopic = await prisma.forumTopic.update({
      where: { id },
      data: { updatedAt: new Date() },
      select: { title: true }
    });

    res.status(201).json({
      success: true,
      data: newReply
    });
  } catch (error) {
    next(error);
  }
});

// Like/unlike topic
router.post('/forums/:id/like', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if already liked
    const existingLike = await prisma.forumLike.findUnique({
      where: {
        userId_topicId: {
          userId,
          topicId: id
        }
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.forumLike.delete({
        where: { id: existingLike.id }
      });
      res.json({ success: true, liked: false });
    } else {
      // Like
      await prisma.forumLike.create({
        data: {
          userId,
          topicId: id
        }
      });
      res.json({ success: true, liked: true });
    }
  } catch (error) {
    next(error);
  }
});

// Like/unlike reply
router.post('/forums/replies/:replyId/like', authenticate, async (req, res, next) => {
  try {
    const { replyId } = req.params;
    const userId = req.user.id;

    // Check if already liked
    const existingLike = await prisma.forumLike.findUnique({
      where: {
        userId_replyId: {
          userId,
          replyId
        }
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.forumLike.delete({
        where: { id: existingLike.id }
      });
      res.json({ success: true, liked: false });
    } else {
      // Like
      await prisma.forumLike.create({
        data: {
          userId,
          replyId
        }
      });
      res.json({ success: true, liked: true });
    }
  } catch (error) {
    next(error);
  }
});

// Create a study group
router.post('/forums/study-groups', authenticate, async (req, res, next) => {
  try {
    const { name, description, maxMembers, classId } = req.body;
    const userId = req.user.id;

    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    const studyGroup = await prisma.studyGroup.create({
      data: {
        name,
        description,
        maxMembers: maxMembers || 10,
        classId,
        createdById: userId,
        members: {
          create: {
            userId,
            role: 'ADMIN'
          }
        }
      },
      include: {
        members: true,
        createdBy: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: studyGroup
    });
  } catch (error) {
    next(error);
  }
});

// Get study groups
router.get('/forums/study-groups', async (req, res, next) => {
  try {
    const { classId } = req.query;

    const where = {};
    if (classId) {
      where.classId = classId;
    }

    const studyGroups = await prisma.studyGroup.findMany({
      where,
      include: {
        members: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true }
            }
          }
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true }
        },
        _count: {
          select: {
            members: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: studyGroups
    });
  } catch (error) {
    next(error);
  }
});

// Join a study group
router.post('/forums/study-groups/:groupId/join', authenticate, async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id: groupId },
      include: { members: true }
    });

    if (!studyGroup) {
      return res.status(404).json({ error: 'Study group not found' });
    }

    if (studyGroup.members.length >= studyGroup.maxMembers) {
      return res.status(400).json({ error: 'Study group is full' });
    }

    await prisma.studyGroupMember.create({
      data: {
        userId,
        studyGroupId: groupId,
        role: 'MEMBER'
      }
    });

    res.json({
      success: true,
      message: 'Joined study group successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Leave a study group
router.post('/forums/study-groups/:groupId/leave', authenticate, async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    await prisma.studyGroupMember.deleteMany({
      where: {
        userId,
        studyGroupId: groupId
      }
    });

    res.json({
      success: true,
      message: 'Left study group successfully'
    });
  } catch (error) {
    next(error);
  }
});

// MESSAGE MANAGEMENT - Merged from messages.js
// Helper to check if two users share any preparatory class (either both enrolled or one is a teacher of the class)
async function usersShareClass(prisma, a, b) {
  // Check enrollments
  const aEnrollments = await prisma.enrollment.findMany({ where: { userId: a }, select: { classId: true } });
  const bEnrollments = await prisma.enrollment.findMany({ where: { userId: b }, select: { classId: true } });
  const aClasses = new Set(aEnrollments.map(e => e.classId));
  const sharedByEnrollment = bEnrollments.some(e => aClasses.has(e.classId));
  if (sharedByEnrollment) return true;

  // Check teacher assignments
  const aTeaching = await prisma.classTeacher.findMany({ where: { teacherId: a }, select: { classId: true } });
  const bTeaching = await prisma.classTeacher.findMany({ where: { teacherId: b }, select: { classId: true } });
  const aTeachClasses = new Set(aTeaching.map(t => t.classId));
  const bTeachClasses = new Set(bTeaching.map(t => t.classId));
  const sharedTeaching = [...aTeachClasses].some(id => bTeachClasses.has(id));
  if (sharedTeaching) return true;

  // Check teacher-to-learner in same class
  const bEnrollClassSet = new Set(bEnrollments.map(e => e.classId));
  const teacherToLearner = aTeaching.some(t => bEnrollClassSet.has(t.classId));
  if (teacherToLearner) return true;

  const aEnrollClassSet = new Set(aEnrollments.map(e => e.classId));
  const learnerToTeacher = bTeaching.some(t => aEnrollClassSet.has(t.classId));
  return learnerToTeacher;
}

// Send a message
router.post('/messages/send', authenticate, async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const { recipientId, content } = req.body;

    if (!recipientId || !content) {
      return res.status(400).json({ error: 'recipientId and content are required' });
    }

    const allowed = await usersShareClass(prisma, senderId, recipientId);
    if (!allowed) {
      return res.status(403).json({ error: 'You can only message users within your classes' });
    }

    const msg = await prisma.privateMessage.create({
      data: { senderId, recipientId, content }
    });

    // Notify recipient
    try {
      await prisma.notification.create({
        data: {
          userId: recipientId,
          title: 'New Message',
          message: 'You have a new message from your class contact.',
          type: 'message'
        }
      });
    } catch { }

    res.status(201).json(msg);
  } catch (error) {
    next(error);
  }
});

// List conversation between current user and target user
router.get('/messages/with/:userId', authenticate, async (req, res, next) => {
  try {
    const me = req.user.id;
    const other = req.params.userId;

    const allowed = await usersShareClass(prisma, me, other);
    if (!allowed) {
      return res.status(403).json({ error: 'You can only view messages with users in your classes' });
    }

    const messages = await prisma.privateMessage.findMany({
      where: {
        OR: [
          { senderId: me, recipientId: other },
          { senderId: other, recipientId: me }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(messages);
  } catch (error) {
    next(error);
  }
});

// LEARNING PATH MANAGEMENT - Merged from learningPaths.js
// Get user's learning paths
router.get('/learning-paths/my', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { isActive } = req.query;

    const where = { userId };
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const learningPaths = await prisma.learningPath.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          orderBy: { order: 'asc' },
          include: {
            // We'll need to join with courses manually since courseId is just a string
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    // Get course details for each learning path item
    for (const path of learningPaths) {
      for (const item of path.items) {
        const course = await prisma.course.findUnique({
          where: { id: item.courseId },
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
            duration: true,
            level: true,
          },
        });
        item.course = course;
      }
    }

    res.json({ learningPaths });
  } catch (error) {
    next(error);
  }
});

// Get single learning path
router.get('/learning-paths/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const learningPath = await prisma.learningPath.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!learningPath || learningPath.userId !== userId) {
      return res.status(404).json({ error: 'Learning path not found' });
    }

    // Get course details for each item
    for (const item of learningPath.items) {
      const course = await prisma.course.findUnique({
        where: { id: item.courseId },
        select: {
          id: true,
          title: true,
          description: true,
          thumbnail: true,
          duration: true,
          level: true,
        },
      });
      item.course = course;

      // Check if user has completed this course
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: item.courseId,
          },
        },
      });
      item.enrollment = enrollment;
    }

    res.json({ learningPath });
  } catch (error) {
    next(error);
  }
});

// Create learning path
router.post(
  '/learning-paths',
  authenticate,
  validate(createLearningPathSchema),
  async (req, res, next) => {
    try {
      const { name, description, examType, targetDate, courseIds } = req.body;
      const userId = req.user.id;

      // Verify all courses exist
      const courses = await prisma.course.findMany({
        where: {
          id: { in: courseIds },
          isPublished: true,
        },
      });

      if (courses.length !== courseIds.length) {
        return res
          .status(400)
          .json({ error: 'One or more courses not found or not published' });
      }

      const learningPath = await prisma.learningPath.create({
        data: {
          userId,
          name,
          description,
          examType,
          targetDate: targetDate ? new Date(targetDate) : null,
          items: {
            create: courseIds.map((courseId, index) => ({
              courseId,
              order: index + 1,
            })),
          },
        },
        include: {
          items: {
            orderBy: { order: 'asc' },
          },
        },
      });

      res.status(201).json({
        message: 'Learning path created successfully',
        learningPath,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Update learning path
router.put(
  '/learning-paths/:id',
  authenticate,
  validate(updateLearningPathSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { targetDate, ...updateData } = req.body;

      const existingPath = await prisma.learningPath.findUnique({
        where: { id },
      });

      if (!existingPath || existingPath.userId !== userId) {
        return res.status(404).json({ error: 'Learning path not found' });
      }

      const learningPath = await prisma.learningPath.update({
        where: { id },
        data: {
          ...updateData,
          targetDate: targetDate ? new Date(targetDate) : undefined,
        },
      });

      res.json({
        message: 'Learning path updated successfully',
        learningPath,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Delete learning path
router.delete('/learning-paths/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const learningPath = await prisma.learningPath.findUnique({
      where: { id },
    });

    if (!learningPath || learningPath.userId !== userId) {
      return res.status(404).json({ error: 'Learning path not found' });
    }

    await prisma.learningPath.delete({
      where: { id },
    });

    res.json({ message: 'Learning path deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Mark learning path item as completed
router.put(
  '/learning-paths/:pathId/items/:itemId/complete',
  authenticate,
  async (req, res, next) => {
    try {
      const { pathId, itemId } = req.params;
      const userId = req.user.id;

      // Verify learning path belongs to user
      const learningPath = await prisma.learningPath.findUnique({
        where: { id: pathId },
      });

      if (!learningPath || learningPath.userId !== userId) {
        return res.status(404).json({ error: 'Learning path not found' });
      }

      const item = await prisma.learningPathItem.update({
        where: { id: itemId },
        data: { isCompleted: true },
      });

      res.json({
        message: 'Learning path item marked as completed',
        item,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Generate AI-recommended learning path
router.post('/learning-paths/generate', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { examType, targetDate, availableHours = 2 } = req.body;

    // Get user's current level and preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentLevel: true,
        examTargets: true,
        learningGoals: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's assessment history to determine strengths/weaknesses
    const assessmentResults = await prisma.assessmentResult.findMany({
      where: {
        userId,
        assessment: {
          lesson: {
            course: {
              examType,
            },
          },
        },
      },
      include: {
        assessment: {
          include: {
            lesson: {
              include: {
                course: {
                  select: {
                    id: true,
                    title: true,
                    level: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { completedAt: 'desc' },
      take: 20,
    });

    // Analyze performance to identify weak areas
    const coursePerformance = new Map();
    const weakAreas = [];

    assessmentResults.forEach((result) => {
      if (result.assessment.lesson?.course) {
        const courseId = result.assessment.lesson.course.id;
        const existing = coursePerformance.get(courseId) || {
          total: 0,
          count: 0,
        };
        coursePerformance.set(courseId, {
          total: existing.total + result.score,
          count: existing.count + 1,
          course: result.assessment.lesson.course,
        });
      }
    });

    // Extract weak areas
    Array.from(coursePerformance.entries())
      .filter(([_, perf]) => perf.total / perf.count < 70)
      .forEach(([_, perf]) => weakAreas.push(perf.course.title));

    if (weakAreas.length === 0) {
      weakAreas.push('general preparation', 'exam fundamentals');
    }

    // Get recommended courses based on exam type and user level
    const recommendedCourses = await prisma.course.findMany({
      where: {
        examType,
        level: user.currentLevel,
        isPublished: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });

    // Prioritize courses based on performance (put weaker areas first)
    const sortedCourses = recommendedCourses.sort((a, b) => {
      const aPerf = coursePerformance.get(a.id);
      const bPerf = coursePerformance.get(b.id);

      if (!aPerf && !bPerf) return 0;
      if (!aPerf) return -1; // Prioritize courses not taken
      if (!bPerf) return 1;

      const aAvg = aPerf.total / aPerf.count;
      const bAvg = bPerf.total / bPerf.count;

      return aAvg - bAvg; // Lower scores first (weaker areas)
    });

    // Calculate optimal scheduling based on available hours and target date
    const totalDuration = sortedCourses.reduce(
      (sum, course) => sum + course.duration,
      0,
    );
    const daysUntilTarget = targetDate
      ? Math.ceil(
        (new Date(targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      )
      : 90; // Default 3 months

    const dailyHours = Math.min(
      availableHours,
      totalDuration / Math.max(daysUntilTarget, 1),
    );

    // Create the learning path
    const learningPath = await prisma.learningPath.create({
      data: {
        userId,
        name: `AI-Generated ${examType} Study Plan`,
        description: `Personalized learning path for ${examType} exam preparation. Estimated ${totalDuration} hours of study over ${daysUntilTarget} days.`,
        examType,
        targetDate: targetDate ? new Date(targetDate) : null,
        items: {
          create: sortedCourses.map((course, index) => ({
            courseId: course.id,
            order: index + 1,
            scheduledDate: targetDate
              ? new Date(Date.now() + index * 7 * 24 * 60 * 60 * 1000)
              : null, // Weekly intervals
          })),
        },
      },
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
      },
    });

    res.status(201).json({
      message: 'AI-generated learning path created successfully',
      learningPath,
      recommendations: {
        estimatedDuration: totalDuration,
        dailyHours: Math.round(dailyHours * 10) / 10,
        daysUntilTarget,
        weakAreas,
      },
    });
  } catch (error) {
    next(error);
  }
});

// SCHEDULER FUNCTIONS - Merged from scheduler.js
// Set user availability
router.post('/scheduler/availability', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { availability } = req.body;

    if (!Array.isArray(availability)) {
      return res.status(400).json({ error: 'Availability must be an array' });
    }

    await intelligentScheduler.setUserAvailability(userId, availability);

    res.json({
      success: true,
      message: 'Availability updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get user availability
router.get('/scheduler/availability', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const availability = await intelligentScheduler.getUserAvailability(userId);

    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    next(error);
  }
});

// Generate optimal schedule
router.post('/scheduler/generate', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { targetExamDate } = req.body;

    const schedule = await intelligentScheduler.generateOptimalSchedule(
      userId,
      targetExamDate ? new Date(targetExamDate) : undefined
    );

    res.json({
      success: true,
      data: schedule,
      message: `Generated ${schedule.length} study sessions`
    });
  } catch (error) {
    next(error);
  }
});

// Get scheduled sessions
router.get('/scheduler/sessions', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const sessions = await intelligentScheduler.getScheduledSessions(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
});

// Update session status
router.patch('/scheduler/sessions/:sessionId', authenticate, async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { status, actualDuration } = req.body;

    await intelligentScheduler.updateSessionStatus(sessionId, status, actualDuration);

    res.json({
      success: true,
      message: 'Session status updated'
    });
  } catch (error) {
    next(error);
  }
});

// Get daily recommendations
router.get('/scheduler/daily-recommendations', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const recommendations = await intelligentScheduler.getDailyRecommendations(userId);

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
});

// Get learning patterns analysis
router.get('/scheduler/learning-patterns', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const patterns = await intelligentScheduler.analyzeLearningPatterns(userId);

    res.json({
      success: true,
      data: patterns
    });
  } catch (error) {
    next(error);
  }
});

export default router;