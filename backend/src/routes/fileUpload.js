import express from 'express';
import { documentUpload, videoUpload, lessonContentUpload, getFileUrl, deleteFile } from '../lib/fileUploadService.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { sendContentUploadNotification } from '../utils/notifications.js';

const router = express.Router();
const prisma = new PrismaClient();

// Upload document for lesson
router.post('/lesson/:lessonId/document',
  authenticate,
  requireRole(['TEACHER', 'PREP_ADMIN']),
  documentUpload,
  async (req, res) => {
    try {
      const { lessonId } = req.params;
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({ error: 'No document file provided' });
      }

      // Verify teacher has access to this lesson
      const lesson = await prisma.lesson.findFirst({
        where: {
          id: lessonId,
          chapter: {
            subject: {
              class: {
                teachers: {
                  some: { teacherId: userId }
                }
              }
            }
          }
        }
      });

      if (!lesson) {
        return res.status(403).json({ error: 'Access denied to this lesson' });
      }

      const documentUrl = getFileUrl(req.file.filename, 'document');

      // Update lesson with document URL
      const updatedLesson = await prisma.lesson.update({
        where: { id: lessonId },
        data: { documentUrl }
      });

      // Send notification to enrolled learners
      try {
        await sendContentUploadNotification(lessonId, userId, 'document');
      } catch (notificationError) {
        console.error('Failed to send document upload notification:', notificationError);
        // Don't fail the request if notification fails
      }

      res.json({
        message: 'Document uploaded successfully',
        documentUrl,
        lesson: updatedLesson
      });

    } catch (error) {
      console.error('Document upload error:', error);
      res.status(500).json({ error: 'Failed to upload document' });
    }
  }
);

// Upload video for lesson
router.post('/lesson/:lessonId/video',
  authenticate,
  requireRole(['TEACHER', 'PREP_ADMIN']),
  videoUpload,
  async (req, res) => {
    try {
      const { lessonId } = req.params;
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({ error: 'No video file provided' });
      }

      // Verify teacher has access to this lesson
      const lesson = await prisma.lesson.findFirst({
        where: {
          id: lessonId,
          chapter: {
            subject: {
              class: {
                teachers: {
                  some: { teacherId: userId }
                }
              }
            }
          }
        }
      });

      if (!lesson) {
        return res.status(403).json({ error: 'Access denied to this lesson' });
      }

      const videoUrl = getFileUrl(req.file.filename, 'video');

      // Update lesson with video URL
      const updatedLesson = await prisma.lesson.update({
        where: { id: lessonId },
        data: { videoUrl }
      });

      // Send notification to enrolled learners
      try {
        await sendContentUploadNotification(lessonId, userId, 'video');
      } catch (notificationError) {
        console.error('Failed to send video upload notification:', notificationError);
        // Don't fail the request if notification fails
      }

      res.json({
        message: 'Video uploaded successfully',
        videoUrl,
        lesson: updatedLesson
      });

    } catch (error) {
      console.error('Video upload error:', error);
      res.status(500).json({ error: 'Failed to upload video' });
    }
  }
);

// Upload both document and video for lesson
router.post('/lesson/:lessonId/content',
  authenticate,
  requireRole(['TEACHER', 'PREP_ADMIN']),
  lessonContentUpload,
  async (req, res) => {
    try {
      const { lessonId } = req.params;
      const userId = req.user.id;
      const files = req.files;

      // Verify teacher has access to this lesson
      const lesson = await prisma.lesson.findFirst({
        where: {
          id: lessonId,
          chapter: {
            subject: {
              class: {
                teachers: {
                  some: { teacherId: userId }
                }
              }
            }
          }
        }
      });

      if (!lesson) {
        return res.status(403).json({ error: 'Access denied to this lesson' });
      }

      const updateData = {};

      if (files.document && files.document[0]) {
        updateData.documentUrl = getFileUrl(files.document[0].filename, 'document');
      }

      if (files.video && files.video[0]) {
        updateData.videoUrl = getFileUrl(files.video[0].filename, 'video');
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No files provided' });
      }

      // Update lesson with new content URLs
      const updatedLesson = await prisma.lesson.update({
        where: { id: lessonId },
        data: updateData
      });

      // Send notification to enrolled learners for each uploaded content type
      try {
        const contentTypes = [];
        if (files.document && files.document[0]) contentTypes.push('document');
        if (files.video && files.video[0]) contentTypes.push('video');
        
        const contentType = contentTypes.join(' and ');
        await sendContentUploadNotification(lessonId, userId, contentType);
      } catch (notificationError) {
        console.error('Failed to send content upload notification:', notificationError);
        // Don't fail the request if notification fails
      }

      res.json({
        message: 'Content uploaded successfully',
        uploadedFiles: updateData,
        lesson: updatedLesson
      });

    } catch (error) {
      console.error('Content upload error:', error);
      res.status(500).json({ error: 'Failed to upload content' });
    }
  }
);

// Delete lesson content
router.delete('/lesson/:lessonId/content/:type',
  authenticate,
  requireRole(['TEACHER', 'PREP_ADMIN']),
  async (req, res) => {
    try {
      const { lessonId, type } = req.params;
      const userId = req.user.id;

      if (!['document', 'video'].includes(type)) {
        return res.status(400).json({ error: 'Invalid content type' });
      }

      // Verify teacher has access
      const lesson = await prisma.lesson.findFirst({
        where: {
          id: lessonId,
          chapter: {
            subject: {
              class: {
                teachers: {
                  some: { teacherId: userId }
                }
              }
            }
          }
        }
      });

      if (!lesson) {
        return res.status(403).json({ error: 'Access denied to this lesson' });
      }

      // Get current file URL
      const currentUrl = type === 'document' ? lesson.documentUrl : lesson.videoUrl;

      if (currentUrl) {
        // Extract filename from URL and delete from storage
        const filename = currentUrl.split('/').pop();
        if (filename) {
          await deleteFile(filename, type);
        }

        // Remove URL from lesson
        await prisma.lesson.update({
          where: { id: lessonId },
          data: { [`${type}Url`]: null }
        });
      }

      res.json({ message: `${type} deleted successfully` });
    } catch (error) {
      console.error('Delete content error:', error);
      res.status(500).json({ error: `Failed to delete ${type}` });
    }
  }
);

export default router;