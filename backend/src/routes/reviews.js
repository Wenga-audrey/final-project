import express from 'express';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get reviews for a preparatory class with average rating
router.get('/:classId', async (req, res, next) => {
  try {
    const { classId } = req.params;

    const [reviews, aggregates] = await Promise.all([
      prisma.classReview.findMany({
        where: { classId },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatar: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.classReview.aggregate({
        where: { classId },
        _avg: { rating: true },
        _count: { _all: true }
      })
    ]);

    res.json({
      reviews,
      averageRating: aggregates._avg.rating ?? 0,
      total: aggregates._count._all
    });
  } catch (error) {
    next(error);
  }
});

// Create or update a review (Learner only)
router.post('/:classId', authenticate, async (req, res, next) => {
  try {
    const { classId } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Ensure learner is enrolled in the class
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_classId: { userId, classId } }
    });
    if (!enrollment) {
      return res.status(403).json({ error: 'You must be enrolled in this class to review it' });
    }

    const review = await prisma.classReview.upsert({
      where: { userId_classId: { userId, classId } },
      create: { userId, classId, rating, comment },
      update: { rating, comment }
    });

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
});

export default router;
