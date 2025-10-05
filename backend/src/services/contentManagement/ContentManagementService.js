import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { createAIService } from "../../lib/aiService.js";

const prisma = new PrismaClient();
const aiService = createAIService();

export class ContentManagementService {
    /**
     * Add multimedia content to a lesson
     */
    async addMultimediaContent(lessonId, contentData) {
        const { type, url, title, description, metadata } = contentData;

        const content = await prisma.multimediaContent.create({
            data: {
                type,
                url,
                title,
                description,
                metadata,
                lessonId
            }
        });

        return content;
    }

    /**
     * Get all multimedia content for a lesson
     */
    async getLessonMultimediaContent(lessonId) {
        const content = await prisma.multimediaContent.findMany({
            where: { lessonId },
            orderBy: { createdAt: 'asc' }
        });

        return content;
    }

    /**
     * Create interactive simulation
     */
    async createInteractiveSimulation(simulationData) {
        const { title, description, type, parameters, lessonId } = simulationData;

        const simulation = await prisma.interactiveSimulation.create({
            data: {
                title,
                description,
                type,
                parameters,
                lessonId
            }
        });

        return simulation;
    }

    /**
     * Get interactive simulations for a lesson
     */
    async getLessonSimulations(lessonId) {
        const simulations = await prisma.interactiveSimulation.findMany({
            where: { lessonId },
            orderBy: { createdAt: 'asc' }
        });

        return simulations;
    }

    /**
     * Track content version
     */
    async createContentVersion(contentId, versionData) {
        const { versionNumber, changes, authorId, notes } = versionData;

        const version = await prisma.contentVersion.create({
            data: {
                contentId,
                versionNumber,
                changes,
                authorId,
                notes
            }
        });

        return version;
    }

    /**
     * Get content version history
     */
    async getContentVersionHistory(contentId) {
        const versions = await prisma.contentVersion.findMany({
            where: { contentId },
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        return versions;
    }

    /**
     * Add multilingual support to content
     */
    async addMultilingualContent(contentId, language, translationData) {
        const { title, description, content } = translationData;

        const multilingualContent = await prisma.multilingualContent.upsert({
            where: {
                contentId_language: {
                    contentId,
                    language
                }
            },
            update: {
                title,
                description,
                content
            },
            create: {
                contentId,
                language,
                title,
                description,
                content
            }
        });

        return multilingualContent;
    }

    /**
     * Get content in specific language
     */
    async getContentInLanguage(contentId, language) {
        const content = await prisma.multilingualContent.findUnique({
            where: {
                contentId_language: {
                    contentId,
                    language
                }
            }
        });

        return content;
    }

    /**
     * Get all language versions of content
     */
    async getAllLanguageVersions(contentId) {
        const versions = await prisma.multilingualContent.findMany({
            where: { contentId }
        });

        return versions;
    }
}