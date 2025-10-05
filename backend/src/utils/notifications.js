import { prisma } from "../lib/prisma.js";
import { getWebSocketService } from "../lib/websocket.js";
import { sendContentNotifications } from "../lib/email.js";

export async function sendNotificationToLearner(learnerId, title, message, type = "info") {
  try {
    // Save notification to database
    const notification = await prisma.notification.create({
      data: {
        userId: learnerId,
        title,
        message,
        type,
        isRead: false
      }
    });

    // Send real-time notification via WebSocket if user is online
    try {
      const wsService = getWebSocketService();
      wsService.sendNotificationToUser(learnerId, {
        id: notification.id,
        title,
        message,
        type,
        createdAt: notification.createdAt
      });
    } catch (wsError) {
      // WebSocket notification is optional, so we don't fail if it doesn't work
      console.debug('WebSocket notification failed:', wsError);
    }

    return { success: true, notification };
  } catch (error) {
    console.error("Failed to send notification:", error);
    return { success: false, error: error.message };
  }
}

export async function sendNotificationToMultipleLearners(learnerIds, title, message, type = "info") {
  const results = [];

  for (const learnerId of learnerIds) {
    try {
      const result = await sendNotificationToLearner(learnerId, title, message, type);
      results.push({ learnerId, ...result });
    } catch (error) {
      results.push({ learnerId, success: false, error: error.message });
    }
  }

  return results;
}

export async function sendContentUploadNotification(lessonId, uploaderId, contentType) {
  try {
    // Get the lesson with related information
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        chapter: {
          include: {
            subject: {
              include: {
                class: {
                  include: {
                    enrollments: {
                      include: {
                        user: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!lesson) {
      console.error('Lesson not found for notification');
      return { success: false, error: 'Lesson not found' };
    }

    // Get the uploader's name and email
    const uploader = await prisma.user.findUnique({
      where: { id: uploaderId },
      select: { firstName: true, lastName: true, email: true }
    });

    const uploaderName = uploader ? `${uploader.firstName} ${uploader.lastName}` : 'A teacher';
    const className = lesson.chapter.subject.class.name;
    const subjectName = lesson.chapter.subject.name;
    const chapterName = lesson.chapter.title;
    const lessonName = lesson.title;

    // Create notification title and message
    const title = `New ${contentType} Available`;
    const message = `${uploaderName} uploaded a new ${contentType} for "${lessonName}" in ${className} - ${subjectName}`;

    // Get all enrolled learners
    const learnerIds = lesson.chapter.subject.class.enrollments
      .map(enrollment => enrollment.user.id)
      .filter(id => id !== uploaderId); // Don't notify the uploader

    if (learnerIds.length === 0) {
      return { success: true, message: 'No learners to notify' };
    }

    // Send notifications to all enrolled learners
    const results = await sendNotificationToMultipleLearners(
      learnerIds,
      title,
      message,
      'content'
    );

    // Send email notifications
    try {
      await sendContentNotifications('newContent', {
        contentType,
        uploaderName,
        uploaderEmail: uploader?.email,
        className,
        subjectName,
        chapterName,
        lessonName,
        classId: lesson.chapter.subject.class.id,
        subjectId: lesson.chapter.subject.id,
        chapterId: lesson.chapter.id,
        lessonId: lesson.id
      });
    } catch (emailError) {
      console.error('Failed to send content email notifications:', emailError);
      // Don't fail the overall operation if email fails
    }

    return {
      success: true,
      notifiedLearners: learnerIds.length,
      results
    };
  } catch (error) {
    console.error('Failed to send content upload notification:', error);
    return { success: false, error: error.message };
  }
}

export async function sendLessonCreationNotification(chapterId, lessonId, uploaderId) {
  try {
    // Get the chapter with related information
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        subject: {
          include: {
            class: {
              include: {
                enrollments: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!chapter) {
      console.error('Chapter not found for notification');
      return { success: false, error: 'Chapter not found' };
    }

    // Get the lesson information
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId }
    });

    if (!lesson) {
      console.error('Lesson not found for notification');
      return { success: false, error: 'Lesson not found' };
    }

    // Get the uploader's name and email
    const uploader = await prisma.user.findUnique({
      where: { id: uploaderId },
      select: { firstName: true, lastName: true, email: true }
    });

    const uploaderName = uploader ? `${uploader.firstName} ${uploader.lastName}` : 'A teacher';
    const className = chapter.subject.class.name;
    const subjectName = chapter.subject.name;
    const chapterName = chapter.title;
    const lessonName = lesson.title;

    // Create notification title and message
    const title = 'New Lesson Available';
    const message = `${uploaderName} created a new lesson "${lessonName}" in "${chapterName}" for ${className} - ${subjectName}`;

    // Get all enrolled learners
    const learnerIds = chapter.subject.class.enrollments
      .map(enrollment => enrollment.user.id)
      .filter(id => id !== uploaderId); // Don't notify the uploader

    if (learnerIds.length === 0) {
      return { success: true, message: 'No learners to notify' };
    }

    // Send notifications to all enrolled learners
    const results = await sendNotificationToMultipleLearners(
      learnerIds,
      title,
      message,
      'lesson'
    );

    // Send email notifications
    try {
      await sendContentNotifications('newLesson', {
        lessonName,
        uploaderName,
        uploaderEmail: uploader?.email,
        className,
        subjectName,
        chapterName,
        classId: chapter.subject.class.id,
        subjectId: chapter.subject.id,
        chapterId: chapter.id,
        lessonId: lesson.id
      });
    } catch (emailError) {
      console.error('Failed to send lesson email notifications:', emailError);
      // Don't fail the overall operation if email fails
    }

    return {
      success: true,
      notifiedLearners: learnerIds.length,
      results
    };
  } catch (error) {
    console.error('Failed to send lesson creation notification:', error);
    return { success: false, error: error.message };
  }
}

export async function sendLoginNotification(userId) {
  try {
    // Get user information
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        lastLoginAt: true
      }
    });

    if (!user) {
      console.error('User not found for login notification');
      return { success: false, error: 'User not found' };
    }

    // Update last login time
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() }
    });

    // Create notification title and message
    const title = 'New Login Detected';
    const message = `Hello ${user.firstName}, a new login to your account was detected at ${new Date().toLocaleString()}.`;

    // Save notification to database
    const notification = await prisma.notification.create({
      data: {
        userId: userId,
        title,
        message,
        type: 'security',
        isRead: false
      }
    });

    // Send real-time notification via WebSocket if user is online
    try {
      const wsService = getWebSocketService();
      wsService.sendNotificationToUser(userId, {
        id: notification.id,
        title,
        message,
        type: 'security',
        createdAt: notification.createdAt
      });
    } catch (wsError) {
      // WebSocket notification is optional, so we don't fail if it doesn't work
      console.debug('WebSocket notification failed:', wsError);
    }

    // For admin roles, also send email notification
    if (['PREP_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      try {
        const { sendEmail } = await import("../lib/email.js");

        const emailSent = await sendEmail({
          to: user.email,
          subject: 'Security Alert: New Login to Your Account',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">Mindboost Learning</h1>
              </div>
              
              <div style="padding: 30px; background: #f8f9fa;">
                <h2 style="color: #333; margin-bottom: 20px;">Security Alert</h2>
                
                <p>Hello ${user.firstName},</p>
                
                <p>We detected a new login to your Mindboost account:</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                  <p><strong>Account:</strong> ${user.email}</p>
                  <p><strong>Login Time:</strong> ${new Date().toLocaleString()}</p>
                  <p><strong>IP Address:</strong> ${'Not available in this context'}</p>
                </div>
                
                <p>If this was you, you can safely ignore this email. If you don't recognize this activity, please secure your account immediately.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                    Review Account Activity
                  </a>
                </div>
              </div>
              
              <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
                <p>© 2024 Mindboost Learning Platform</p>
              </div>
            </div>
          `,
          text: `Security Alert: New Login to Your Account

Hello ${user.firstName},

We detected a new login to your Mindboost account:

Account: ${user.email}
Login Time: ${new Date().toLocaleString()}

If this was you, you can safely ignore this email. If you don't recognize this activity, please secure your account immediately.

Visit your profile: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile`
        });

        if (!emailSent) {
          console.error('Failed to send login email notification');
        }
      } catch (emailError) {
        console.error('Failed to send login email notification:', emailError);
      }
    }

    return { success: true, notification };
  } catch (error) {
    console.error("Failed to send login notification:", error);
    return { success: false, error: error.message };
  }
}
