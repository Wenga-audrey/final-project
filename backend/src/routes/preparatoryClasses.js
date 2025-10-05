import express from 'express';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { authenticate, requireRole } from '../middleware/auth.js';


const router = express.Router();
const prisma = new PrismaClient();

// Get all preparatory classes
router.get('/', async (req, res, next) => {
    try {
        // Check if user is authenticated
        const userId = req.user?.id;

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

        // If user is authenticated, add enrollment information to each class
        if (userId) {
            // Get all enrollments for this user
            const userEnrollments = await prisma.enrollment.findMany({
                where: {
                    userId,
                    classId: {
                        in: classes.map(c => c.id)
                    }
                },
                select: {
                    classId: true,
                    status: true,
                    progress: true
                }
            });

            // Add enrollment info to each class
            const classesWithEnrollment = classes.map(cls => {
                const enrollment = userEnrollments.find(e => e.classId === cls.id);
                return {
                    ...cls,
                    enrollment: enrollment || null
                };
            });

            res.json(classesWithEnrollment);
        } else {
            // For unauthenticated users, just return classes without enrollment info
            res.json(classes);
        }
    } catch (error) {
        next(error);
    }
});

// Get single preparatory class
router.get('/:id', async (req, res, next) => {
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
router.post('/', authenticate, requireRole(['PREP_ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
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
router.put('/:id', authenticate, requireRole(['PREP_ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
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
router.post('/:id/enroll', authenticate, async (req, res, next) => {
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
router.get('/:id/enrollments', authenticate, requireRole(['PREP_ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
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

// SUBJECTS - Integrated from subjects.js
// Get subjects for a preparatory class
router.get('/:classId/subjects', authenticate, async (req, res, next) => {
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
router.get('/:classId/subjects/:subjectId', authenticate, async (req, res, next) => {
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
router.post('/:classId/subjects', authenticate, requireRole(['PREP_ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
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
router.put('/:classId/subjects/:subjectId', authenticate, requireRole(['PREP_ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
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
router.delete('/:classId/subjects/:subjectId', authenticate, requireRole(['PREP_ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
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

// COURSES - Integrated from courses.js
// Get all courses (public)
router.get('/courses', async (req, res, next) => {
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
router.get('/courses/my/enrollments', authenticate, async (req, res, next) => {
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
router.get('/courses/my/recommendations', authenticate, async (req, res, next) => {
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
router.post('/courses/:id/enroll', authenticate, async (req, res, next) => {
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
router.get('/courses/:id/progress', authenticate, async (req, res, next) => {
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
router.put('/courses/:id/progress', authenticate, async (req, res, next) => {
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
router.post('/courses', authenticate, requireRole(['INSTRUCTOR', 'PREP_ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
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
router.put('/courses/:id', authenticate, requireRole(['INSTRUCTOR', 'PREP_ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
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
router.delete('/courses/:id', authenticate, requireRole(['INSTRUCTOR', 'PREP_ADMIN', 'SUPER_ADMIN']), async (req, res, next) => {
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

// CHAPTERS - Integrated from chapters.js
// Get chapter with lessons and progress
router.get('/chapters/:id', authenticate, async (req, res, next) => {
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

        // Check if user is enrolled in the class containing this chapter
        const enrollment = await prisma.enrollment.findFirst({
            where: {
                userId,
                classId: chapter.subject.class.id,
                status: 'ACTIVE'
            }
        });

        if (!enrollment) {
            return res.status(403).json({
                error: 'You must be enrolled in the preparatory class to access this chapter'
            });
        }

        res.json(chapter);
    } catch (error) {
        next(error);
    }
});

// Create chapter (Teachers and Prep Admin)
router.post('/chapters', authenticate, requireRole(['PREP_ADMIN', 'TEACHER', 'SUPER_ADMIN']), async (req, res, next) => {
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
router.put('/chapters/:id', authenticate, requireRole(['PREP_ADMIN', 'TEACHER', 'SUPER_ADMIN']), async (req, res, next) => {
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
router.post('/chapters/:id/complete', authenticate, async (req, res, next) => {
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
router.get('/chapters/:id/progress', authenticate, requireRole(['PREP_ADMIN', 'TEACHER', 'SUPER_ADMIN']), async (req, res, next) => {
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