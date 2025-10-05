import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();


export class IntelligentScheduler {
  genAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
  }

  // Get user's availability schedule
  async getUserAvailability(userId) {
    return await prisma.userAvailability.findMany({
      where: { userId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
    });
  }

  // Set user's availability
  async setUserAvailability(userId, availability) {
    // Clear existing availability
    await prisma.userAvailability.deleteMany({
      where: { userId }
    });

    // Insert new availability
    await prisma.userAvailability.createMany({
      data: availability.map(slot => ({ ...slot, userId }))
    });
  }

  // Analyze user's learning patterns
  async analyzeLearningPatterns(userId) {
    const [studySessions, assessmentResults] = await Promise.all([
      prisma.studySession.findMany({
        where: { userId },
        orderBy: { startTime: 'desc' },
        take: 100
      }),
      prisma.assessmentResult.findMany({
        where: { userId },
        orderBy: { completedAt: 'desc' },
        take: 50
      })
    ]);

    // Calculate optimal study times
    const sessionsByHour = new Map();
    const sessionsByDuration = new Map();
    let totalSessions = 0;
    let completedSessions = 0;

    studySessions.forEach(session => {
      const hour = new Date(session.startTime).getHours();
      sessionsByHour.set(hour, (sessionsByHour.get(hour) || 0) + 1);

      if (session.endTime) {
        const duration = Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / (1000 * 60));
        sessionsByDuration.set(duration, (sessionsByDuration.get(duration) || 0) + 1);
        completedSessions++;
      }
      totalSessions++;
    });

    // Find peak performance hours
    const peakPerformanceHours = Array.from(sessionsByHour.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => hour);

    // Calculate average session duration
    const averageSessionDuration = Array.from(sessionsByDuration.entries())
      .reduce((sum, [duration, count]) => sum + (duration * count), 0) / completedSessions || 30;

    // Calculate retention rate from assessment performance
    const retentionRate = assessmentResults.length > 0
      ? assessmentResults.reduce((sum, result) => sum + (result.score / result.maxScore), 0) / assessmentResults.length
      : 0.5;

    // Calculate consistency score
    const consistencyScore = totalSessions > 0 ? completedSessions / totalSessions : 0;

    // Determine optimal study times
    const optimalStudyTimes = peakPerformanceHours.map(hour =>
      `${hour.toString().padStart(2, '0')}:00`
    );

    return {
      userId,
      optimalStudyTimes,
      averageSessionDuration: Math.round(averageSessionDuration),
      preferredDifficulty: retentionRate > 0.8 ? 'hard' : retentionRate > 0.6 ? 'medium' : 'easy',
      retentionRate,
      consistencyScore,
      peakPerformanceHours
    };
  }

  // Generate AI-powered study schedule
  async generateOptimalSchedule(userId, targetExamDate) {
    const [availability, patterns, enrollments, progress] = await Promise.all([
      this.getUserAvailability(userId),
      this.analyzeLearningPatterns(userId),
      prisma.enrollment.findMany({
        where: { userId },
        include: {
          course: {
            include: {
              lessons: {
                include: {
                  assessments: true
                }
              }
            }
          },
          progress: true
        }
      }),
      prisma.assessmentResult.findMany({
        where: { userId },
        orderBy: { completedAt: 'desc' },
        take: 10
      })
    ]);

    if (availability.length === 0) {
      throw new Error('User availability not set. Please configure your schedule first.');
    }

    // Prepare data for AI analysis
    const userContext = {
      learningPatterns: patterns,
      availability: availability,
      courses: enrollments.map(e => ({
        id: e.course.id,
        title: e.course.title,
        examType: e.course.examType,
        totalLessons: e.course.lessons.length,
        completedLessons: e.progress.filter(p => p.completedAt).length,
        difficulty: e.course.difficulty
      })),
      recentPerformance: progress.map(p => ({
        score: (p.score / p.maxScore) * 100,
        completedAt: p.completedAt
      })),
      targetExamDate: targetExamDate?.toISOString()
    };

    // Use AI to generate optimal schedule
    const model = this.genAI.getGenerativeModel({ model: 'models/gemini-pro-latest' });

    const prompt = `
    As an AI learning scheduler, create an optimal study schedule for a student with the following profile:

    Learning Patterns:
    - Optimal study times: ${patterns.optimalStudyTimes.join(', ')}
    - Average session duration: ${patterns.averageSessionDuration} minutes
    - Retention rate: ${(patterns.retentionRate * 100).toFixed(1)}%
    - Consistency score: ${(patterns.consistencyScore * 100).toFixed(1)}%
    - Peak performance hours: ${patterns.peakPerformanceHours.join(', ')}

    Availability: ${JSON.stringify(availability)}
    
    Courses: ${JSON.stringify(userContext.courses)}
    
    Recent Performance: ${JSON.stringify(userContext.recentPerformance)}
    
    ${targetExamDate ? `Target Exam Date: ${targetExamDate.toDateString()}` : ''}

    Generate a 2-week study schedule with the following requirements:
    1. Respect user availability windows
    2. Prioritize courses with lower completion rates
    3. Schedule assessments after lesson clusters
    4. Include review sessions for weak areas
    5. Optimize for user's peak performance hours
    6. Balance difficulty progression
    7. Include rest days to prevent burnout

    Return a JSON array of study sessions with this structure:
    {
      "courseId": "string",
      "lessonId": "string or null",
      "scheduledAt": "ISO date string",
      "duration": number (minutes),
      "type": "lesson|assessment|review|practice",
      "priority": number (1-10),
      "aiRecommendation": "brief explanation"
    }
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response.text();

      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Invalid AI response format');
      }

      const aiSchedule = JSON.parse(jsonMatch[0]);

      // Convert to StudySession objects and save to database
      const studySessions = [];

      for (const session of aiSchedule) {
        const studySession = {
          id: `sched_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          courseId: session.courseId,
          lessonId: session.lessonId,
          scheduledAt: new Date(session.scheduledAt),
          duration: session.duration,
          type: session.type,
          priority: session.priority,
          status: 'scheduled',
          aiRecommendation: session.aiRecommendation
        };

        studySessions.push(studySession);
      }

      // Save to database
      await prisma.scheduledSession.createMany({
        data: studySessions.map(session => ({
          id: session.id,
          userId: session.userId,
          courseId: session.courseId,
          lessonId: session.lessonId,
          scheduledAt: session.scheduledAt,
          duration: session.duration,
          type: session.type,
          priority: session.priority,
          status: session.status,
          aiRecommendation: session.aiRecommendation
        }))
      });

      return studySessions;

    } catch (error) {
      console.error('AI schedule generation failed:', error);

      // Fallback to rule-based scheduling
      return this.generateRuleBasedSchedule(userId, availability, patterns, enrollments);
    }
  }

  // Fallback rule-based scheduling
  async generateRuleBasedSchedule(
    userId,
    availability,
    patterns,
    enrollments
  ) {
    const sessions = [];
    const now = new Date();

    // Generate sessions for next 14 days
    for (let day = 0; day < 14; day++) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + day);
      const dayOfWeek = targetDate.getDay();

      // Find availability for this day
      const dayAvailability = availability.filter(a => a.dayOfWeek === dayOfWeek);

      if (dayAvailability.length === 0) continue;

      // Schedule sessions within available time slots
      for (const slot of dayAvailability) {
        const [startHour, startMin] = slot.startTime.split(':').map(Number);
        const [endHour, endMin] = slot.endTime.split(':').map(Number);

        const slotStart = new Date(targetDate);
        slotStart.setHours(startHour, startMin, 0, 0);

        const slotEnd = new Date(targetDate);
        slotEnd.setHours(endHour, endMin, 0, 0);

        const availableMinutes = (slotEnd.getTime() - slotStart.getTime()) / (1000 * 60);

        if (availableMinutes >= patterns.averageSessionDuration) {
          // Find course that needs attention
          const courseToStudy = enrollments.find(e => {
            const completionRate = e.progress.filter((p) => p.completedAt).length / e.course.lessons.length;
            return completionRate < 1.0;
          });

          if (courseToStudy) {
            const session = {
              id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              userId,
              courseId: courseToStudy.course.id,
              scheduledAt: slotStart,
              duration: Math.min(patterns.averageSessionDuration, availableMinutes),
              type: 'lesson',
              priority: 5,
              status: 'scheduled',
              aiRecommendation: 'Rule-based scheduling based on course completion priority'
            };

            sessions.push(session);
          }
        }
      }
    }

    return sessions;
  }

  // Get user's scheduled sessions
  async getScheduledSessions(userId, startDate, endDate) {
    const where = { userId };

    if (startDate || endDate) {
      where.scheduledAt = {};
      if (startDate) where.scheduledAt.gte = startDate;
      if (endDate) where.scheduledAt.lte = endDate;
    }

    const sessions = await prisma.scheduledSession.findMany({
      where,
      include: {
        course: {
          select: { title: true, examType: true }
        },
        lesson: {
          select: { title: true }
        }
      },
      orderBy: { scheduledAt: 'asc' }
    });

    return sessions.map(s => ({
      id: s.id,
      userId: s.userId,
      courseId: s.courseId,
      lessonId: s.lessonId,
      scheduledAt: s.scheduledAt,
      duration: s.duration,
      type: s.type,
      priority: s.priority,
      status: s.status,
      aiRecommendation: s.aiRecommendation
    }));
  }

  // Update session status
  async updateSessionStatus(sessionId, status, actualDuration) {
    await prisma.scheduledSession.update({
      where: { id: sessionId },
      data: {
        status,
        ...(actualDuration && { actualDuration })
      }
    });
  }

  // Generate daily recommendations
  async getDailyRecommendations(userId) {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const [todaysSessions, patterns, recentPerformance] = await Promise.all([
      this.getScheduledSessions(userId, startOfDay, endOfDay),
      this.analyzeLearningPatterns(userId),
      prisma.assessmentResult.findMany({
        where: { userId },
        orderBy: { completedAt: 'desc' },
        take: 5
      })
    ]);

    const recommendations = [];

    // Performance-based recommendations
    if (recentPerformance.length > 0) {
      const avgScore = recentPerformance.reduce((sum, r) => sum + (r.score / r.maxScore), 0) / recentPerformance.length;

      if (avgScore < 0.6) {
        recommendations.push("Focus on reviewing fundamentals before attempting new topics");
      } else if (avgScore > 0.8) {
        recommendations.push("Great performance! Consider tackling more challenging content");
      }
    }

    // Consistency recommendations
    if (patterns.consistencyScore < 0.7) {
      recommendations.push("Try to maintain regular study sessions for better retention");
    }

    // Time-based recommendations
    const currentHour = new Date().getHours();
    if (patterns.peakPerformanceHours.includes(currentHour)) {
      recommendations.push("This is one of your peak performance hours - perfect time for challenging topics!");
    }

    const motivationalMessages = [
      "Every expert was once a beginner. Keep pushing forward! 🚀",
      "Success is the sum of small efforts repeated day in and day out. 💪",
      "Your future self will thank you for the effort you put in today! ⭐",
      "Progress, not perfection. You're doing great! 🎯",
      "The best time to plant a tree was 20 years ago. The second best time is now! 🌱"
    ];

    const motivationalMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

    return {
      todaysSessions,
      recommendations,
      motivationalMessage
    };
  }
}

export const intelligentScheduler = new IntelligentScheduler();
