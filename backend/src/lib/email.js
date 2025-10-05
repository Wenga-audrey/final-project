import nodemailer from 'nodemailer';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail(options) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email credentials not configured. Email not sent.');
      return false;
    }

    await transporter.sendMail({
      from: `"Mindboost Learning" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log(`Email sent successfully to ${options.to}`);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

// Forum notification templates
export const forumEmailTemplates = {
  newReply: (topicTitle, replyAuthor, replyContent, topicUrl) => ({
    subject: `New reply in "${topicTitle}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Mindboost Learning</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">New Reply in Forum Discussion</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #667eea; margin-top: 0;">${topicTitle}</h3>
            <p style="color: #666; margin-bottom: 15px;"><strong>${replyAuthor}</strong> replied:</p>
            <div style="background: #f1f3f4; padding: 15px; border-radius: 6px; border-left: 4px solid #667eea;">
              ${replyContent.substring(0, 200)}${replyContent.length > 200 ? '...' : ''}
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="${topicUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              View Discussion
            </a>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>You're receiving this because you're following this discussion.</p>
          <p>© 2024 Mindboost Learning Platform</p>
        </div>
      </div>
    `,
    text: `New reply in "${topicTitle}"

${replyAuthor} replied:
${replyContent}

View the full discussion: ${topicUrl}`
  }),

  newTopic: (topicTitle, topicAuthor, category, topicUrl) => ({
    subject: `New discussion: "${topicTitle}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Mindboost Learning</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">New Forum Discussion</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <span style="background: #667eea; color: white; padding: 4px 12px; border-radius: 15px; font-size: 12px; margin-right: 10px;">${category}</span>
              <span style="color: #666;">by ${topicAuthor}</span>
            </div>
            <h3 style="color: #333; margin: 0;">${topicTitle}</h3>
          </div>
          
          <div style="text-align: center;">
            <a href="${topicUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Join Discussion
            </a>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>You're receiving this because you're subscribed to ${category} discussions.</p>
          <p>© 2024 Mindboost Learning Platform</p>
        </div>
      </div>
    `,
    text: `New discussion in ${category}: "${topicTitle}" by ${topicAuthor}\n\nJoin the discussion: ${topicUrl}`
  })
};

// Content notification templates
export const contentEmailTemplates = {
  newContent: (contentType, uploaderName, className, subjectName, lessonName, contentUrl) => ({
    subject: `New ${contentType} Available: ${lessonName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Mindboost Learning</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">New ${contentType} Available</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #667eea; margin-top: 0;">${lessonName}</h3>
            <p style="color: #666; margin-bottom: 15px;">
              <strong>${uploaderName}</strong> has uploaded a new ${contentType} for:
            </p>
            <div style="background: #f1f3f4; padding: 15px; border-radius: 6px;">
              <div><strong>Class:</strong> ${className}</div>
              <div><strong>Subject:</strong> ${subjectName}</div>
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="${contentUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              View ${contentType}
            </a>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>You're receiving this because you're enrolled in ${className}.</p>
          <p>© 2024 Mindboost Learning Platform</p>
        </div>
      </div>
    `,
    text: `New ${contentType} available: ${lessonName}

${uploaderName} has uploaded a new ${contentType} for ${className} - ${subjectName}

View the content: ${contentUrl}

You're receiving this because you're enrolled in ${className}.`
  }),

  newLesson: (lessonName, uploaderName, className, subjectName, chapterName, lessonUrl) => ({
    subject: `New Lesson Available: ${lessonName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Mindboost Learning</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">New Lesson Available</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #667eea; margin-top: 0;">${lessonName}</h3>
            <p style="color: #666; margin-bottom: 15px;">
              <strong>${uploaderName}</strong> has created a new lesson for:
            </p>
            <div style="background: #f1f3f4; padding: 15px; border-radius: 6px;">
              <div><strong>Class:</strong> ${className}</div>
              <div><strong>Subject:</strong> ${subjectName}</div>
              <div><strong>Chapter:</strong> ${chapterName}</div>
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="${lessonUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              View Lesson
            </a>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>You're receiving this because you're enrolled in ${className}.</p>
          <p>© 2024 Mindboost Learning Platform</p>
        </div>
      </div>
    `,
    text: `New lesson available: ${lessonName}

${uploaderName} has created a new lesson for ${className} - ${subjectName} - ${chapterName}

View the lesson: ${lessonUrl}

You're receiving this because you're enrolled in ${className}.`
  })
};

// Send forum notifications
export async function sendForumNotifications(
  type,
  data
) {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const topicUrl = `${baseUrl}/forum/${data.topicId}`;

    let recipients = [];

    if (type === 'newReply') {
      // Get topic author and other participants
      const topic = await prisma.forumTopic.findUnique({
        where: { id: data.topicId },
        include: {
          author: { select: { email: true } },
          replies: {
            include: {
              author: { select: { email: true } }
            }
          }
        }
      });

      if (topic) {
        recipients = [topic.author.email];
        // Add unique reply authors
        topic.replies.forEach(reply => {
          if (!recipients.includes(reply.author.email) && reply.author.email !== data.authorName) {
            recipients.push(reply.author.email);
          }
        });
      }

      const template = forumEmailTemplates.newReply(
        data.topicTitle,
        data.authorName,
        data.content || '',
        topicUrl
      );

      // Send to all recipients
      for (const email of recipients) {
        await sendEmail({
          to: email,
          subject: template.subject,
          html: template.html,
          text: template.text
        });
      }
    } else if (type === 'newTopic') {
      // Get users subscribed to this category (instructors and interested students)
      const subscribedUsers = await prisma.user.findMany({
        where: {
          OR: [
            { role: 'INSTRUCTOR' },
            { role: 'ADMIN' }
          ]
        },
        select: { email: true }
      });

      recipients = subscribedUsers.map(user => user.email);

      const template = forumEmailTemplates.newTopic(
        data.topicTitle,
        data.authorName,
        data.category || 'General',
        topicUrl
      );

      // Send to all recipients
      for (const email of recipients) {
        await sendEmail({
          to: email,
          subject: template.subject,
          html: template.html,
          text: template.text
        });
      }
    }

    console.log(`Forum notifications sent to ${recipients.length} recipients`);
    return true;
  } catch (error) {
    console.error('Failed to send forum notifications:', error);
    return false;
  }
}

// Send content notifications
export async function sendContentNotifications(
  type,
  data
) {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const contentUrl = `${baseUrl}/class/${data.classId}/subject/${data.subjectId}/chapter/${data.chapterId}/lesson/${data.lessonId}`;

    // Get all enrolled learners
    const enrollments = await prisma.enrollment.findMany({
      where: {
        classId: data.classId
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });

    const recipients = enrollments
      .map(enrollment => enrollment.user.email)
      .filter(email => email !== data.uploaderEmail); // Don't notify the uploader

    if (recipients.length === 0) {
      console.log('No recipients to notify for content upload');
      return true;
    }

    let template;

    if (type === 'newContent') {
      template = contentEmailTemplates.newContent(
        data.contentType,
        data.uploaderName,
        data.className,
        data.subjectName,
        data.lessonName,
        contentUrl
      );
    } else if (type === 'newLesson') {
      template = contentEmailTemplates.newLesson(
        data.lessonName,
        data.uploaderName,
        data.className,
        data.subjectName,
        data.chapterName,
        contentUrl
      );
    } else {
      console.warn('Unknown content notification type:', type);
      return false;
    }

    // Send to all recipients
    let successCount = 0;
    for (const email of recipients) {
      try {
        const result = await sendEmail({
          to: email,
          subject: template.subject,
          html: template.html,
          text: template.text
        });

        if (result) {
          successCount++;
        }
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
      }
    }

    console.log(`Content notifications sent successfully to ${successCount}/${recipients.length} recipients`);
    return true;
  } catch (error) {
    console.error('Failed to send content notifications:', error);
    return false;
  }
}