import { Router } from "express";
import prisma from "../prisma";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

// All routes require Super Admin authentication
router.use(authenticate);
router.use(requireRole(['SUPER_ADMIN']));

// User management (create, update, suspend/ban)
router.post("/users", async (req, res, next) => {
  try {
    const { name, email, role } = req.body;
    const user = await prisma.user.create({ data: { name, email, role } });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

router.patch("/users/:userId/suspend", async (req, res, next) => {
  try {
    await prisma.user.update({ where: { id: req.params.userId }, data: { suspended: true } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.delete("/users/:userId", async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.params.userId } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Platform configuration (languages, subscriptions, payments)
router.get("/settings", async (req, res, next) => {
  try {
    const settings = await prisma.platformSettings.findFirst();
    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
});
router.patch("/settings", async (req, res, next) => {
  try {
    await prisma.platformSettings.update({ where: { id: 1 }, data: req.body });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Content oversight
router.get("/pending-content", async (req, res, next) => {
  try {
    const lessons = await prisma.lesson.findMany({ where: { approved: false } });
    const syllabi = await prisma.syllabus.findMany({ where: { approved: false } });
    res.json({ success: true, lessons, syllabi });
  } catch (err) {
    next(err);
  }
});
router.post("/lessons/:lessonId/approve", async (req, res, next) => {
  try {
    await prisma.lesson.update({ where: { id: req.params.lessonId }, data: { approved: true } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Analytics and reports
router.get("/dashboard", async (req, res, next) => {
  try {
    const [
      userStats,
      paidUsers,
      revenue,
      exams,
      courses,
      totalPayments,
      commissionEarned
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { subscriptionStatus: "PAID" } }),
      prisma.payment.aggregate({ _sum: { amount: true } }),
      prisma.exam.count(),
      prisma.course.count(),
      prisma.payment.count(),
      prisma.commission.count()
    ]);

    // Get recent payments for commission tracking
    const recentPayments = await prisma.payment.findMany({
      where: { status: 'PAID' },
      include: {
        class: { select: { name: true, examType: true } },
        user: { select: { firstName: true, lastName: true } }
      },
      orderBy: { paidAt: 'desc' },
      take: 10
    });

    res.json({
      success: true,
      stats: {
        userStats,
        paidUsers,
        totalRevenue: revenue._sum.amount || 0,
        exams,
        courses,
        totalPayments,
        commissionEarned
      },
      recentPayments
    });
  } catch (err) {
    next(err);
  }
});

// Security & compliance
router.get("/audit-logs", async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
    res.json({ success: true, logs });
  } catch (err) {
    next(err);
  }
});

// Commission tracking
router.get("/commissions", async (req, res, next) => {
  try {
    const commissions = await prisma.commission.findMany({
      include: {
        payment: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            class: { select: { name: true, examType: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const totalCommission = await prisma.commission.aggregate({
      _sum: { amount: true }
    });

    res.json({
      success: true,
      commissions,
      totalCommission: totalCommission._sum.amount || 0
    });
  } catch (err) {
    next(err);
  }
});

// Approve Preparatory Class Admins
router.post("/prep-admins/:userId/approve", async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        role: 'PREP_ADMIN',
        isActive: true
      }
    });

    res.json({
      success: true,
      message: "Preparatory Class Admin approved successfully",
      user
    });
  } catch (err) {
    next(err);
  }
});

export default router;