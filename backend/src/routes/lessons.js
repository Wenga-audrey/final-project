import express from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const router = express.Router();
const prisma = new PrismaClient();

// Get lessons for a chapter
router.get("/chapter/:chapterId", authenticate, async (req, res) => {
    try {
        const { chapterId } = req.params;
        const userRole = req.user.role;
        const userId = req.user.id;

        // Verify chapter exists
        const chapter = await prisma.chapter.findUnique({
            where: { id: chapterId },
            include: { subject: { include: { class: true } } },
        });

        if (!chapter) {
            return res.status(404).json({ error: "Chapter not found" });
        }

        // Verify user has access to this chapter's class
        if (userRole === "LEARNER") {
            const enrollment = await prisma.enrollment.findFirst({
                where: {
                    userId,
                    classId: chapter.subject.classId,
                    status: "ACTIVE"
                },
            });
            if (!enrollment) {
                return res
                    .status(403)
                    .json({ error: "Not enrolled in this class" });
            }
        } else if (userRole === "TEACHER") {
            // Teachers can only see lessons for chapters in subjects they're assigned to
            const assignment = await prisma.classTeacher.findFirst({
                where: {
                    teacherId: userId,
                    subjectId: chapter.subjectId
                },
            });

            if (!assignment) {
                return res
                    .status(403)
                    .json({ error: "Not assigned to this subject" });
            }
        }

        const lessons = await prisma.lesson.findMany({
            where: { chapterId },
            orderBy: { order: "asc" },
        });

        res.json({ lessons });
    } catch (error) {
        console.error("Error fetching lessons:", error);
        res.status(500).json({ error: "Failed to fetch lessons" });
    }
});

// Create a new lesson (TEACHER assigned to subject or PREP_ADMIN)
router.post("/", authenticate, async (req, res) => {
    try {
        const { chapterId, title, content, videoUrl, documentUrl, order, duration } = req.body;
        const userRole = req.user.role;
        const userId = req.user.id;

        // Verify chapter exists
        const chapter = await prisma.chapter.findUnique({
            where: { id: chapterId },
            include: { subject: { include: { class: true } } },
        });

        if (!chapter) {
            return res.status(404).json({ error: "Chapter not found" });
        }

        // Check permissions
        if (userRole === "TEACHER") {
            // Teachers can only create lessons for chapters in subjects they're assigned to
            const assignment = await prisma.classTeacher.findFirst({
                where: {
                    teacherId: userId,
                    subjectId: chapter.subjectId
                },
            });

            if (!assignment) {
                return res
                    .status(403)
                    .json({ error: "Not assigned to this subject" });
            }
        } else if (userRole !== "PREP_ADMIN") {
            return res
                .status(403)
                .json({ error: "Insufficient permissions" });
        }

        const lesson = await prisma.lesson.create({
            data: {
                chapterId,
                title,
                content,
                videoUrl,
                documentUrl,
                order: order || 0,
                duration: duration || 45,
            },
        });

        res.status(201).json({ lesson });
    } catch (error) {
        console.error("Error creating lesson:", error);
        res.status(500).json({ error: "Failed to create lesson" });
    }
});

// Update a lesson (TEACHER assigned to subject or PREP_ADMIN)
router.put("/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, videoUrl, documentUrl, order, duration, isPublished } = req.body;
        const userRole = req.user.role;
        const userId = req.user.id;

        // Verify lesson exists
        const lesson = await prisma.lesson.findUnique({
            where: { id },
            include: { chapter: { include: { subject: { include: { class: true } } } } },
        });

        if (!lesson) {
            return res.status(404).json({ error: "Lesson not found" });
        }

        // Check permissions
        if (userRole === "TEACHER") {
            // Teachers can only update lessons for chapters in subjects they're assigned to
            const assignment = await prisma.classTeacher.findFirst({
                where: {
                    teacherId: userId,
                    subjectId: lesson.chapter.subjectId
                },
            });

            if (!assignment) {
                return res
                    .status(403)
                    .json({ error: "Not assigned to this subject" });
            }
        } else if (userRole !== "PREP_ADMIN") {
            return res
                .status(403)
                .json({ error: "Insufficient permissions" });
        }

        const updatedLesson = await prisma.lesson.update({
            where: { id },
            data: {
                title,
                content,
                videoUrl,
                documentUrl,
                order,
                duration,
                isPublished,
            },
        });

        res.json({ lesson: updatedLesson });
    } catch (error) {
        console.error("Error updating lesson:", error);
        res.status(500).json({ error: "Failed to update lesson" });
    }
});

// Delete a lesson (TEACHER assigned to subject or PREP_ADMIN)
router.delete("/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userRole = req.user.role;
        const userId = req.user.id;

        // Verify lesson exists
        const lesson = await prisma.lesson.findUnique({
            where: { id },
            include: { chapter: { include: { subject: { include: { class: true } } } } },
        });

        if (!lesson) {
            return res.status(404).json({ error: "Lesson not found" });
        }

        // Check permissions
        if (userRole === "TEACHER") {
            // Teachers can only delete lessons for chapters in subjects they're assigned to
            const assignment = await prisma.classTeacher.findFirst({
                where: {
                    teacherId: userId,
                    subjectId: lesson.chapter.subjectId
                },
            });

            if (!assignment) {
                return res
                    .status(403)
                    .json({ error: "Not assigned to this subject" });
            }
        } else if (userRole !== "PREP_ADMIN") {
            return res
                .status(403)
                .json({ error: "Insufficient permissions" });
        }

        await prisma.lesson.delete({
            where: { id },
        });

        res.json({ message: "Lesson deleted successfully" });
    } catch (error) {
        console.error("Error deleting lesson:", error);
        res.status(500).json({ error: "Failed to delete lesson" });
    }
});

// Get a specific lesson by ID
router.get("/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userRole = req.user.role;
        const userId = req.user.id;

        // Verify lesson exists
        const lesson = await prisma.lesson.findUnique({
            where: { id },
            include: {
                chapter: {
                    include: {
                        subject: {
                            include: {
                                class: true,
                                // Include teachers assigned to this subject
                                classTeachers: {
                                    include: {
                                        teacher: {
                                            select: {
                                                id: true,
                                                firstName: true,
                                                lastName: true,
                                                email: true,
                                            },
                                        },
                                    },
                                },
                            }
                        }
                    }
                }
            },
        });

        if (!lesson) {
            return res.status(404).json({ error: "Lesson not found" });
        }

        // Verify user has access to this lesson's class
        if (userRole === "LEARNER") {
            const enrollment = await prisma.enrollment.findFirst({
                where: {
                    userId,
                    classId: lesson.chapter.subject.classId,
                    status: "ACTIVE"
                },
            });
            if (!enrollment) {
                return res
                    .status(403)
                    .json({ error: "Not enrolled in this class" });
            }
        } else if (userRole === "TEACHER") {
            // Teachers can access if they're assigned to the subject or are a prep admin
            const assignment = await prisma.classTeacher.findFirst({
                where: {
                    teacherId: userId,
                    subjectId: lesson.chapter.subjectId
                },
            });

            if (!assignment) {
                return res
                    .status(403)
                    .json({ error: "Not assigned to this subject" });
            }
        }

        res.json({ lesson });
    } catch (error) {
        console.error("Error fetching lesson:", error);
        res.status(500).json({ error: "Failed to fetch lesson" });
    }
});

export default router;