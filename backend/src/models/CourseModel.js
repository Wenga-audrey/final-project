import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

// JSDoc comments instead of TypeScript interfaces
/**
 * @typedef {Object} CreateCourseData
 * @property {string} title
 * @property {string} description
 * @property {string} [thumbnail]
 * @property {string} examType
 * @property {string} level
 * @property {number} duration
 * @property {number} [price]
 * @property {boolean} [isPublished]
 */

/**
 * @typedef {Object} UpdateCourseData
 * @property {string} [title]
 * @property {string} [description]
 * @property {string} [thumbnail]
 * @property {string} [examType]
 * @property {string} [level]
 * @property {number} [duration]
 * @property {number} [price]
 * @property {boolean} [isPublished]
 */

export class CourseModel {
  static async findAll(filters) {
    const where = {};

    if (filters?.examType) where.examType = filters.examType;
    if (filters?.level) where.level = filters.level;
    if (filters?.isPublished !== undefined)
      where.isPublished = filters.isPublished;
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    return await prisma.course.findMany({
      where,
      include: {
        lessons: {
          select: {
            id: true,
            title: true,
            duration: true,
            order: true,
            isPublished: true,
          },
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            enrollments: true,
            lessons: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findById(id, includeUnpublished = false) {
    const where = { id };
    if (!includeUnpublished) {
      where.isPublished = true;
    }

    return await prisma.course.findUnique({
      where,
      include: {
        lessons: {
          where: includeUnpublished ? {} : { isPublished: true },
          include: {
            assessments: {
              select: {
                id: true,
                title: true,
                type: true,
                timeLimit: true,
                passingScore: true,
              },
            },
          },
          orderBy: { order: "asc" },
        },
        categories: true,
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });
  }

  static async create(courseData) {
    return await prisma.course.create({
      data: {
        ...courseData,
        isPublished: courseData.isPublished ?? false,
      },
      include: {
        lessons: true,
        _count: {
          select: {
            enrollments: true,
            lessons: true,
          },
        },
      },
    });
  }

  static async update(id, courseData) {
    return await prisma.course.update({
      where: { id },
      data: courseData,
      include: {
        lessons: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            enrollments: true,
            lessons: true,
          },
        },
      },
    });
  }

  static async delete(id) {
    return await prisma.course.delete({
      where: { id },
    });
  }

  static async enroll(
    userId,
    courseId,
    opts,
  ) {
    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new Error("Already enrolled in this course");
    }

    // Enforce max 2 active enrollments
    const activeCount = await prisma.enrollment.count({
      where: { userId, status: "ACTIVE" },
    });
    if (activeCount >= 2) {
      throw new Error("Max enrollments reached (2 active classes)");
    }

    const isTrial = !!opts?.trial;
    const trialEndsAt = isTrial
      ? new Date(Date.now() + (opts?.trialDays ?? 7) * 24 * 60 * 60 * 1000)
      : null;

    return await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        status: "ACTIVE",
        progress: 0,
        isTrial,
        trialEndsAt: trialEndsAt || undefined,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            examType: true,
            level: true,
          },
        },
      },
    });
  }

  static async getUserCourses(userId) {
    return await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            examType: true,
            level: true,
            duration: true,
            _count: {
              select: {
                lessons: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getEnrollment(userId, courseId) {
    return await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        course: {
          include: {
            lessons: {
              where: { isPublished: true },
              include: {
                assessments: {
                  select: {
                    id: true,
                    title: true,
                    type: true,
                  },
                },
              },
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });
  }

  static async updateProgress(userId, courseId, progress) {
    const enrollment = await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      data: { progress },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Check if course is completed
    if (progress >= 100) {
      await prisma.enrollment.update({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        data: { status: "COMPLETED" },
      });
    }

    return enrollment;
  }

  static async getPopularCourses(limit = 10) {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
        lessons: {
          select: {
            id: true,
            title: true,
            duration: true,
            order: true,
            isPublished: true,
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: {
        enrollments: {
          _count: "desc",
        },
      },
      take: limit,
    });

    return courses.map((course) => ({
      ...course,
      enrollmentCount: course._count.enrollments,
    }));
  }

  static async getRecommendedCourses(userId, limit = 5) {
    // Get user's enrolled courses to understand their interests
    const userEnrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            examType: true,
            level: true,
          },
        },
      },
    });

    if (userEnrollments.length === 0) {
      // If no enrollments, return popular courses
      return await this.getPopularCourses(limit);
    }

    // Get user's preferred exam types and levels
    const examTypes = [
      ...new Set(userEnrollments.map((e) => e.course.examType)),
    ];
    const levels = [...new Set(userEnrollments.map((e) => e.course.level))];

    // Find courses that match user's interests
    const recommendedCourses = await prisma.course.findMany({
      where: {
        isPublished: true,
        AND: [
          {
            OR: [
              { examType: { in: examTypes } },
              { level: { in: levels } },
            ],
          },
          {
            NOT: {
              enrollments: {
                some: { userId },
              },
            },
          },
        ],
      },
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
        lessons: {
          select: {
            id: true,
            title: true,
            duration: true,
            order: true,
            isPublished: true,
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: {
        enrollments: {
          _count: "desc",
        },
      },
      take: limit,
    });

    return recommendedCourses.map((course) => ({
      ...course,
      enrollmentCount: course._count.enrollments,
    }));
  }
}