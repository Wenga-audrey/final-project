# Notification System Documentation

## Overview
The notification system provides real-time and email notifications for various events in the Mindboost Learning Platform, including content uploads, lesson creation, forum activity, and more.

## Notification Types

### 1. Content Upload Notifications
Triggered when teachers upload new content (documents, videos) to lessons.

**Triggered by:**
- Document upload (`POST /api/uploads/lesson/:lessonId/document`)
- Video upload (`POST /api/uploads/lesson/:lessonId/video`)
- Combined content upload (`POST /api/uploads/lesson/:lessonId/content`)

**Recipients:**
- All learners enrolled in the class containing the lesson

**Notification Format:**
- In-app: "New [content-type] Available" with details
- Email: HTML email with content details and link to lesson

### 2. Lesson Creation Notifications
Triggered when teachers create new lessons.

**Triggered by:**
- Lesson creation (`POST /api/chapters/:chapterId/lessons`)

**Recipients:**
- All learners enrolled in the class containing the chapter

**Notification Format:**
- In-app: "New Lesson Available" with details
- Email: HTML email with lesson details and link to lesson

### 3. Forum Notifications
Triggered when new forum topics or replies are created.

**Triggered by:**
- New topic creation
- New reply to existing topics

**Recipients:**
- Topic author (for replies)
- Other participants in the discussion
- Subscribed users (instructors, admins)

## Implementation Details

### Utility Functions

#### `sendContentUploadNotification(lessonId, uploaderId, contentType)`
Sends notifications when content is uploaded to a lesson.

**Parameters:**
- `lessonId`: ID of the lesson where content was uploaded
- `uploaderId`: ID of the user who uploaded the content
- `contentType`: Type of content uploaded ("document", "video", "document and video")

**Returns:**
- Object with success status and notification details

#### `sendLessonCreationNotification(chapterId, lessonId, uploaderId)`
Sends notifications when a new lesson is created.

**Parameters:**
- `chapterId`: ID of the chapter containing the new lesson
- `lessonId`: ID of the newly created lesson
- `uploaderId`: ID of the user who created the lesson

**Returns:**
- Object with success status and notification details

### Email Templates

The system includes HTML email templates for professional-looking notifications:

1. **Content Upload Template** - For document/video uploads
2. **Lesson Creation Template** - For new lesson notifications
3. **Forum Templates** - For forum activity (already existing)

### WebSocket Integration

Real-time notifications are sent via WebSocket to online users. The system automatically falls back to database-only notifications for offline users.

## Testing Notifications

### Test Endpoints

1. **Test Content Notification**
   ```
   POST /api/notification-test/test-content-notification
   Body: {
     "lessonId": "lesson-id-here",
     "contentType": "document"
   }
   ```

2. **Test Lesson Notification**
   ```
   POST /api/notification-test/test-lesson-notification
   Body: {
     "chapterId": "chapter-id-here",
     "lessonId": "lesson-id-here"
   }
   ```

## Configuration

### Environment Variables

```
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:5173
```

### Requirements

1. Email credentials must be configured for email notifications
2. WebSocket server must be running for real-time notifications
3. Database must be accessible for storing notifications

## Customization

### Adding New Notification Types

1. Create a new function in `src/utils/notifications.js`
2. Add email templates in `src/lib/email.js`
3. Call the notification function from the appropriate route handler

### Modifying Templates

Email templates can be customized by modifying the template functions in `src/lib/email.js`. The templates support:
- HTML formatting
- CSS styling
- Dynamic content insertion
- Responsive design

## Error Handling

The notification system is designed to be fault-tolerant:
- Failed email notifications don't affect the main operation
- Failed WebSocket notifications fall back to database storage
- All errors are logged for debugging
- The system continues operating even if notifications fail

## Performance Considerations

- Notifications are sent asynchronously to avoid blocking main operations
- Email sending is batched to prevent overwhelming the email server
- WebSocket connections are efficiently managed
- Database queries are optimized with proper indexing