import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export class StudyToolsService {
    /**
     * Create digital flashcards with spaced repetition
     */
    async createFlashcards(userId, flashcardData) {
        const { title, description, cards, courseId, subjectId, chapterId } = flashcardData;

        const flashcardSet = await prisma.flashcardSet.create({
            data: {
                title,
                description,
                userId,
                courseId,
                subjectId,
                chapterId,
                cards: {
                    create: cards.map((card, index) => ({
                        front: card.front,
                        back: card.back,
                        order: index + 1,
                        difficulty: card.difficulty || 'MEDIUM',
                        lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : null,
                        nextReview: card.nextReview ? new Date(card.nextReview) : new Date(),
                        reviewCount: card.reviewCount || 0,
                        easeFactor: card.easeFactor || 2.5
                    }))
                }
            },
            include: { cards: true }
        });

        return flashcardSet;
    }

    /**
     * Get flashcards for review using spaced repetition algorithm
     */
    async getFlashcardsForReview(userId, limit = 10) {
        const now = new Date();

        const flashcardSets = await prisma.flashcardSet.findMany({
            where: { userId },
            include: {
                cards: {
                    where: {
                        nextReview: {
                            lte: now
                        }
                    },
                    orderBy: { nextReview: 'asc' }
                }
            }
        });

        // Flatten cards and limit
        const allCards = flashcardSets.flatMap(set =>
            set.cards.map(card => ({ ...card, setName: set.title }))
        );

        return allCards.slice(0, parseInt(limit));
    }

    /**
     * Update flashcard after review
     */
    async updateFlashcardAfterReview(cardId, quality) {
        // Quality: 0-5 (0 = complete failure, 5 = perfect recall)
        const card = await prisma.flashcard.findUnique({ where: { id: cardId } });

        if (!card) {
            throw new Error('Flashcard not found');
        }

        // Spaced repetition algorithm (simplified SM-2)
        let { easeFactor, interval, reviewCount } = card;

        // Update ease factor
        easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

        // Update interval
        if (quality < 3) {
            // Reset if quality is poor
            interval = 1;
        } else if (reviewCount === 0) {
            interval = 1;
        } else if (reviewCount === 1) {
            interval = 6;
        } else {
            interval = Math.round(interval * easeFactor);
        }

        reviewCount++;

        // Calculate next review date
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + interval);

        const updatedCard = await prisma.flashcard.update({
            where: { id: cardId },
            data: {
                lastReviewed: new Date(),
                nextReview,
                reviewCount,
                easeFactor
            }
        });

        return updatedCard;
    }

    /**
     * Create mind map for concept visualization
     */
    async createMindMap(userId, mindMapData) {
        const { title, description, nodes, connections, courseId, subjectId, chapterId } = mindMapData;

        const mindMap = await prisma.mindMap.create({
            data: {
                title,
                description,
                userId,
                courseId,
                subjectId,
                chapterId,
                nodes: {
                    create: nodes.map((node, index) => ({
                        id: node.id,
                        label: node.label,
                        type: node.type || 'concept',
                        x: node.x || 0,
                        y: node.y || 0,
                        order: index + 1
                    }))
                },
                connections: {
                    create: connections.map((conn, index) => ({
                        sourceId: conn.sourceId,
                        targetId: conn.targetId,
                        label: conn.label || '',
                        order: index + 1
                    }))
                }
            },
            include: {
                nodes: true,
                connections: true
            }
        });

        return mindMap;
    }

    /**
     * Get mind maps for a user
     */
    async getMindMaps(userId, courseId, subjectId, chapterId) {
        const where = { userId };

        if (chapterId) {
            where.chapterId = chapterId;
        } else if (subjectId) {
            where.subjectId = subjectId;
        } else if (courseId) {
            where.courseId = courseId;
        }

        const mindMaps = await prisma.mindMap.findMany({
            where,
            include: {
                nodes: true,
                connections: true,
                course: true,
                subject: true,
                chapter: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return mindMaps;
    }

    /**
     * Create note-taking system with organization features
     */
    async createNote(userId, noteData) {
        const { title, content, courseId, subjectId, chapterId, tags } = noteData;

        const note = await prisma.note.create({
            data: {
                title,
                content,
                userId,
                courseId,
                subjectId,
                chapterId,
                tags: tags ? JSON.stringify(tags) : undefined
            }
        });

        return note;
    }

    /**
     * Get notes with filtering and search
     */
    async getNotes(userId, filters = {}) {
        const where = { userId };

        if (filters.courseId) {
            where.courseId = filters.courseId;
        }

        if (filters.subjectId) {
            where.subjectId = filters.subjectId;
        }

        if (filters.chapterId) {
            where.chapterId = filters.chapterId;
        }

        if (filters.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { content: { contains: filters.search, mode: 'insensitive' } }
            ];
        }

        const notes = await prisma.note.findMany({
            where,
            include: {
                course: true,
                subject: true,
                chapter: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Parse tags
        return notes.map(note => ({
            ...note,
            tags: note.tags ? JSON.parse(note.tags) : []
        }));
    }

    /**
     * Update note
     */
    async updateNote(noteId, userId, noteData) {
        const note = await prisma.note.findUnique({
            where: { id: noteId }
        });

        if (!note || note.userId !== userId) {
            throw new Error('Note not found or access denied');
        }

        const { title, content, tags } = noteData;

        const updatedNote = await prisma.note.update({
            where: { id: noteId },
            data: {
                title,
                content,
                tags: tags ? JSON.stringify(tags) : undefined
            }
        });

        return {
            ...updatedNote,
            tags: updatedNote.tags ? JSON.parse(updatedNote.tags) : []
        };
    }

    /**
     * Delete note
     */
    async deleteNote(noteId, userId) {
        const note = await prisma.note.findUnique({
            where: { id: noteId }
        });

        if (!note || note.userId !== userId) {
            throw new Error('Note not found or access denied');
        }

        await prisma.note.delete({
            where: { id: noteId }
        });

        return { success: true };
    }

    /**
     * Bookmark important lessons and questions
     */
    async createBookmark(userId, bookmarkData) {
        const { type, itemId, courseId, subjectId, chapterId, notes } = bookmarkData;

        // Check if bookmark already exists
        const existingBookmark = await prisma.bookmark.findFirst({
            where: {
                userId,
                type,
                itemId
            }
        });

        if (existingBookmark) {
            throw new Error('Bookmark already exists');
        }

        const bookmark = await prisma.bookmark.create({
            data: {
                userId,
                type,
                itemId,
                courseId,
                subjectId,
                chapterId,
                notes
            }
        });

        return bookmark;
    }

    /**
     * Get bookmarks for a user
     */
    async getBookmarks(userId, type) {
        const where = { userId };

        if (type) {
            where.type = type;
        }

        const bookmarks = await prisma.bookmark.findMany({
            where,
            include: {
                course: true,
                subject: true,
                chapter: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return bookmarks;
    }

    /**
     * Delete bookmark
     */
    async deleteBookmark(bookmarkId, userId) {
        const bookmark = await prisma.bookmark.findUnique({
            where: { id: bookmarkId }
        });

        if (!bookmark || bookmark.userId !== userId) {
            throw new Error('Bookmark not found or access denied');
        }

        await prisma.bookmark.delete({
            where: { id: bookmarkId }
        });

        return { success: true };
    }

    /**
     * Get bookmarked item details
     */
    async getBookmarkedItemDetails(bookmark) {
        switch (bookmark.type) {
            case 'lesson':
                const lesson = await prisma.lesson.findUnique({
                    where: { id: bookmark.itemId },
                    include: {
                        chapter: {
                            include: {
                                subject: true
                            }
                        }
                    }
                });
                return lesson ? {
                    ...bookmark,
                    item: {
                        title: lesson.title,
                        description: lesson.content?.substring(0, 100) + '...',
                        chapter: lesson.chapter.title,
                        subject: lesson.chapter.subject.name
                    }
                } : bookmark;

            case 'question':
                const question = await prisma.quizQuestion.findUnique({
                    where: { id: bookmark.itemId },
                    include: {
                        chapterQuiz: {
                            include: {
                                chapter: {
                                    include: {
                                        subject: true
                                    }
                                }
                            }
                        },
                        subjectQuiz: {
                            include: {
                                subject: true
                            }
                        }
                    }
                });
                return question ? {
                    ...bookmark,
                    item: {
                        title: question.question.substring(0, 50) + '...',
                        explanation: question.explanation?.substring(0, 100) + '...',
                        subject: question.chapterQuiz?.chapter?.subject?.name ||
                            question.subjectQuiz?.subject?.name ||
                            'Unknown Subject'
                    }
                } : bookmark;

            default:
                return bookmark;
        }
    }
}