import { BaseController } from "../BaseController.js";
import { StudyToolsService } from "../../services/studyTools/StudyToolsService.js";

const studyToolsService = new StudyToolsService();

export class StudyToolsController extends BaseController {
    /**
     * Create digital flashcards
     */
    createFlashcards = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const flashcardData = req.body;

            const flashcards = await studyToolsService.createFlashcards(userId, flashcardData);

            return this.handleSuccess(res, { flashcards }, 'Flashcards created successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Get flashcards for review
     */
    getFlashcardsForReview = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { limit = 10 } = req.query;

            const flashcards = await studyToolsService.getFlashcardsForReview(userId, parseInt(limit));

            return this.handleSuccess(res, { flashcards }, 'Flashcards for review retrieved successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Update flashcard after review
     */
    updateFlashcardAfterReview = this.asyncHandler(async (req, res) => {
        try {
            const { cardId, quality } = req.body;

            if (!cardId || quality === undefined) {
                return this.handleError(res, 'Card ID and quality are required', 400);
            }

            const updatedCard = await studyToolsService.updateFlashcardAfterReview(cardId, quality);

            return this.handleSuccess(res, { card: updatedCard }, 'Flashcard updated successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Create mind map
     */
    createMindMap = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const mindMapData = req.body;

            const mindMap = await studyToolsService.createMindMap(userId, mindMapData);

            return this.handleSuccess(res, { mindMap }, 'Mind map created successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Get mind maps
     */
    getMindMaps = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { courseId, subjectId, chapterId } = req.query;

            const mindMaps = await studyToolsService.getMindMaps(userId, courseId, subjectId, chapterId);

            return this.handleSuccess(res, { mindMaps }, 'Mind maps retrieved successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Create note
     */
    createNote = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const noteData = req.body;

            const note = await studyToolsService.createNote(userId, noteData);

            return this.handleSuccess(res, { note }, 'Note created successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Get notes
     */
    getNotes = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const filters = req.query;

            const notes = await studyToolsService.getNotes(userId, filters);

            return this.handleSuccess(res, { notes }, 'Notes retrieved successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Update note
     */
    updateNote = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { noteId } = req.params;
            const noteData = req.body;

            const note = await studyToolsService.updateNote(noteId, userId, noteData);

            return this.handleSuccess(res, { note }, 'Note updated successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Delete note
     */
    deleteNote = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { noteId } = req.params;

            await studyToolsService.deleteNote(noteId, userId);

            return this.handleSuccess(res, { success: true }, 'Note deleted successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Create bookmark
     */
    createBookmark = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const bookmarkData = req.body;

            const bookmark = await studyToolsService.createBookmark(userId, bookmarkData);

            return this.handleSuccess(res, { bookmark }, 'Bookmark created successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Get bookmarks
     */
    getBookmarks = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { type } = req.query;

            const bookmarks = await studyToolsService.getBookmarks(userId, type);

            // Get detailed information for each bookmark
            const detailedBookmarks = await Promise.all(
                bookmarks.map(bookmark => studyToolsService.getBookmarkedItemDetails(bookmark))
            );

            return this.handleSuccess(res, { bookmarks: detailedBookmarks }, 'Bookmarks retrieved successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Delete bookmark
     */
    deleteBookmark = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { bookmarkId } = req.params;

            await studyToolsService.deleteBookmark(bookmarkId, userId);

            return this.handleSuccess(res, { success: true }, 'Bookmark deleted successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });
}