import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { createAIService } from "../../lib/aiService.js";

const prisma = new PrismaClient();
const aiService = createAIService();

export class CollaborativeLearningService {
    /**
     * Create enhanced study group with video conferencing capabilities
     */
    async createStudyGroup(userId, groupData) {
        const { name, description, classId, maxMembers = 10, isPublic = false } = groupData;

        // Create the study group
        const studyGroup = await prisma.studyGroup.create({
            data: {
                name,
                description,
                classId,
                maxMembers,
                isPublic,
                createdById: userId,
                members: {
                    create: {
                        userId,
                        role: 'ADMIN'
                    }
                }
            },
            include: {
                class: true,
                createdBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        return studyGroup;
    }

    /**
     * Join a study group
     */
    async joinStudyGroup(userId, groupId) {
        const group = await prisma.studyGroup.findUnique({
            where: { id: groupId }
        });

        if (!group) {
            throw new Error('Study group not found');
        }

        // Check if user is already a member
        const existingMember = await prisma.studyGroupMember.findFirst({
            where: {
                userId,
                studyGroupId: groupId
            }
        });

        if (existingMember) {
            throw new Error('User is already a member of this study group');
        }

        // Check if group is full
        const memberCount = await prisma.studyGroupMember.count({
            where: { studyGroupId: groupId }
        });

        if (memberCount >= group.maxMembers) {
            throw new Error('Study group is full');
        }

        // Add user to group
        const member = await prisma.studyGroupMember.create({
            data: {
                userId,
                studyGroupId: groupId,
                role: 'MEMBER'
            }
        });

        // Send notification to group members
        await this.sendGroupNotification(groupId, `${member.user.firstName} ${member.user.lastName} has joined the group`, 'GROUP_JOIN');

        return member;
    }

    /**
     * Leave a study group
     */
    async leaveStudyGroup(userId, groupId) {
        const member = await prisma.studyGroupMember.findFirst({
            where: {
                userId,
                studyGroupId: groupId
            }
        });

        if (!member) {
            throw new Error('User is not a member of this study group');
        }

        // Prevent admin from leaving (they should delete the group instead)
        if (member.role === 'ADMIN') {
            throw new Error('Admin cannot leave the group. Please delete the group or transfer admin rights first.');
        }

        await prisma.studyGroupMember.delete({
            where: { id: member.id }
        });

        return { success: true };
    }

    /**
     * Create peer tutoring session
     */
    async createPeerTutoringSession(userId, sessionId, sessionData) {
        const { title, description, startTime, duration, maxParticipants = 5, skillLevel = 'INTERMEDIATE' } = sessionData;

        const session = await prisma.peerTutoringSession.create({
            data: {
                id: sessionId,
                title,
                description,
                startTime: new Date(startTime),
                duration,
                maxParticipants,
                skillLevel,
                tutorId: userId,
                participants: {
                    create: {
                        userId,
                        role: 'TUTOR'
                    }
                }
            },
            include: {
                tutor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            }
        });

        return session;
    }

    /**
     * Join peer tutoring session
     */
    async joinPeerTutoringSession(userId, sessionId) {
        const session = await prisma.peerTutoringSession.findUnique({
            where: { id: sessionId }
        });

        if (!session) {
            throw new Error('Tutoring session not found');
        }

        // Check if user is already a participant
        const existingParticipant = await prisma.peerTutoringParticipant.findFirst({
            where: {
                userId,
                sessionId
            }
        });

        if (existingParticipant) {
            throw new Error('User is already participating in this session');
        }

        // Check if session is full
        const participantCount = await prisma.peerTutoringParticipant.count({
            where: { sessionId }
        });

        if (participantCount >= session.maxParticipants) {
            throw new Error('Tutoring session is full');
        }

        // Add user to session
        const participant = await prisma.peerTutoringParticipant.create({
            data: {
                userId,
                sessionId,
                role: 'STUDENT'
            }
        });

        return participant;
    }

    /**
     * Create knowledge sharing post
     */
    async createKnowledgePost(userId, postData) {
        const { title, content, tags, groupId, courseId, subjectId } = postData;

        const post = await prisma.knowledgePost.create({
            data: {
                title,
                content,
                userId,
                groupId,
                courseId,
                subjectId,
                tags: tags ? JSON.stringify(tags) : undefined
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                group: true,
                course: true,
                subject: true
            }
        });

        // Parse tags
        return {
            ...post,
            tags: post.tags ? JSON.parse(post.tags) : []
        };
    }

    /**
     * Get knowledge posts with filtering
     */
    async getKnowledgePosts(filters = {}) {
        const where = {};

        if (filters.groupId) {
            where.groupId = filters.groupId;
        }

        if (filters.courseId) {
            where.courseId = filters.courseId;
        }

        if (filters.subjectId) {
            where.subjectId = filters.subjectId;
        }

        if (filters.userId) {
            where.userId = filters.userId;
        }

        if (filters.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { content: { contains: filters.search, mode: 'insensitive' } }
            ];
        }

        const posts = await prisma.knowledgePost.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                group: true,
                course: true,
                subject: true,
                _count: {
                    select: {
                        comments: true,
                        likes: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Parse tags and add counts
        return posts.map(post => ({
            ...post,
            tags: post.tags ? JSON.parse(post.tags) : [],
            commentCount: post._count.comments,
            likeCount: post._count.likes
        }));
    }

    /**
     * Add comment to knowledge post
     */
    async addCommentToPost(userId, postId, commentData) {
        const { content, parentId } = commentData;

        const comment = await prisma.knowledgeComment.create({
            data: {
                content,
                userId,
                postId,
                parentId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                parent: true
            }
        });

        return comment;
    }

    /**
     * Like knowledge post
     */
    async likeKnowledgePost(userId, postId) {
        // Check if user already liked the post
        const existingLike = await prisma.knowledgeLike.findFirst({
            where: {
                userId,
                postId
            }
        });

        if (existingLike) {
            // Unlike if already liked
            await prisma.knowledgeLike.delete({
                where: { id: existingLike.id }
            });
            return { liked: false };
        } else {
            // Like the post
            await prisma.knowledgeLike.create({
                data: {
                    userId,
                    postId
                }
            });
            return { liked: true };
        }
    }

    /**
     * Create group project
     */
    async createGroupProject(userId, projectData) {
        const { title, description, groupId, deadline, maxMembers = 5 } = projectData;

        const project = await prisma.groupProject.create({
            data: {
                title,
                description,
                groupId,
                deadline: new Date(deadline),
                maxMembers,
                createdById: userId,
                members: {
                    create: {
                        userId,
                        role: 'LEADER'
                    }
                }
            },
            include: {
                group: true,
                createdBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        return project;
    }

    /**
     * Join group project
     */
    async joinGroupProject(userId, projectId) {
        const project = await prisma.groupProject.findUnique({
            where: { id: projectId }
        });

        if (!project) {
            throw new Error('Project not found');
        }

        // Check if user is already a member
        const existingMember = await prisma.projectMember.findFirst({
            where: {
                userId,
                projectId
            }
        });

        if (existingMember) {
            throw new Error('User is already a member of this project');
        }

        // Check if project is full
        const memberCount = await prisma.projectMember.count({
            where: { projectId }
        });

        if (memberCount >= project.maxMembers) {
            throw new Error('Project team is full');
        }

        // Add user to project
        const member = await prisma.projectMember.create({
            data: {
                userId,
                projectId,
                role: 'MEMBER'
            }
        });

        return member;
    }

    /**
     * Send notification to group members
     */
    async sendGroupNotification(groupId, message, type = 'INFO') {
        try {
            const members = await prisma.studyGroupMember.findMany({
                where: { studyGroupId: groupId },
                include: { user: true }
            });

            const notifications = members.map(member => ({
                userId: member.userId,
                title: 'Study Group Update',
                message,
                type
            }));

            if (notifications.length > 0) {
                await prisma.notification.createMany({
                    data: notifications
                });
            }
        } catch (error) {
            console.error('Failed to send group notifications:', error);
        }
    }

    /**
     * Get study group details with members and activity
     */
    async getStudyGroupDetails(groupId) {
        const group = await prisma.studyGroup.findUnique({
            where: { id: groupId },
            include: {
                class: true,
                createdBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                },
                messages: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            }
        });

        if (!group) {
            throw new Error('Study group not found');
        }

        // Get recent knowledge posts for the group
        const recentPosts = await prisma.knowledgePost.findMany({
            where: { groupId },
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        return {
            ...group,
            recentPosts
        };
    }
}