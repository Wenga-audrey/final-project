import express from 'express';
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// Since exam simulations functionality might be consolidated elsewhere,
// we'll create a placeholder that redirects to the appropriate routes
// or implement basic exam simulation functionality if needed

// Placeholder route
router.get('/', (req, res) => {
  res.json({
    message: 'Exam simulations functionality may be consolidated into other modules',
    status: 'placeholder'
  });
});

// Get exam simulations for a module
router.get("/module/:moduleId", async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const { year, isOfficial } = req.query;

    const where = { examModuleId: moduleId };
    if (year) where.year = parseInt(year);
    if (isOfficial !== undefined) where.isOfficial = isOfficial === 'true';

    const simulations = await prisma.examSimulation.findMany({
      where,
      include: {
        examModule: {
          select: { name: true, code: true }
        },
        _count: {
          select: {
            questions: true,
            results: true
          }
        }
      },
      orderBy: [
        { isOfficial: 'desc' },
        { year: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({
      success: true,
      data: simulations
    });
  } catch (error) {
    next(error);
  }
});

// Get specific simulation
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const simulation = await prisma.examSimulation.findUnique({
      where: { id },
      include: {
        examModule: true,
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            question: true,
            options: true,
            difficulty: true,
            points: true,
            order: true,
            syllabusTopicId: true,
            syllabusTopic: {
              select: { title: true }
            }
          }
        },
        _count: {
          select: { results: true }
        }
      }
    });

    if (!simulation) {
      return res.status(404).json({ error: "Simulation not found" });
    }

    res.json({
      success: true,
      data: simulation
    });
  } catch (error) {
    next(error);
  }
});

// Start simulation (for authenticated users)
router.post("/:id/start", authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user already has an active session
    const existingResult = await prisma.simulationResult.findFirst({
      where: {
        userId,
        examSimulationId: id,
        completedAt: null
      }
    });

    if (existingResult) {
      return res.status(400).json({
        error: "You already have an active simulation session",
        resultId: existingResult.id
      });
    }

    const simulation = await prisma.examSimulation.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            question: true,
            options: true,
            difficulty: true,
            points: true,
            order: true,
            syllabusTopicId: true,
            syllabusTopic: {
              select: { title: true }
            }
          }
        }
      }
    });

    if (!simulation) {
      return res.status(404).json({ error: "Simulation not found" });
    }

    // Create simulation result record
    const result = await prisma.simulationResult.create({
      data: {
        userId,
        examSimulationId: id,
        score: 0,
        maxScore: simulation.questions.reduce((sum, q) => sum + q.points, 0),
        timeSpent: 0,
        answers: {}
      }
    });

    res.json({
      success: true,
      data: {
        resultId: result.id,
        simulation: {
          id: simulation.id,
          title: simulation.title,
          duration: simulation.duration,
          questionCount: simulation.questionCount,
          passingScore: simulation.passingScore
        },
        questions: simulation.questions,
        startTime: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// Submit simulation answers
router.post("/:id/submit", authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { resultId, answers, timeSpent } = req.body;

    if (!resultId || !answers) {
      return res.status(400).json({ error: "Result ID and answers are required" });
    }

    // Get simulation with questions and correct answers
    const simulation = await prisma.examSimulation.findUnique({
      where: { id },
      include: {
        questions: true
      }
    });

    if (!simulation) {
      return res.status(404).json({ error: "Simulation not found" });
    }

    // Calculate score
    let score = 0;
    const detailedAnswers = {};

    simulation.questions.forEach(question => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;

      if (isCorrect) {
        score += question.points;
      }

      detailedAnswers[question.id] = {
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        points: question.points,
        earnedPoints: isCorrect ? question.points : 0
      };
    });

    // Update result
    const updatedResult = await prisma.simulationResult.update({
      where: { id: resultId },
      data: {
        score,
        timeSpent: parseInt(timeSpent) || 0,
        answers: detailedAnswers,
        completedAt: new Date()
      },
      include: {
        examSimulation: {
          select: {
            title: true,
            passingScore: true,
            maxScore: true
          }
        }
      }
    });

    // Check if passed
    const passed = score >= simulation.passingScore;
    const percentage = Math.round((score / simulation.maxScore) * 100);

    res.json({
      success: true,
      data: {
        result: updatedResult,
        score,
        percentage,
        passed,
        maxScore: simulation.maxScore
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get user's simulation history
router.get("/history", authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = '10', offset = '0' } = req.query;

    const results = await prisma.simulationResult.findMany({
      where: { userId },
      include: {
        examSimulation: {
          select: {
            title: true,
            year: true,
            isOfficial: true,
            examModule: {
              select: {
                name: true,
                code: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const total = await prisma.simulationResult.count({ where: { userId } });

    res.json({
      success: true,
      data: results,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Admin routes
router.use(requireAdmin);

// Create new simulation
router.post("/", async (req, res, next) => {
  try {
    const { examModuleId, title, year, duration, questionCount, maxScore, passingScore, isOfficial } = req.body;

    const simulation = await prisma.examSimulation.create({
      data: {
        examModuleId,
        title,
        year: parseInt(year),
        duration: parseInt(duration),
        questionCount: parseInt(questionCount),
        maxScore: parseInt(maxScore),
        passingScore: parseInt(passingScore),
        isOfficial: isOfficial === true
      }
    });

    res.status(201).json({
      success: true,
      data: simulation
    });
  } catch (error) {
    next(error);
  }
});

// Add questions to simulation
router.post("/:id/questions", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { questions } = req.body;

    if (!Array.isArray(questions)) {
      return res.status(400).json({ error: "Questions must be an array" });
    }

    const createdQuestions = await Promise.all(
      questions.map((question, index) =>
        prisma.simulationQuestion.create({
          data: {
            examSimulationId: id,
            question: question.question,
            options: question.options,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            difficulty: question.difficulty,
            points: parseInt(question.points) || 1,
            order: index + 1,
            syllabusTopicId: question.syllabusTopicId
          }
        })
      )
    );

    // Update simulation question count and max score
    const totalQuestions = createdQuestions.length;
    const totalPoints = createdQuestions.reduce((sum, q) => sum + q.points, 0);

    await prisma.examSimulation.update({
      where: { id },
      data: {
        questionCount: totalQuestions,
        maxScore: totalPoints
      }
    });

    res.status(201).json({
      success: true,
      data: createdQuestions
    });
  } catch (error) {
    next(error);
  }
});

// Update simulation
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Parse numeric fields
    const updateData = { ...data };
    if (data.year) updateData.year = parseInt(data.year);
    if (data.duration) updateData.duration = parseInt(data.duration);
    if (data.questionCount) updateData.questionCount = parseInt(data.questionCount);
    if (data.maxScore) updateData.maxScore = parseInt(data.maxScore);
    if (data.passingScore) updateData.passingScore = parseInt(data.passingScore);

    const simulation = await prisma.examSimulation.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      data: simulation
    });
  } catch (error) {
    next(error);
  }
});

// Delete simulation
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.examSimulation.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: "Simulation deleted successfully"
    });
  } catch (error) {
    next(error);
  }
});

export default router;