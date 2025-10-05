import express from "express";
import { createAIService } from '../lib/aiService.js';
import { authenticate } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = express.Router();
const aiService = createAIService();

// Generate adaptive quiz questions
router.post('/generate-quiz', authenticate, async (req, res, next) => {
  try {
    const { content, type = 'chapter', config } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Generate AI content using our consolidated service
    const aiResponse = await aiService.generateAdaptiveQuizQuestions(content, type, config);

    if (!aiResponse.success) {
      return res.status(500).json({ error: 'Failed to generate quiz' });
    }

    let items = [];
    try {
      items = JSON.parse(aiResponse.content);
    } catch (parseErr) {
      return res.status(500).json({ error: 'Invalid quiz format generated' });
    }

    res.json({
      success: true,
      questions: items
    });
  } catch (error) {
    next(error);
  }
});

// Generate study suggestions
router.post('/study-suggestions', authenticate, async (req, res, next) => {
  try {
    const { weakAreas, userPerformance, learnerProfile, quizHistory } = req.body;

    if (!weakAreas || !userPerformance) {
      return res.status(400).json({ error: 'weakAreas and userPerformance are required' });
    }

    // Generate AI content using our consolidated service
    const aiResponse = await aiService.generateStudySuggestions(
      weakAreas,
      userPerformance,
      learnerProfile || {
        userId: req.user.id,
        currentLevel: 'INTERMEDIATE',
        weakAreas: [],
        strongAreas: [],
        averageScore: 70,
        recentPerformance: [70],
        preferredDifficulty: 'MEDIUM'
      }
    );

    if (!aiResponse.success) {
      return res.status(500).json({ error: 'Failed to generate study suggestions' });
    }

    let suggestions = {};
    try {
      suggestions = JSON.parse(aiResponse.content);
    } catch (parseErr) {
      suggestions = aiResponse.content; // Return as string if not valid JSON
    }

    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    next(error);
  }
});

// Generate lesson content
router.post('/lesson-content', authenticate, async (req, res, next) => {
  try {
    const { topic, level = 'INTERMEDIATE', format = 'comprehensive' } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    // Generate AI content using our consolidated service
    const aiResponse = await aiService.generateLessonContent(topic, level, format);

    if (!aiResponse.success) {
      return res.status(500).json({ error: 'Failed to generate lesson content' });
    }

    res.json({
      success: true,
      content: aiResponse.content
    });
  } catch (error) {
    next(error);
  }
});

// Generate post-lesson quiz
router.post('/post-lesson-quiz', authenticate, async (req, res, next) => {
  try {
    const { lessonId, count = 5, difficulty = 'MEDIUM' } = req.body;
    if (!lessonId) return res.status(400).json({ error: 'lessonId is required' });

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    // Generate AI content using our consolidated service
    const config = {
      questionCount: count,
      difficulty: difficulty,
      learnerProfile: {
        currentLevel: difficulty === 'EASY' ? 'BEGINNER' :
          difficulty === 'HARD' ? 'ADVANCED' : 'INTERMEDIATE'
      }
    };

    const aiResponse = await aiService.generateAdaptiveQuizQuestions(
      {
        title: lesson.title,
        content: lesson.content
      },
      'lesson',
      config
    );

    if (!aiResponse.success) {
      return res.status(500).json({ error: 'Failed to generate quiz' });
    }

    let items = [];
    try {
      items = JSON.parse(aiResponse.content);
    } catch (parseErr) {
      return res.status(500).json({ error: 'Invalid quiz format generated' });
    }

    // Create quiz
    const quiz = await prisma.chapterQuiz.create({
      data: {
        chapterId: lesson.chapterId,
        title: `${lesson.title} - Post-lesson Quiz`,
        description: `Auto-generated quiz for lesson: ${lesson.title}`,
        timeLimit: Math.max(10, Math.min(90, Number(count) * 2)),
        passingScore: 60,
        isActive: true,
        createdById: req.user.id,
        source: 'AI',
      }
    });

    // Persist questions
    const createdQuestions = await Promise.all(items.map((q, idx) =>
      prisma.quizQuestion.create({
        data: {
          chapterQuizId: quiz.id,
          subjectQuizId: null,
          question: String(q.question ?? q.stem ?? ''),
          type: 'multiple-choice',
          options: q.options ? q.options : q.choices ? q.choices : null,
          correctAnswer: String(q.correctAnswer ?? ''),
          explanation: q.explanation ? String(q.explanation) : null,
          difficulty: String(q.difficulty ?? difficulty),
          points: 1,
          order: idx + 1,
          isAIGenerated: true,
        }
      })
    ));

    // Notify enrolled learners in the related class
    try {
      await notifyClassLearnersForChapterQuiz(prisma, lesson.chapterId, quiz.id, `${lesson.title} - Post-lesson Quiz`);
    } catch (notifyErr) {
      console.error('Failed to send quiz notifications:', notifyErr);
    }

    return res.json({
      success: true,
      quiz: { id: quiz.id, level: 'CHAPTER', count: createdQuestions.length },
      questions: createdQuestions.map(q => ({ id: q.id, question: q.question, options: q.options }))
    });
  } catch (error) {
    next(error);
  }
});

// Generate performance insights
router.get('/performance-insights', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { timeframe = 'week' } = req.query;

    // Get user performance data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        quizResults: {
          orderBy: { id: 'desc' },
          take: 10
        }
      }
    });

    if (!user || !user.quizResults.length) {
      return res.json({
        success: true,
        insights: {
          overallAssessment: "Not enough data yet. Keep taking quizzes to get personalized insights!",
          strengths: ["Getting started with learning"],
          areasForImprovement: ["Take more assessments"],
          recommendations: ["Complete your first few quizzes", "Establish a regular study routine"],
          nextSteps: ["Take a practice quiz", "Set study goals"],
          motivationalMessage: "Every expert was once a beginner. You're on the right track!",
          predictedOutcome: "With consistent practice, you'll see great improvement"
        }
      });
    }

    const averageScore = user.quizResults.reduce((sum, a) => sum + a.score, 0) / user.quizResults.length;
    const studentData = {
      averageScore: Math.round(averageScore),
      completedLessons: user.quizResults.length,
      studyTime: user.quizResults.length * 0.5, // Estimate
      strongSubjects: user.quizResults.filter(a => a.score >= 80).map(a => 'General'),
      weakSubjects: user.quizResults.filter(a => a.score < 60).map(a => 'General'),
      quizAttempts: user.quizResults.length,
      trend: user.quizResults.length > 1 ?
        (user.quizResults[0].score > user.quizResults[1].score ? 'Improving' : 'Stable') : 'Stable'
    };

    // Generate AI content using our consolidated service
    const aiResponse = await aiService.analyzePerformance(studentData, timeframe);

    if (!aiResponse.success) {
      return res.json({
        success: true,
        insights: {
          overallAssessment: `Your average score is ${studentData.averageScore}%. Keep up the good work!`,
          strengths: studentData.strongSubjects,
          areasForImprovement: studentData.weakSubjects,
          recommendations: ["Practice regularly", "Focus on weak areas"],
          nextSteps: ["Take more quizzes", "Review challenging topics"],
          motivationalMessage: "You're making progress! Keep learning consistently.",
          predictedOutcome: "Continued improvement expected with regular practice"
        }
      });
    }

    try {
      const insights = JSON.parse(aiResponse.content);
      res.json({ success: true, insights });
    } catch (parseError) {
      res.json({
        success: true,
        insights: {
          overallAssessment: aiResponse.content,
          recommendations: ["Keep practicing", "Stay consistent"],
          motivationalMessage: "You're doing great! Keep up the momentum."
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

// Generate study reminders
router.post('/study-reminder', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        quizResults: { take: 1, orderBy: { id: 'desc' } }
      }
    });

    const userProgress = {
      completedCourses: user?.quizResults.length || 0,
      recentActivity: 'moderate'
    };

    // Generate AI content using our consolidated service
    const aiResponse = await aiService.generateStudyReminder(userProgress, 3);

    if (!aiResponse.success) {
      return res.json({
        success: true,
        reminder: "Time to study! Consistent daily practice is the key to success. You've got this!"
      });
    }

    res.json({
      success: true,
      reminder: aiResponse.content
    });
  } catch (error) {
    next(error);
  }
});

// AI Chat endpoint
router.post('/chat', authenticate, async (req, res, next) => {
  try {
    const { message, context, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Generate AI content using our consolidated service
    const aiResponse = await aiService.generateChatbotResponse(message, context, conversationHistory);

    if (!aiResponse.success) {
      return res.status(500).json({ error: 'Failed to generate response' });
    }

    res.json({
      success: true,
      content: aiResponse.content
    });
  } catch (error) {
    next(error);
  }
});

// AI Recommendations endpoint
router.get('/recommendations', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user data for personalization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        enrollments: {
          include: {
            class: {
              include: {
                subjects: true
              }
            }
          }
        },
        quizResults: {
          orderBy: { completedAt: 'desc' },
          take: 10
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prepare user profile for AI
    const userProfile = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      enrolledClasses: user.enrollments.map(e => ({
        id: e.class.id,
        name: e.class.name,
        examType: e.class.examType,
        subjects: e.class.subjects.map(s => s.name)
      })),
      recentPerformance: user.quizResults.map(q => ({
        score: q.score,
        maxScore: q.maxScore,
        percentage: Math.round((q.score / q.maxScore) * 100)
      }))
    };

    // Generate AI recommendations using our consolidated service
    const aiResponse = await aiService.generateRecommendations(userProfile);

    if (!aiResponse.success) {
      return res.status(500).json({ error: 'Failed to generate recommendations' });
    }

    let recommendations = {};
    try {
      recommendations = JSON.parse(aiResponse.content);
    } catch (parseErr) {
      recommendations = {
        studyPlan: [],
        resources: [],
        tips: ["Keep up the good work!"]
      };
    }

    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    next(error);
  }
});

// Add POST version of the recommendations endpoint
router.post('/recommendations', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { availableTime } = req.body; // Accept availableTime from request body

    // Get user data for personalization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        enrollments: {
          include: {
            class: {
              include: {
                subjects: true
              }
            }
          }
        },
        quizResults: {
          orderBy: { completedAt: 'desc' },
          take: 10
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prepare user profile for AI
    const userProfile = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      enrolledClasses: user.enrollments.map(e => ({
        id: e.class.id,
        name: e.class.name,
        examType: e.class.examType,
        subjects: e.class.subjects.map(s => s.name)
      })),
      recentPerformance: user.quizResults.map(q => ({
        score: q.score,
        maxScore: q.maxScore,
        percentage: Math.round((q.score / q.maxScore) * 100)
      })),
      availableTime // Include available time in the profile
    };

    // Generate AI recommendations using our consolidated service
    const aiResponse = await aiService.generateRecommendations(userProfile);

    if (!aiResponse.success) {
      return res.status(500).json({ error: 'Failed to generate recommendations' });
    }

    let recommendations = {};
    try {
      recommendations = JSON.parse(aiResponse.content);
    } catch (parseErr) {
      recommendations = {
        studyPlan: [],
        resources: [],
        tips: ["Keep up the good work!"]
      };
    }

    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    next(error);
  }
});

export default router;

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