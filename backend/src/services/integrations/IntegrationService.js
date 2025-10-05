import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { createAIService } from "../../lib/aiService.js";

const prisma = new PrismaClient();
const aiService = createAIService();

export class IntegrationService {
    /**
     * Integrate with calendar service
     */
    async integrateWithCalendar(userId, calendarData) {
        const { provider, accessToken, refreshToken, calendarId } = calendarData;

        const integration = await prisma.calendarIntegration.upsert({
            where: {
                userId_provider: {
                    userId,
                    provider
                }
            },
            update: {
                accessToken,
                refreshToken,
                calendarId,
                updatedAt: new Date()
            },
            create: {
                userId,
                provider,
                accessToken,
                refreshToken,
                calendarId
            }
        });

        return integration;
    }

    /**
     * Get user's calendar integration
     */
    async getUserCalendarIntegration(userId, provider) {
        const integration = await prisma.calendarIntegration.findUnique({
            where: {
                userId_provider: {
                    userId,
                    provider
                }
            }
        });

        return integration;
    }

    /**
     * Sync study schedule with calendar
     */
    async syncStudyScheduleWithCalendar(userId, scheduleData) {
        const integration = await this.getUserCalendarIntegration(userId, 'google');

        if (!integration) {
            throw new Error('Calendar integration not found');
        }

        // Create calendar event
        const event = await prisma.calendarEvent.create({
            data: {
                userId,
                title: scheduleData.title,
                description: scheduleData.description,
                startTime: new Date(scheduleData.startTime),
                endTime: new Date(scheduleData.endTime),
                eventType: scheduleData.type || 'STUDY_SESSION',
                calendarIntegrationId: integration.id
            }
        });

        return event;
    }

    /**
     * Share achievement on social media
     */
    async shareAchievementOnSocialMedia(userId, achievementId, platform) {
        const achievement = await prisma.userAchievement.findUnique({
            where: { id: achievementId },
            include: { achievement: true }
        });

        if (!achievement) {
            throw new Error('Achievement not found');
        }

        // Create social share record
        const share = await prisma.socialShare.create({
            data: {
                userId,
                achievementId,
                platform,
                sharedAt: new Date()
            }
        });

        // In a real implementation, this would actually post to social media
        // For now, we'll just simulate the sharing

        return {
            share,
            message: `Achievement "${achievement.achievement.name}" shared on ${platform}`,
            success: true
        };
    }

    /**
     * Integrate with external educational resources
     */
    async integrateEducationalResource(userId, resourceData) {
        const { name, url, type, apiKey } = resourceData;

        const integration = await prisma.educationalResourceIntegration.create({
            data: {
                userId,
                name,
                url,
                type,
                apiKey,
                isActive: true
            }
        });

        return integration;
    }

    /**
     * Get user's educational resource integrations
     */
    async getUserEducationalIntegrations(userId) {
        const integrations = await prisma.educationalResourceIntegration.findMany({
            where: {
                userId,
                isActive: true
            }
        });

        return integrations;
    }

    /**
     * Create API token for third-party integrations
     */
    async createAPIToken(userId, tokenData) {
        const { name, permissions, expiresAt } = tokenData;

        // Generate a random token
        const token = this.generateRandomToken();

        const apiToken = await prisma.apiToken.create({
            data: {
                userId,
                name,
                token,
                permissions,
                expiresAt: expiresAt ? new Date(expiresAt) : null
            }
        });

        return {
            apiToken,
            token
        };
    }

    /**
     * Generate random API token
     */
    generateRandomToken() {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }

    /**
     * Get user's API tokens
     */
    async getUserAPITokens(userId) {
        const tokens = await prisma.apiToken.findMany({
            where: {
                userId,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } }
                ]
            },
            select: {
                id: true,
                name: true,
                permissions: true,
                createdAt: true,
                expiresAt: true
            }
        });

        return tokens;
    }

    /**
     * Revoke API token
     */
    async revokeAPIToken(userId, tokenId) {
        const token = await prisma.apiToken.update({
            where: {
                id: tokenId,
                userId
            },
            data: {
                expiresAt: new Date() // Set to current time to expire immediately
            }
        });

        return token;
    }
}