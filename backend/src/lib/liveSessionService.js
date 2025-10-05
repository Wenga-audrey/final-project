import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export class LiveSessionService {
  
  static async createSession(sessionData) {
    try {
      // Verify teacher is assigned to the class
      const teacherAssignment = await prisma.classTeacher.findFirst({
        where: {
          teacherId: sessionData.teacherId,
          classId: sessionData.classId,
          ...(sessionData.subjectId && { subjectId: sessionData.subjectId })
        }
      });

      if (!teacherAssignment) {
        throw new Error('Teacher is not assigned to this class/subject');
      }

      // Generate meeting URL (integrate with your preferred video platform)
      const meetingUrl = await this.generateMeetingUrl(sessionData.title);

      const session = await prisma.$queryRaw`
        INSERT INTO live_sessions (
          id, title, description, teacher_id, class_id, subject_id,
          scheduled_at, duration, meeting_url, status, max_participants,
          created_at, updated_at
        ) VALUES (
          ${this.generateId()}, ${sessionData.title}, ${sessionData.description || null},
          ${sessionData.teacherId}, ${sessionData.classId}, ${sessionData.subjectId || null},
          ${sessionData.scheduledAt}, ${sessionData.duration}, ${meetingUrl},
          'SCHEDULED', ${sessionData.maxParticipants || 50},
          NOW(), NOW()
        )
      `;

      return session;
    } catch (error) {
      console.error('Error creating live session:', error);
      throw error;
    }
  }

  static async getSessionsByTeacher(teacherId) {
    return await prisma.$queryRaw`
      SELECT ls.*, pc.name as class_name, s.name as subject_name,
             COUNT(sp.id) as participant_count
      FROM live_sessions ls
      LEFT JOIN preparatory_classes pc ON ls.class_id = pc.id
      LEFT JOIN subjects s ON ls.subject_id = s.id
      LEFT JOIN session_participants sp ON ls.id = sp.session_id
      WHERE ls.teacher_id = ${teacherId}
      GROUP BY ls.id
      ORDER BY ls.scheduled_at DESC
    `;
  }

  static async getSessionsByClass(classId) {
    return await prisma.$queryRaw`
      SELECT ls.*, u.first_name, u.last_name, s.name as subject_name,
             COUNT(sp.id) as participant_count
      FROM live_sessions ls
      LEFT JOIN users u ON ls.teacher_id = u.id
      LEFT JOIN subjects s ON ls.subject_id = s.id
      LEFT JOIN session_participants sp ON ls.id = sp.session_id
      WHERE ls.class_id = ${classId}
      GROUP BY ls.id
      ORDER BY ls.scheduled_at ASC
    `;
  }

  static async joinSession(sessionId, userId) {
    try {
      // Check if session exists and is live
      const session = await prisma.$queryRaw`
        SELECT * FROM live_sessions WHERE id = ${sessionId} AND status = 'LIVE'
      `;

      if (!session.length) {
        throw new Error('Session not found or not currently live');
      }

      // Check if user is enrolled in the class
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          userId: userId,
          classId: session[0].class_id,
          status: 'ACTIVE'
        }
      });

      if (!enrollment) {
        throw new Error('User is not enrolled in this class');
      }

      // Record participation
      await prisma.$queryRaw`
        INSERT INTO session_participants (id, session_id, user_id, joined_at, attendance_duration)
        VALUES (${this.generateId()}, ${sessionId}, ${userId}, NOW(), 0)
        ON DUPLICATE KEY UPDATE joined_at = NOW()
      `;

      return { meetingUrl: session[0].meeting_url, sessionId };
    } catch (error) {
      console.error('Error joining session:', error);
      throw error;
    }
  }

  static async updateSessionStatus(sessionId, status) {
    return await prisma.$queryRaw`
      UPDATE live_sessions 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${sessionId}
    `;
  }

  static async recordAttendance(sessionId, userId, duration) {
    return await prisma.$queryRaw`
      UPDATE session_participants 
      SET attendance_duration = ${duration}, left_at = NOW()
      WHERE session_id = ${sessionId} AND user_id = ${userId}
    `;
  }

  static generateMeetingUrl(title) {
    // Integration point for video platforms (Zoom, Google Meet, etc.)
    // For now, return a placeholder URL
    const sessionCode = Math.random().toString(36).substring(2, 15);
    return `https://meet.mindboost.cm/session/${sessionCode}`;
  }

  static generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

// Database schema additions needed (add to schema.prisma):
/*
model LiveSession {
  id              String   @id @default(cuid())
  title           String
  description     String?  @db.Text
  teacherId       String
  classId         String
  subjectId       String?
  scheduledAt     DateTime
  duration        Int      // minutes
  meetingUrl      String?
  status          String   @default("SCHEDULED") // SCHEDULED, LIVE, COMPLETED, CANCELLED
  maxParticipants Int      @default(50)
  recordingUrl    String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  teacher      User                @relation("TeacherSessions", fields: [teacherId], references: [id], onDelete: Cascade)
  class        PreparatoryClass    @relation(fields: [classId], references: [id], onDelete: Cascade)
  subject      Subject?            @relation(fields: [subjectId], references: [id], onDelete: SetNull)
  participants SessionParticipant[]

  @@map("live_sessions")
}

model SessionParticipant {
  id                 String    @id @default(cuid())
  sessionId          String
  userId             String
  joinedAt           DateTime?
  leftAt             DateTime?
  attendanceDuration Int       @default(0) // minutes

  // Relations
  session LiveSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  user    User        @relation("SessionParticipants", fields: [userId], references: [id], onDelete: Cascade)

  @@unique([sessionId, userId])
  @@map("session_participants")
}
*/
