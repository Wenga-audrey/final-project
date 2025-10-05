import express from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validation.js";

const router = express.Router();

// Validation schemas
const submitAssessmentSchema = z.object({
  answers: z.record(z.string(), z.any()),
});

// Get assessments for a lesson
router.get(
  "/lesson/:lessonId",
  authenticate,
  async (req, res, next) => {
    try {
      const { lessonId } = req.params;
      const userId = req.user.id;

      // Check if lesson exists and user is enrolled
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { course: true },
      });

      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found" });
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
            error: "You must be enrolled in the course to access assessments",
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
  },
);

// Get single assessment with questions
router.get("/:id", authenticate, async (req, res, next) => {
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
          orderBy: { order: "asc" },
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
      return res.status(404).json({ error: "Assessment not found" });
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
              "You must be enrolled in the course to access this assessment",
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
  "/:id/submit",
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
        return res.status(404).json({ error: "Assessment not found" });
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
                "You must be enrolled in the course to submit this assessment",
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
          .json({ error: "Assessment already submitted" });
      }

      // Calculate score
      let correctAnswers = 0;
      const totalQuestions = assessment.questions.length;

      assessment.questions.forEach((question) => {
        const userAnswer = answers[question.id];
        const correctAnswer = JSON.parse(question.correctAnswer);

        if (question.type === "multiple_choice") {
          if (userAnswer === correctAnswer) {
            correctAnswers++;
          }
        } else if (question.type === "true_false") {
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
router.get("/results", authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = "10", offset = "0" } = req.query;

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
      orderBy: { completedAt: "desc" },
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
router.get("/results/:id", authenticate, async (req, res, next) => {
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
      return res.status(404).json({ error: "Result not found" });
    }

    res.json({ result });
  } catch (error) {
    next(error);
  }
});

// Get assessment analytics (teacher/admin only)
router.get(
  "/:id/analytics",
  authenticate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Verify teacher access
      const assessment = await prisma.assessment.findUnique({
        where: { id },
        include: {
          lesson: {
            include: {
              subject: {
                include: {
                  class: {
                    include: {
                      teachers: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }

      const isTeacher = assessment.lesson?.subject?.class?.teachers?.some(
        (t) => t.teacherId === userId,
      );
      const isAdmin = req.user.role === "ADMIN";

      if (!isTeacher && !isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Get results
      const results = await prisma.assessmentResult.findMany({
        where: { assessmentId: id },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              currentLevel: true,
            },
          },
        },
        orderBy: { completedAt: "desc" },
      });

      // Calculate statistics
      const totalResults = results.length;
      const averageScore =
        totalResults > 0
          ? results.reduce((sum, result) => sum + result.score, 0) /
          totalResults
          : 0;

      const passingResults = results.filter(
        (result) => result.score >= assessment.passingScore,
      );
      const passRate =
        totalResults > 0 ? (passingResults.length / totalResults) * 100 : 0;

      // Score distribution
      const scoreRanges = {
        "0-20": 0,
        "21-40": 0,
        "41-60": 0,
        "61-80": 0,
        "81-100": 0,
      };

      results.forEach((result) => {
        if (result.score <= 20) scoreRanges["0-20"]++;
        else if (result.score <= 40) scoreRanges["21-40"]++;
        else if (result.score <= 60) scoreRanges["41-60"]++;
        else if (result.score <= 80) scoreRanges["61-80"]++;
        else scoreRanges["81-100"]++;
      });

      res.json({
        assessment: {
          id: assessment.id,
          title: assessment.title,
          type: assessment.type,
          passingScore: assessment.passingScore,
        },
        statistics: {
          totalResults,
          averageScore: Math.round(averageScore),
          passRate: Math.round(passRate),
          scoreDistribution: scoreRanges,
        },
        results: results.map((result) => ({
          id: result.id,
          userId: result.userId,
          userName: `${result.user.firstName} ${result.user.lastName}`,
          userLevel: result.user.currentLevel,
          score: result.score,
          completedAt: result.completedAt,
          passed: result.score >= assessment.passingScore,
        })),
      });
    } catch (error) {
      next(error);
    }
  },
);

// Admin routes
router.use((req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
});

// Create assessment
router.post("/", async (req, res, next) => {
  try {
    const { lessonId, title, description, type, timeLimit, passingScore, questions, isPublished } = req.body;

    const assessment = await prisma.assessment.create({
      data: {
        lessonId,
        title,
        description,
        type,
        timeLimit: parseInt(timeLimit),
        passingScore: parseInt(passingScore),
        isPublished: isPublished === true,
        questions: {
          create: questions.map((q, index) => ({
            question: q.question,
            type: q.type,
            options: JSON.stringify(q.options || []),
            correctAnswer: JSON.stringify(q.correctAnswer),
            explanation: q.explanation,
            difficulty: q.difficulty,
            points: parseInt(q.points) || 1,
            order: index + 1,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    res.status(201).json({ assessment });
  } catch (error) {
    next(error);
  }
});

// Update assessment
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Parse numeric fields
    const updateData = { ...data };
    if (data.timeLimit) updateData.timeLimit = parseInt(data.timeLimit);
    if (data.passingScore) updateData.passingScore = parseInt(data.passingScore);

    const assessment = await prisma.assessment.update({
      where: { id },
      data: updateData,
    });

    res.json({ assessment });
  } catch (error) {
    next(error);
  }
});

// Delete assessment
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.assessment.delete({
      where: { id },
    });

    res.json({ message: "Assessment deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
