import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

// JSDoc comments instead of TypeScript interfaces
/**
 * @typedef {Object} CreateLearningPathData
 * @property {string} name
 * @property {string} [description]
 * @property {string} examType
 * @property {Date} [targetDate]
 * @property {string} userId
 * @property {string[]} courseIds
 */

export class LearningPathModel {
  static async findById(id) {
    return await prisma.learningPath.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            // course: {
            //   select: {
            //     id: true,
            //     title: true,
            //     thumbnail: true,
            //     duration: true,
            //     level: true,
            //     examType: true,
            //   },
            // },
          },
          orderBy: { order: "asc" },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            currentLevel: true,
            examTargets: true,
          },
        },
      },
    });
  }

  static async findByUserId(userId) {
    return await prisma.learningPath.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            // course: {
            //   select: {
            //     id: true,
            //     title: true,
            //     thumbnail: true,
            //     duration: true,
            //     level: true,
            //   },
            // },
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async create(pathData) {
    return await prisma.learningPath.create({
      data: {
        name: pathData.name,
        description: pathData.description,
        examType: pathData.examType,
        targetDate: pathData.targetDate,
        userId: pathData.userId,
        items: {
          create: pathData.courseIds.map((courseId, index) => ({
            courseId,
            order: index + 1,
            scheduledDate: pathData.targetDate
              ? new Date(Date.now() + index * 7 * 24 * 60 * 60 * 1000) // Weekly intervals
              : null,
          })),
        },
      },
      include: {
        items: {
          include: {
            // course: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });
  }

  static async generatePersonalized(
    userId,
    examType,
    targetDate,
    availableHours = 2,
  ) {
    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentLevel: true,
        examTargets: true,
        learningGoals: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Get user's assessment history
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
      orderBy: { completedAt: "desc" },
      take: 20,
    });

    // Analyze performance
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
      weakAreas.push("general preparation", "exam fundamentals");
    }

    // Get recommended courses
    const recommendedCourses = await prisma.course.findMany({
      where: {
        examType,
        level: user.currentLevel,
        isPublished: true,
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    });

    // Sort courses by performance (weaker areas first)
    const sortedCourses = recommendedCourses.sort((a, b) => {
      const aPerf = coursePerformance.get(a.id);
      const bPerf = coursePerformance.get(b.id);

      if (!aPerf && !bPerf) return 0;
      if (!aPerf) return -1;
      if (!bPerf) return 1;

      const aAvg = aPerf.total / aPerf.count;
      const bAvg = bPerf.total / bPerf.count;

      return aAvg - bAvg; // Lower scores first (weaker areas)
    });

    // Create learning path
    const pathName = `${examType} Preparation Path`;
    const pathDescription = `Personalized learning path for ${examType} focusing on: ${weakAreas.join(
      ", ",
    )}`;

    const courseIds = sortedCourses.map((course) => course.id);

    return await this.create({
      name: pathName,
      description: pathDescription,
      examType,
      targetDate,
      userId,
      courseIds,
    });
  }

  static async updateProgress(userId, pathItemId, completed) {
    const pathItem = await prisma.learningPathItem.update({
      where: { id: pathItemId },
      data: {
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    // Check if entire path is completed
    const path = await prisma.learningPath.findUnique({
      where: { id: pathItem.learningPathId },
      include: {
        items: true,
      },
    });

    const allCompleted = path.items.every((item) => item.completed);
    if (allCompleted) {
      await prisma.learningPath.update({
        where: { id: path.id },
        data: {
          completed: true,
          completedAt: new Date(),
        },
      });
    }

    return pathItem;
  }

  static async delete(id) {
    return await prisma.learningPath.delete({
      where: { id },
    });
  }

  static async getRecommendations(userId, examType, limit = 5) {
    // Get user's current level
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { currentLevel: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Get popular courses for this exam type
    const popularCourses = await prisma.course.findMany({
      where: {
        examType,
        level: user.currentLevel,
        isPublished: true,
      },
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        enrollments: {
          _count: "desc",
        },
      },
      take: limit,
    });

    return popularCourses;
  }
}