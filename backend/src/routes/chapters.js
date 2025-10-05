import express from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const router = express.Router();
const prisma = new PrismaClient();

// Get chapters for a subject
router.get("/subject/:subjectId", authenticate, async (req, res) => {
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
      // Teachers can only see chapters for subjects they're assigned to
      const assignment = await prisma.classTeacher.findFirst({
        where: {
          teacherId: userId,
          subjectId
        },
      });

      if (!assignment) {
        return res
          .status(403)
          .json({ error: "Not assigned to this subject" });
      }
    }

    const chapters = await prisma.chapter.findMany({
      where: { subjectId },
      orderBy: { order: "asc" },
      include: {
        lessons: {
          orderBy: { order: "asc" },
        },
      },
    });

    res.json({ chapters });
  } catch (error) {
    console.error("Error fetching chapters:", error);
    res.status(500).json({ error: "Failed to fetch chapters" });
  }
});

// Create a new chapter (TEACHER assigned to subject or PREP_ADMIN)
router.post("/", authenticate, async (req, res) => {
  try {
    const { subjectId, title, description, order, duration } = req.body;
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

    // Check permissions
    if (userRole === "TEACHER") {
      // Teachers can only create chapters for subjects they're assigned to
      const assignment = await prisma.classTeacher.findFirst({
        where: {
          teacherId: userId,
          subjectId
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

    const chapter = await prisma.chapter.create({
      data: {
        subjectId,
        title,
        description,
        order: order || 0,
        duration: duration || 60,
      },
    });

    res.status(201).json({ chapter });
  } catch (error) {
    console.error("Error creating chapter:", error);
    res.status(500).json({ error: "Failed to create chapter" });
  }
});

// Update a chapter (TEACHER assigned to subject or PREP_ADMIN)
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, order, duration, isPublished } = req.body;
    const userRole = req.user.role;
    const userId = req.user.id;

    // Verify chapter exists
    const chapter = await prisma.chapter.findUnique({
      where: { id },
      include: { subject: { include: { class: true } } },
    });

    if (!chapter) {
      return res.status(404).json({ error: "Chapter not found" });
    }

    // Check permissions
    if (userRole === "TEACHER") {
      // Teachers can only update chapters for subjects they're assigned to
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

    const updatedChapter = await prisma.chapter.update({
      where: { id },
      data: {
        title,
        description,
        order,
        duration,
        isPublished,
      },
    });

    res.json({ chapter: updatedChapter });
  } catch (error) {
    console.error("Error updating chapter:", error);
    res.status(500).json({ error: "Failed to update chapter" });
  }
});

// Delete a chapter (TEACHER assigned to subject or PREP_ADMIN)
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;

    // Verify chapter exists
    const chapter = await prisma.chapter.findUnique({
      where: { id },
      include: { subject: { include: { class: true } } },
    });

    if (!chapter) {
      return res.status(404).json({ error: "Chapter not found" });
    }

    // Check permissions
    if (userRole === "TEACHER") {
      // Teachers can only delete chapters for subjects they're assigned to
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

    // Check if chapter has lessons (prevent deletion if content exists)
    const lessonCount = await prisma.lesson.count({
      where: { chapterId: id },
    });

    if (lessonCount > 0) {
      return res.status(400).json({
        error: "Cannot delete chapter with existing lessons. Delete lessons first."
      });
    }

    await prisma.chapter.delete({
      where: { id },
    });

    res.json({ message: "Chapter deleted successfully" });
  } catch (error) {
    console.error("Error deleting chapter:", error);
    res.status(500).json({ error: "Failed to delete chapter" });
  }
});

export default router;