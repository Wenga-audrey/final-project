import express from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validation.js";

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

// Get admin dashboard statistics
router.get("/dashboard", async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalAssessments,
      activeSubscriptions,
      recentUsers,
      recentEnrollments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.assessmentResult.count(),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
      prisma.enrollment.count({
        where: {
          enrolledAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ]);

    // Get user growth over last 12 months
    const userGrowth = await prisma.user.groupBy({
      by: ["createdAt"],
      _count: { createdAt: true },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Last year
        },
      },
    });

    // Get revenue data (from active subscriptions)
    const revenueData = await prisma.subscription.groupBy({
      by: ["planType"],
      _count: { planType: true },
      where: { status: "ACTIVE" },
    });

    // Calculate estimated monthly revenue
    const planPrices = { MONTHLY: 9.99, ANNUAL: 8.33, LIFETIME: 0, FREE: 0 }; // Annual divided by 12
    const estimatedRevenue = revenueData.reduce((total, plan) => {
      return (
        total +
        planPrices[plan.planType] *
        plan._count.planType
      );
    }, 0);

    res.json({
      overview: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalAssessments,
        activeSubscriptions,
        estimatedMonthlyRevenue: Math.round(estimatedRevenue * 100) / 100,
      },
      growth: {
        newUsersLast30Days: recentUsers,
        newEnrollmentsLast30Days: recentEnrollments,
        userGrowthTrend: userGrowth,
      },
      revenue: {
        byPlan: revenueData,
        estimated: estimatedRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Content management - Get all courses with detailed info
router.get("/courses", async (req, res, next) => {
  try {
    const {
      page = "1",
      limit = "20",
      search,
      examType,
      isPublished,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (examType) where.examType = examType;
    if (isPublished !== undefined) where.isPublished = isPublished === "true";

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take,
        include: {
          categories: true,
          subjects: true,
          teachers: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
          _count: {
            select: {
              lessons: true,
              enrollments: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.course.count({ where }),
    ]);

    res.json({
      courses,
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

// Bulk publish/unpublish courses
router.put("/courses/bulk-publish", async (req, res, next) => {
  try {
    const { courseIds, isPublished } = req.body;

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({ error: "Course IDs array is required" });
    }

    await prisma.course.updateMany({
      where: { id: { in: courseIds } },
      data: { isPublished },
    });

    res.json({
      message: `${courseIds.length} courses ${isPublished ? "published" : "unpublished"} successfully`,
    });
  } catch (error) {
    next(error);
  }
});

// User management - Get detailed user list
router.get("/users", async (req, res, next) => {
  try {
    const { page = "1", limit = "20", search, role, isActive } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === "true";

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              enrollments: true,
              courses: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
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

// User management - Update user
router.put("/users/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, email, role, isActive } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        email,
        role,
        isActive,
      },
    });

    res.json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
});

// Get pending payments for validation (Prep Admin function)
router.get("/payments/pending", async (req, res, next) => {
  try {
    const pendingPayments = await prisma.payment.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            examType: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(pendingPayments);
  } catch (error) {
    next(error);
  }
});

// Validate payment (Prep Admin function)
router.patch("/payments/:paymentId/validate", async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { status, validationNotes } = req.body;
    const adminId = req.user.id;

    if (!['PAID', 'REFUNDED', 'EXPIRED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }

    // Get payment details
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        class: { select: { id: true, name: true, examType: true } }
      }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: status,
        paidAt: status === 'PAID' ? new Date() : null,
        updatedAt: new Date()
      }
    });

    // If payment is validated as PAID, automatically activate enrollment
    if (status === 'PAID') {
      await activateEnrollmentAfterPayment(payment.userId, payment.classId);

      // Update user payment status
      await prisma.user.update({
        where: { id: payment.userId },
        data: { paymentStatus: 'PAID' }
      });
    }

    // Log validation action
    await prisma.announcement.create({
      data: {
        classId: payment.classId,
        authorId: adminId,
        title: `Payment ${status === 'PAID' ? 'Validated' : 'Updated'}`,
        content: `Payment for ${payment.user.firstName} ${payment.user.lastName} has been ${status.toLowerCase()}. ${validationNotes || ''}`,
        isUrgent: false
      }
    });

    res.json({
      message: `Payment ${status.toLowerCase()} successfully`,
      payment: updatedPayment,
      enrollmentActivated: status === 'PAID'
    });

  } catch (error) {
    console.error('Payment validation error:', error);
    res.status(500).json({ error: 'Failed to validate payment' });
  }
});

// PREPARATORY CLASS MANAGEMENT
// Get all preparatory classes
router.get("/prep-classes", async (req, res, next) => {
  try {
    const classes = await prisma.preparatoryClass.findMany({
      where: { isActive: true },
      include: {
        subjects: {
          include: {
            chapters: {
              where: { isPublished: true },
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        },
        teachers: {
          include: {
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            enrollments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(classes);
  } catch (error) {
    next(error);
  }
});

// Get single preparatory class
router.get("/prep-classes/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const prepClass = await prisma.preparatoryClass.findUnique({
      where: { id },
      include: {
        subjects: {
          include: {
            chapters: {
              where: { isPublished: true },
              include: {
                lessons: {
                  where: { isPublished: true },
                  orderBy: { order: 'asc' }
                },
                quizzes: {
                  where: { isActive: true }
                }
              },
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        },
        teachers: {
          include: {
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        announcements: {
          include: {
            author: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!prepClass) {
      return res.status(404).json({ error: 'Preparatory class not found' });
    }

    res.json(prepClass);
  } catch (error) {
    next(error);
  }
});

// Create preparatory class (Prep Admin only)
router.post("/prep-classes", async (req, res, next) => {
  try {
    const {
      name,
      description,
      examType,
      startDate,
      endDate,
      price,
      maxStudents
    } = req.body;

    const prepClass = await prisma.preparatoryClass.create({
      data: {
        name,
        description,
        examType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        price: parseFloat(price),
        maxStudents: parseInt(maxStudents),
        isActive: true
      }
    });

    res.status(201).json(prepClass);
  } catch (error) {
    next(error);
  }
});

// Update preparatory class
router.put("/prep-classes/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      examType,
      startDate,
      endDate,
      price,
      maxStudents,
      isActive
    } = req.body;

    const prepClass = await prisma.preparatoryClass.update({
      where: { id },
      data: {
        name,
        description,
        examType,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        price: price ? parseFloat(price) : undefined,
        maxStudents: maxStudents ? parseInt(maxStudents) : undefined,
        isActive
      }
    });

    res.json(prepClass);
  } catch (error) {
    next(error);
  }
});

// Get class enrollments (Prep Admin only)
router.get("/prep-classes/:id/enrollments", async (req, res, next) => {
  try {
    const { id } = req.params;

    const enrollments = await prisma.enrollment.findMany({
      where: { classId: id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePicture: true
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    });

    res.json(enrollments);
  } catch (error) {
    next(error);
  }
});

// SUBJECTS - Integrated from preparatoryClasses.js
// Get subjects for a preparatory class
router.get("/prep-classes/:classId/subjects", async (req, res, next) => {
  try {
    const { classId } = req.params;

    const subjects = await prisma.subject.findMany({
      where: { classId },
      include: {
        chapters: {
          where: { isPublished: true },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            chapters: {
              where: { isPublished: true }
            }
          }
        }
      },
      orderBy: { order: 'asc' }
    });

    res.json(subjects);
  } catch (error) {
    next(error);
  }
});

// Get single subject within a preparatory class
router.get("/prep-classes/:classId/subjects/:subjectId", async (req, res, next) => {
  try {
    const { classId, subjectId } = req.params;

    const subject = await prisma.subject.findUnique({
      where: {
        id: subjectId,
        classId: classId
      },
      include: {
        chapters: {
          where: { isPublished: true },
          orderBy: { order: 'asc' }
        },
        class: true
      }
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    next(error);
  }
});

// Create subject for a preparatory class
router.post("/prep-classes/:classId/subjects", async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { name, description, order } = req.body;

    // Verify class exists
    const prepClass = await prisma.preparatoryClass.findUnique({
      where: { id: classId }
    });

    if (!prepClass) {
      return res.status(404).json({ error: 'Preparatory class not found' });
    }

    const subject = await prisma.subject.create({
      data: {
        classId,
        name,
        description,
        order: parseInt(order) || 0
      }
    });

    res.status(201).json(subject);
  } catch (error) {
    next(error);
  }
});

// Update subject
router.put("/prep-classes/:classId/subjects/:subjectId", async (req, res, next) => {
  try {
    const { classId, subjectId } = req.params;
    const { name, description, order } = req.body;

    const subject = await prisma.subject.update({
      where: {
        id: subjectId,
        classId: classId
      },
      data: {
        name,
        description,
        order: order ? parseInt(order) : undefined
      }
    });

    res.json(subject);
  } catch (error) {
    next(error);
  }
});

// Delete subject
router.delete("/prep-classes/:classId/subjects/:subjectId", async (req, res, next) => {
  try {
    const { classId, subjectId } = req.params;

    await prisma.subject.delete({
      where: {
        id: subjectId,
        classId: classId
      }
    });

    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// COURSES - Integrated from preparatoryClasses.js
// Get all courses (public)
router.get("/courses/all", async (req, res, next) => {
  try {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      include: {
        lessons: {
          where: { isPublished: true },
          select: { id: true }
        },
        _count: {
          select: {
            lessons: {
              where: { isPublished: true }
            },
            enrollments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(courses);
  } catch (error) {
    next(error);
  }
});

// Get popular courses
router.get("/courses/popular", async (req, res, next) => {
  try {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      include: {
        _count: {
          select: { enrollments: true }
        }
      },
      orderBy: {
        enrollments: {
          _count: 'desc'
        }
      },
      take: 10
    });

    res.json(courses);
  } catch (error) {
    next(error);
  }
});

// Get course by ID
router.get("/courses/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        lessons: {
          where: { isPublished: true },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            lessons: {
              where: { isPublished: true }
            }
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    next(error);
  }
});

// Get user's enrolled courses
router.get("/courses/my/enrollments", async (req, res, next) => {
  try {
    const userId = req.user.id;

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            lessons: {
              where: { isPublished: true },
              select: { id: true }
            },
            _count: {
              select: {
                lessons: {
                  where: { isPublished: true }
                }
              }
            }
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    });

    res.json(enrollments.map(e => e.course));
  } catch (error) {
    next(error);
  }
});

// Get course recommendations for user
router.get("/courses/my/recommendations", async (req, res, next) => {
  try {
    // Simple recommendation based on popular courses
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      include: {
        _count: {
          select: { enrollments: true }
        }
      },
      orderBy: {
        enrollments: {
          _count: 'desc'
        }
      },
      take: 5
    });

    res.json(courses);
  } catch (error) {
    next(error);
  }
});

// Enroll in a course
router.post("/courses/:id/enroll", async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if course exists and is published
    const course = await prisma.course.findUnique({
      where: { id, isPublished: true }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found or not published' });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.courseEnrollment.findFirst({
      where: {
        userId,
        courseId: id
      }
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    // Create enrollment
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        userId,
        courseId: id,
        enrolledAt: new Date()
      }
    });

    res.status(201).json(enrollment);
  } catch (error) {
    next(error);
  }
});

// Get course progress
router.get("/courses/:id/progress", async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get all lessons in the course
    const lessons = await prisma.lesson.findMany({
      where: {
        courseId: id,
        isPublished: true
      },
      select: { id: true }
    });

    if (lessons.length === 0) {
      return res.json({ progress: 0, completedLessons: 0, totalLessons: 0 });
    }

    // Get completed lessons
    const completedLessons = await prisma.lessonProgress.count({
      where: {
        userId,
        lessonId: { in: lessons.map(l => l.id) },
        isCompleted: true
      }
    });

    const progress = Math.round((completedLessons / lessons.length) * 100);

    res.json({
      progress,
      completedLessons,
      totalLessons: lessons.length
    });
  } catch (error) {
    next(error);
  }
});

// Update course progress
router.put("/courses/:id/progress", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lessonId, isCompleted, timeSpent } = req.body;
    const userId = req.user.id;

    // Verify lesson belongs to course
    const lesson = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
        courseId: id,
        isPublished: true
      }
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Update or create progress
    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId
        }
      },
      update: {
        isCompleted,
        timeSpent: timeSpent ? parseInt(timeSpent) : undefined,
        updatedAt: new Date()
      },
      create: {
        userId,
        lessonId,
        isCompleted,
        timeSpent: parseInt(timeSpent) || 0
      }
    });

    res.json(progress);
  } catch (error) {
    next(error);
  }
});

// Create course (Instructor only)
router.post("/courses", async (req, res, next) => {
  try {
    const { title, description, categoryId, level, duration, price } = req.body;
    const instructorId = req.user.id;

    const course = await prisma.course.create({
      data: {
        title,
        description,
        categoryId,
        level,
        duration: parseInt(duration),
        price: parseFloat(price),
        instructorId,
        isPublished: false
      }
    });

    res.status(201).json(course);
  } catch (error) {
    next(error);
  }
});

// Update course
router.put("/courses/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, categoryId, level, duration, price, isPublished } = req.body;
    const instructorId = req.user.id;

    // Verify course belongs to instructor or user is admin
    const course = await prisma.course.findUnique({
      where: { id }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.instructorId !== instructorId && req.user.role !== 'PREP_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Not authorized to update this course' });
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        title,
        description,
        categoryId,
        level,
        duration: duration ? parseInt(duration) : undefined,
        price: price ? parseFloat(price) : undefined,
        isPublished
      }
    });

    res.json(updatedCourse);
  } catch (error) {
    next(error);
  }
});

// Delete course
router.delete("/courses/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const instructorId = req.user.id;

    // Verify course belongs to instructor or user is admin
    const course = await prisma.course.findUnique({
      where: { id }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.instructorId !== instructorId && req.user.role !== 'PREP_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Not authorized to delete this course' });
    }

    await prisma.course.delete({
      where: { id }
    });

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// CHAPTERS - Integrated from preparatoryClasses.js
// Get chapter with lessons and progress
router.get("/chapters/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const chapter = await prisma.chapter.findUnique({
      where: { id },
      include: {
        subject: {
          include: {
            class: true
          }
        },
        lessons: {
          where: { isPublished: true },
          orderBy: { order: 'asc' }
        },
        quizzes: {
          where: { isActive: true },
          include: {
            _count: {
              select: {
                questions: true
              }
            }
          }
        },
        progress: {
          where: { userId }
        }
      }
    });

    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    res.json(chapter);
  } catch (error) {
    next(error);
  }
});

// Create chapter (Teachers and Prep Admin)
router.post("/chapters", async (req, res, next) => {
  try {
    const { subjectId, title, description, order, duration } = req.body;

    const chapter = await prisma.chapter.create({
      data: {
        subjectId,
        title,
        description,
        order: parseInt(order),
        duration: parseInt(duration),
        isPublished: false
      }
    });

    res.status(201).json(chapter);
  } catch (error) {
    next(error);
  }
});

// Update chapter
router.put("/chapters/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, order, duration, isPublished } = req.body;

    const chapter = await prisma.chapter.update({
      where: { id },
      data: {
        title,
        description,
        order: order ? parseInt(order) : undefined,
        duration: duration ? parseInt(duration) : undefined,
        isPublished
      }
    });

    res.json(chapter);
  } catch (error) {
    next(error);
  }
});

// Mark chapter as completed
router.post("/chapters/:id/complete", async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { timeSpent } = req.body;

    // Check if chapter exists
    const chapter = await prisma.chapter.findUnique({
      where: { id }
    });

    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    // Update or create progress
    const progress = await prisma.chapterProgress.upsert({
      where: {
        userId_chapterId: {
          userId,
          chapterId: id
        }
      },
      update: {
        isCompleted: true,
        completedAt: new Date(),
        timeSpent: parseInt(timeSpent) || 0
      },
      create: {
        userId,
        chapterId: id,
        isCompleted: true,
        completedAt: new Date(),
        timeSpent: parseInt(timeSpent) || 0
      }
    });

    res.json(progress);
  } catch (error) {
    next(error);
  }
});

// Get chapter progress for all learners (Teachers and Prep Admin)
router.get("/chapters/:id/progress", async (req, res, next) => {
  try {
    const { id } = req.params;

    const progressData = await prisma.chapterProgress.findMany({
      where: { chapterId: id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { completedAt: 'desc' }
    });

    res.json(progressData);
  } catch (error) {
    next(error);
  }
});

// Helper function for activating enrollment after payment
async function activateEnrollmentAfterPayment(userId, classId) {
  try {
    // Check if enrollment already exists
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        classId
      }
    });

    if (existingEnrollment) {
      // Update existing enrollment
      await prisma.enrollment.update({
        where: { id: existingEnrollment.id },
        data: { status: 'ACTIVE' }
      });
    } else {
      // Create new enrollment
      await prisma.enrollment.create({
        data: {
          userId,
          classId,
          status: 'ACTIVE',
          enrolledAt: new Date()
        }
      });
    }

    // Send welcome notification
    const classInfo = await prisma.preparatoryClass.findUnique({
      where: { id: classId },
      select: { name: true, examType: true }
    });

    await prisma.announcement.create({
      data: {
        classId,
        authorId: 'system', // System-generated announcement
        title: 'Bienvenue dans votre classe!',
        content: `Félicitations! Votre inscription à ${classInfo?.name} (${classInfo?.examType}) a été activée. Vous pouvez maintenant accéder à tous les cours et ressources.`,
        isUrgent: false
      }
    });

    return true;
  } catch (error) {
    console.error('Error activating enrollment:', error);
    throw error;
  }
}

// PREPARATORY CLASS MANAGEMENT
// Get all preparatory classes
router.get('/prep-classes', async (req, res, next) => {
  try {
    const classes = await prisma.preparatoryClass.findMany({
      where: { isActive: true },
      include: {
        subjects: {
          include: {
            chapters: {
              where: { isPublished: true },
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        },
        teachers: {
          include: {
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            enrollments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(classes);
  } catch (error) {
    next(error);
  }
});

// Get single preparatory class
router.get('/prep-classes/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const prepClass = await prisma.preparatoryClass.findUnique({
      where: { id },
      include: {
        subjects: {
          include: {
            chapters: {
              where: { isPublished: true },
              include: {
                lessons: {
                  where: { isPublished: true },
                  orderBy: { order: 'asc' }
                },
                quizzes: {
                  where: { isActive: true }
                }
              },
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        },
        teachers: {
          include: {
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        announcements: {
          include: {
            author: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!prepClass) {
      return res.status(404).json({ error: 'Preparatory class not found' });
    }

    res.json(prepClass);
  } catch (error) {
    next(error);
  }
});

// Create preparatory class (Prep Admin only)
router.post('/prep-classes', async (req, res, next) => {
  try {
    const {
      name,
      description,
      examType,
      startDate,
      endDate,
      price,
      maxStudents
    } = req.body;

    const prepClass = await prisma.preparatoryClass.create({
      data: {
        name,
        description,
        examType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        price: parseFloat(price),
        maxStudents: parseInt(maxStudents),
        isActive: true
      }
    });

    res.status(201).json(prepClass);
  } catch (error) {
    next(error);
  }
});

// Update preparatory class
router.put('/prep-classes/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      examType,
      startDate,
      endDate,
      price,
      maxStudents,
      isActive
    } = req.body;

    const prepClass = await prisma.preparatoryClass.update({
      where: { id },
      data: {
        name,
        description,
        examType,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        price: price ? parseFloat(price) : undefined,
        maxStudents: maxStudents ? parseInt(maxStudents) : undefined,
        isActive
      }
    });

    res.json(prepClass);
  } catch (error) {
    next(error);
  }
});

// Enroll in preparatory class
router.post('/prep-classes/:id/enroll', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if class exists and is active
    const prepClass = await prisma.preparatoryClass.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    });

    if (!prepClass || !prepClass.isActive) {
      return res.status(404).json({ error: 'Preparatory class not found or not active' });
    }

    // Check if class is full
    if (prepClass._count.enrollments >= prepClass.maxStudents) {
      return res.status(400).json({ error: 'Class is full' });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        classId: id
      }
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: 'Already enrolled in this class' });
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        classId: id,
        status: 'ACTIVE',
        enrolledAt: new Date()
      }
    });

    res.status(201).json(enrollment);
  } catch (error) {
    next(error);
  }
});

// Get class enrollments (Prep Admin only)
router.get('/prep-classes/:id/enrollments', async (req, res, next) => {
  try {
    const { id } = req.params;

    const enrollments = await prisma.enrollment.findMany({
      where: { classId: id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePicture: true
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    });

    res.json(enrollments);
  } catch (error) {
    next(error);
  }
});

// SUBJECTS - Integrated from preparatoryClasses.js
// Get subjects for a preparatory class
router.get('/prep-classes/:classId/subjects', async (req, res, next) => {
  try {
    const { classId } = req.params;

    const subjects = await prisma.subject.findMany({
      where: { classId },
      include: {
        chapters: {
          where: { isPublished: true },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            chapters: {
              where: { isPublished: true }
            }
          }
        }
      },
      orderBy: { order: 'asc' }
    });

    res.json(subjects);
  } catch (error) {
    next(error);
  }
});

// Get single subject within a preparatory class
router.get('/prep-classes/:classId/subjects/:subjectId', async (req, res, next) => {
  try {
    const { classId, subjectId } = req.params;

    const subject = await prisma.subject.findUnique({
      where: {
        id: subjectId,
        classId: classId
      },
      include: {
        chapters: {
          where: { isPublished: true },
          orderBy: { order: 'asc' }
        },
        class: true
      }
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    next(error);
  }
});

// Create subject for a preparatory class
router.post('/prep-classes/:classId/subjects', async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { name, description, order } = req.body;

    // Verify class exists
    const prepClass = await prisma.preparatoryClass.findUnique({
      where: { id: classId }
    });

    if (!prepClass) {
      return res.status(404).json({ error: 'Preparatory class not found' });
    }

    const subject = await prisma.subject.create({
      data: {
        classId,
        name,
        description,
        order: parseInt(order) || 0
      }
    });

    res.status(201).json(subject);
  } catch (error) {
    next(error);
  }
});

// Update subject
router.put('/prep-classes/:classId/subjects/:subjectId', async (req, res, next) => {
  try {
    const { classId, subjectId } = req.params;
    const { name, description, order } = req.body;

    const subject = await prisma.subject.update({
      where: {
        id: subjectId,
        classId: classId
      },
      data: {
        name,
        description,
        order: order ? parseInt(order) : undefined
      }
    });

    res.json(subject);
  } catch (error) {
    next(error);
  }
});

// Delete subject
router.delete('/prep-classes/:classId/subjects/:subjectId', async (req, res, next) => {
  try {
    const { classId, subjectId } = req.params;

    await prisma.subject.delete({
      where: {
        id: subjectId,
        classId: classId
      }
    });

    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// COURSES - Integrated from preparatoryClasses.js
// Get all courses (public)
router.get('/courses/all', async (req, res, next) => {
  try {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      include: {
        lessons: {
          where: { isPublished: true },
          select: { id: true }
        },
        _count: {
          select: {
            lessons: {
              where: { isPublished: true }
            },
            enrollments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(courses);
  } catch (error) {
    next(error);
  }
});

// Get popular courses
router.get('/courses/popular', async (req, res, next) => {
  try {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      include: {
        _count: {
          select: { enrollments: true }
        }
      },
      orderBy: {
        enrollments: {
          _count: 'desc'
        }
      },
      take: 10
    });

    res.json(courses);
  } catch (error) {
    next(error);
  }
});

// Get course by ID
router.get('/courses/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        lessons: {
          where: { isPublished: true },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            lessons: {
              where: { isPublished: true }
            }
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    next(error);
  }
});

// Get user's enrolled courses
router.get('/courses/my/enrollments', async (req, res, next) => {
  try {
    const userId = req.user.id;

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            lessons: {
              where: { isPublished: true },
              select: { id: true }
            },
            _count: {
              select: {
                lessons: {
                  where: { isPublished: true }
                }
              }
            }
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    });

    res.json(enrollments.map(e => e.course));
  } catch (error) {
    next(error);
  }
});

// Get course recommendations for user
router.get('/courses/my/recommendations', async (req, res, next) => {
  try {
    // Simple recommendation based on popular courses
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      include: {
        _count: {
          select: { enrollments: true }
        }
      },
      orderBy: {
        enrollments: {
          _count: 'desc'
        }
      },
      take: 5
    });

    res.json(courses);
  } catch (error) {
    next(error);
  }
});

// Enroll in a course
router.post('/courses/:id/enroll', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if course exists and is published
    const course = await prisma.course.findUnique({
      where: { id, isPublished: true }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found or not published' });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.courseEnrollment.findFirst({
      where: {
        userId,
        courseId: id
      }
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    // Create enrollment
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        userId,
        courseId: id,
        enrolledAt: new Date()
      }
    });

    res.status(201).json(enrollment);
  } catch (error) {
    next(error);
  }
});

// Get course progress
router.get('/courses/:id/progress', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get all lessons in the course
    const lessons = await prisma.lesson.findMany({
      where: {
        courseId: id,
        isPublished: true
      },
      select: { id: true }
    });

    if (lessons.length === 0) {
      return res.json({ progress: 0, completedLessons: 0, totalLessons: 0 });
    }

    // Get completed lessons
    const completedLessons = await prisma.lessonProgress.count({
      where: {
        userId,
        lessonId: { in: lessons.map(l => l.id) },
        isCompleted: true
      }
    });

    const progress = Math.round((completedLessons / lessons.length) * 100);

    res.json({
      progress,
      completedLessons,
      totalLessons: lessons.length
    });
  } catch (error) {
    next(error);
  }
});

// Update course progress
router.put('/courses/:id/progress', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lessonId, isCompleted, timeSpent } = req.body;
    const userId = req.user.id;

    // Verify lesson belongs to course
    const lesson = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
        courseId: id,
        isPublished: true
      }
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Update or create progress
    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId
        }
      },
      update: {
        isCompleted,
        timeSpent: timeSpent ? parseInt(timeSpent) : undefined,
        updatedAt: new Date()
      },
      create: {
        userId,
        lessonId,
        isCompleted,
        timeSpent: parseInt(timeSpent) || 0
      }
    });

    res.json(progress);
  } catch (error) {
    next(error);
  }
});

// Create course (Instructor only)
router.post('/courses', async (req, res, next) => {
  try {
    const { title, description, categoryId, level, duration, price } = req.body;
    const instructorId = req.user.id;

    const course = await prisma.course.create({
      data: {
        title,
        description,
        categoryId,
        level,
        duration: parseInt(duration),
        price: parseFloat(price),
        instructorId,
        isPublished: false
      }
    });

    res.status(201).json(course);
  } catch (error) {
    next(error);
  }
});

// Update course
router.put('/courses/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, categoryId, level, duration, price, isPublished } = req.body;
    const instructorId = req.user.id;

    // Verify course belongs to instructor or user is admin
    const course = await prisma.course.findUnique({
      where: { id }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.instructorId !== instructorId && req.user.role !== 'PREP_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Not authorized to update this course' });
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        title,
        description,
        categoryId,
        level,
        duration: duration ? parseInt(duration) : undefined,
        price: price ? parseFloat(price) : undefined,
        isPublished
      }
    });

    res.json(updatedCourse);
  } catch (error) {
    next(error);
  }
});

// Delete course
router.delete('/courses/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const instructorId = req.user.id;

    // Verify course belongs to instructor or user is admin
    const course = await prisma.course.findUnique({
      where: { id }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.instructorId !== instructorId && req.user.role !== 'PREP_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Not authorized to delete this course' });
    }

    await prisma.course.delete({
      where: { id }
    });

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// CHAPTERS - Integrated from preparatoryClasses.js
// Get chapter with lessons and progress
router.get('/chapters/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const chapter = await prisma.chapter.findUnique({
      where: { id },
      include: {
        subject: {
          include: {
            class: true
          }
        },
        lessons: {
          where: { isPublished: true },
          orderBy: { order: 'asc' }
        },
        quizzes: {
          where: { isActive: true },
          include: {
            _count: {
              select: {
                questions: true
              }
            }
          }
        },
        progress: {
          where: { userId }
        }
      }
    });

    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    res.json(chapter);
  } catch (error) {
    next(error);
  }
});

// Create chapter (Teachers and Prep Admin)
router.post('/chapters', async (req, res, next) => {
  try {
    const { subjectId, title, description, order, duration } = req.body;

    const chapter = await prisma.chapter.create({
      data: {
        subjectId,
        title,
        description,
        order: parseInt(order),
        duration: parseInt(duration),
        isPublished: false
      }
    });

    res.status(201).json(chapter);
  } catch (error) {
    next(error);
  }
});

// Update chapter
router.put('/chapters/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, order, duration, isPublished } = req.body;

    const chapter = await prisma.chapter.update({
      where: { id },
      data: {
        title,
        description,
        order: order ? parseInt(order) : undefined,
        duration: duration ? parseInt(duration) : undefined,
        isPublished
      }
    });

    res.json(chapter);
  } catch (error) {
    next(error);
  }
});

// Mark chapter as completed
router.post('/chapters/:id/complete', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { timeSpent } = req.body;

    // Check if chapter exists
    const chapter = await prisma.chapter.findUnique({
      where: { id }
    });

    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    // Update or create progress
    const progress = await prisma.chapterProgress.upsert({
      where: {
        userId_chapterId: {
          userId,
          chapterId: id
        }
      },
      update: {
        isCompleted: true,
        completedAt: new Date(),
        timeSpent: parseInt(timeSpent) || 0
      },
      create: {
        userId,
        chapterId: id,
        isCompleted: true,
        completedAt: new Date(),
        timeSpent: parseInt(timeSpent) || 0
      }
    });

    res.json(progress);
  } catch (error) {
    next(error);
  }
});

// Get chapter progress for all learners (Teachers and Prep Admin)
router.get('/chapters/:id/progress', async (req, res, next) => {
  try {
    const { id } = req.params;

    const progressData = await prisma.chapterProgress.findMany({
      where: { chapterId: id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { completedAt: 'desc' }
    });

    res.json(progressData);
  } catch (error) {
    next(error);
  }
});

export default router;