import express from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const router = express.Router();
const prisma = new PrismaClient();

// Get all subjects for a class
router.get("/:classId", authenticate, async (req, res) => {
    try {
        const { classId } = req.params;
        const userRole = req.user.role;
        const userId = req.user.id;

        // Verify user has access to this class
        if (userRole === "LEARNER") {
            const enrollment = await prisma.enrollment.findFirst({
                where: { userId, classId, status: "ACTIVE" },
            });
            if (!enrollment) {
                return res
                    .status(403)
                    .json({ error: "Not enrolled in this class" });
            }
        } else if (userRole === "TEACHER") {
            // Teachers can only see subjects they're assigned to
            const assignments = await prisma.classTeacher.findMany({
                where: { teacherId: userId, classId },
            });

            if (assignments.length === 0) {
                return res
                    .status(403)
                    .json({ error: "Not assigned to this class" });
            }
        }

        const subjects = await prisma.subject.findMany({
            where: { classId },
            orderBy: { order: "asc" },
            include: {
                chapters: {
                    orderBy: { order: "asc" },
                },
            },
        });

        res.json({ subjects });
    } catch (error) {
        console.error("Error fetching subjects:", error);
        res.status(500).json({ error: "Failed to fetch subjects" });
    }
});

// Create a new subject (PREP_ADMIN only)
router.post("/", authenticate, requireRole(["PREP_ADMIN"]), async (req, res) => {
    try {
        const { classId, name, description, order } = req.body;

        // Verify class exists
        const classExists = await prisma.preparatoryClass.findUnique({
            where: { id: classId },
        });

        if (!classExists) {
            return res.status(404).json({ error: "Class not found" });
        }

        const subject = await prisma.subject.create({
            data: {
                classId,
                name,
                description,
                order: order || 0,
            },
        });

        res.status(201).json({ subject });
    } catch (error) {
        console.error("Error creating subject:", error);
        res.status(500).json({ error: "Failed to create subject" });
    }
});

// Update a subject (PREP_ADMIN only)
router.put("/:id", authenticate, requireRole(["PREP_ADMIN"]), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, order, isActive } = req.body;

        const subject = await prisma.subject.update({
            where: { id },
            data: {
                name,
                description,
                order,
                isActive,
            },
        });

        res.json({ subject });
    } catch (error) {
        console.error("Error updating subject:", error);
        res.status(500).json({ error: "Failed to update subject" });
    }
});

// Delete a subject (PREP_ADMIN only)
router.delete("/:id", authenticate, requireRole(["PREP_ADMIN"]), async (req, res) => {
    try {
        const { id } = req.params;

        // Check if subject has chapters (prevent deletion if content exists)
        const chapterCount = await prisma.chapter.count({
            where: { subjectId: id },
        });

        if (chapterCount > 0) {
            return res.status(400).json({
                error: "Cannot delete subject with existing chapters. Delete chapters first."
            });
        }

        await prisma.subject.delete({
            where: { id },
        });

        res.json({ message: "Subject deleted successfully" });
    } catch (error) {
        console.error("Error deleting subject:", error);
        res.status(500).json({ error: "Failed to delete subject" });
    }
});

// Assign teacher to subject (PREP_ADMIN only)
router.post("/:subjectId/assign-teacher", authenticate, requireRole(["PREP_ADMIN"]), async (req, res) => {
    try {
        const { subjectId } = req.params;
        const { teacherId } = req.body;

        // Verify subject exists
        const subject = await prisma.subject.findUnique({
            where: { id: subjectId },
            include: { class: true },
        });

        if (!subject) {
            return res.status(404).json({ error: "Subject not found" });
        }

        // Verify teacher exists and has TEACHER role
        const teacher = await prisma.user.findUnique({
            where: { id: teacherId },
        });

        if (!teacher || teacher.role !== "TEACHER") {
            return res.status(400).json({ error: "Invalid teacher" });
        }

        // Create or update assignment
        const assignment = await prisma.classTeacher.upsert({
            where: {
                classId_teacherId_subjectId: {
                    classId: subject.classId,
                    teacherId,
                    subjectId,
                },
            },
            update: {},
            create: {
                classId: subject.classId,
                teacherId,
                subjectId,
            },
        });

        res.json({
            message: "Teacher assigned to subject successfully",
            assignment
        });
    } catch (error) {
        console.error("Error assigning teacher to subject:", error);
        res.status(500).json({ error: "Failed to assign teacher to subject" });
    }
});

// Remove teacher from subject (PREP_ADMIN only)
router.delete("/:subjectId/remove-teacher/:teacherId", authenticate, requireRole(["PREP_ADMIN"]), async (req, res) => {
    try {
        const { subjectId, teacherId } = req.params;

        // Verify the assignment exists
        const subject = await prisma.subject.findUnique({
            where: { id: subjectId },
            include: { class: true },
        });

        if (!subject) {
            return res.status(404).json({ error: "Subject not found" });
        }

        await prisma.classTeacher.delete({
            where: {
                classId_teacherId_subjectId: {
                    classId: subject.classId,
                    teacherId,
                    subjectId,
                },
            },
        });

        res.json({ message: "Teacher removed from subject successfully" });
    } catch (error) {
        console.error("Error removing teacher from subject:", error);
        res.status(500).json({ error: "Failed to remove teacher from subject" });
    }
});

// Get teachers assigned to a subject
router.get("/:subjectId/teachers", authenticate, async (req, res) => {
    try {
        const { subjectId } = req.params;
        const userRole = req.user.role;
        const userId = req.user.id;

        // Verify subject exists
        const subject = await prisma.subject.findUnique({
            where: { id: subjectId },
            include: { class: true },
        });

        if (!subject) {
            return res.status(404).json({ error: "Subject not found" });
        }

        // Verify user has access to this subject's class
        if (userRole === "LEARNER") {
            const enrollment = await prisma.enrollment.findFirst({
                where: {
                    userId,
                    classId: subject.classId,
                    status: "ACTIVE"
                },
            });
            if (!enrollment) {
                return res
                    .status(403)
                    .json({ error: "Not enrolled in this class" });
            }
        } else if (userRole === "TEACHER") {
            // Teachers can only see assignments if they're assigned to the class
            const assignment = await prisma.classTeacher.findFirst({
                where: {
                    teacherId: userId,
                    classId: subject.classId
                },
            });

            if (!assignment) {
                return res
                    .status(403)
                    .json({ error: "Not assigned to this class" });
            }
        }

        const assignments = await prisma.classTeacher.findMany({
            where: { subjectId },
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
        });

        res.json({ assignments });
    } catch (error) {
        console.error("Error fetching subject teachers:", error);
        res.status(500).json({ error: "Failed to fetch subject teachers" });
    }
});

// Get a specific subject by ID
router.get("/subject/:subjectId", authenticate, async (req, res) => {
    try {
        const { subjectId } = req.params;
        const userRole = req.user.role;
        const userId = req.user.id;

        // Verify subject exists
        const subject = await prisma.subject.findUnique({
            where: { id: subjectId },
            include: {
                class: true,
                chapters: {
                    orderBy: { order: "asc" },
                },
            },
        });

        if (!subject) {
            return res.status(404).json({ error: "Subject not found" });
        }

        // Verify user has access to this subject's class
        if (userRole === "LEARNER") {
            const enrollment = await prisma.enrollment.findFirst({
                where: {
                    userId,
                    classId: subject.classId,
                    status: "ACTIVE"
                },
            });
            if (!enrollment) {
                return res
                    .status(403)
                    .json({ error: "Not enrolled in this class" });
            }
        } else if (userRole === "TEACHER") {
            // Teachers can only see subjects they're assigned to
            const assignment = await prisma.classTeacher.findFirst({
                where: {
                    teacherId: userId,
                    classId: subject.classId
                },
            });

            if (!assignment) {
                return res
                    .status(403)
                    .json({ error: "Not assigned to this class" });
            }
        }

        res.json({ subject });
    } catch (error) {
        console.error("Error fetching subject:", error);
        res.status(500).json({ error: "Failed to fetch subject" });
    }
});

// Add a new endpoint to get subject by name or ID
router.get("/byname/:subjectName", authenticate, async (req, res) => {
    try {
        const { subjectName } = req.params;
        const userRole = req.user.role;
        const userId = req.user.id;

        // First try to find subject by ID (exact match)
        let subject = await prisma.subject.findUnique({
            where: { id: subjectName },
            include: {
                class: true,
                chapters: {
                    orderBy: { order: "asc" },
                },
            },
        });

        // If not found by ID, try to find by name
        if (!subject) {
            subject = await prisma.subject.findFirst({
                where: {
                    name: {
                        contains: subjectName,
                        mode: 'insensitive'
                    }
                },
                include: {
                    class: true,
                    chapters: {
                        orderBy: { order: "asc" },
                    },
                },
            });
        }

        if (!subject) {
            return res.status(404).json({ error: "Subject not found" });
        }

        // Verify user has access to this subject's class
        if (userRole === "LEARNER") {
            const enrollment = await prisma.enrollment.findFirst({
                where: {
                    userId,
                    classId: subject.classId,
                    status: "ACTIVE"
                },
            });
            if (!enrollment) {
                return res
                    .status(403)
                    .json({ error: "Not enrolled in this class" });
            }
        } else if (userRole === "TEACHER") {
            // Teachers can only see subjects they're assigned to
            const assignment = await prisma.classTeacher.findFirst({
                where: {
                    teacherId: userId,
                    classId: subject.classId
                },
            });

            if (!assignment) {
                return res
                    .status(403)
                    .json({ error: "Not assigned to this class" });
            }
        }

        res.json({ subject });
    } catch (error) {
        console.error("Error fetching subject:", error);
        res.status(500).json({ error: "Failed to fetch subject" });
    }
});

export default router;