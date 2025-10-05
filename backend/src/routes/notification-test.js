import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { sendContentUploadNotification, sendLessonCreationNotification } from '../utils/notifications.js';

const router = express.Router();

// Test content upload notification
router.post('/test-content-notification', authenticate, requireRole(['TEACHER', 'PREP_ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { lessonId, contentType } = req.body;
    const userId = req.user.id;

    if (!lessonId || !contentType) {
      return res.status(400).json({ error: 'lessonId and contentType are required' });
    }

    const result = await sendContentUploadNotification(lessonId, userId, contentType);

    res.json({
      message: 'Content upload notification test completed',
      result
    });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

// Test lesson creation notification
router.post('/test-lesson-notification', authenticate, requireRole(['TEACHER', 'PREP_ADMIN', 'SUPER_ADMIN']), async (req, res) => {
  try {
    const { chapterId, lessonId } = req.body;
    const userId = req.user.id;

    if (!chapterId || !lessonId) {
      return res.status(400).json({ error: 'chapterId and lessonId are required' });
    }

    const result = await sendLessonCreationNotification(chapterId, lessonId, userId);

    res.json({
      message: 'Lesson creation notification test completed',
      result
    });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

export default router;