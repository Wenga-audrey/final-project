import { Router } from "express";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { authenticate } from "../middleware/auth.js";
import { intelligentScheduler } from "../lib/scheduler.js";


const router = Router();
const prisma = new PrismaClient();

// Set user availability
router.post("/availability", authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { availability } = req.body;

    if (!Array.isArray(availability)) {
      return res.status(400).json({ error: "Availability must be an array" });
    }

    await intelligentScheduler.setUserAvailability(userId, availability);

    res.json({
      success: true,
      message: "Availability updated successfully"
    });
  } catch (error) {
    next(error);
  }
});

// Get user availability
router.get("/availability", authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const availability = await intelligentScheduler.getUserAvailability(userId);

    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    next(error);
  }
});

// Create a calendar event
router.post("/events", authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, description, scheduledAt, duration, type } = req.body;

    if (!title || !scheduledAt || !duration) {
      return res.status(400).json({ error: "Title, scheduledAt, and duration are required" });
    }

    const event = await prisma.scheduledSession.create({
      data: {
        userId,
        title,
        description,
        scheduledAt: new Date(scheduledAt),
        duration: parseInt(duration),
        type: type || 'custom',
        status: 'scheduled'
      }
    });

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
});

// Get calendar events
router.get("/events", authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const where = { userId };

    if (startDate || endDate) {
      where.scheduledAt = {};
      if (startDate) where.scheduledAt.gte = new Date(startDate);
      if (endDate) where.scheduledAt.lte = new Date(endDate);
    }

    const events = await prisma.scheduledSession.findMany({
      where,
      orderBy: { scheduledAt: 'asc' }
    });

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    next(error);
  }
});

// Generate optimal schedule
router.post("/generate", authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { targetExamDate } = req.body;

    const schedule = await intelligentScheduler.generateOptimalSchedule(
      userId,
      targetExamDate ? new Date(targetExamDate) : undefined
    );

    res.json({
      success: true,
      data: schedule,
      message: `Generated ${schedule.length} study sessions`
    });
  } catch (error) {
    next(error);
  }
});

// Get scheduled sessions
router.get("/sessions", authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const sessions = await intelligentScheduler.getScheduledSessions(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
});

// Update session status
router.patch("/sessions/:sessionId", authenticate, async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { status, actualDuration } = req.body;

    await intelligentScheduler.updateSessionStatus(sessionId, status, actualDuration);

    res.json({
      success: true,
      message: "Session status updated"
    });
  } catch (error) {
    next(error);
  }
});

// Get daily recommendations
router.get("/daily-recommendations", authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const recommendations = await intelligentScheduler.getDailyRecommendations(userId);

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
});

// Get learning patterns analysis
router.get("/learning-patterns", authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const patterns = await intelligentScheduler.analyzeLearningPatterns(userId);

    res.json({
      success: true,
      data: patterns
    });
  } catch (error) {
    next(error);
  }
});

export default router;