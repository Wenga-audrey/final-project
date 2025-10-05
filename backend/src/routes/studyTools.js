import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { StudyToolsController } from '../controllers/studyTools/StudyToolsController.js';

const router = express.Router();
const studyToolsController = new StudyToolsController();

// Flashcards routes
router.post('/flashcards', authenticate, studyToolsController.createFlashcards);
router.get('/flashcards/review', authenticate, studyToolsController.getFlashcardsForReview);
router.post('/flashcards/review', authenticate, studyToolsController.updateFlashcardAfterReview);

// Mind maps routes
router.post('/mindmaps', authenticate, studyToolsController.createMindMap);
router.get('/mindmaps', authenticate, studyToolsController.getMindMaps);

// Notes routes
router.post('/notes', authenticate, studyToolsController.createNote);
router.get('/notes', authenticate, studyToolsController.getNotes);
router.put('/notes/:noteId', authenticate, studyToolsController.updateNote);
router.delete('/notes/:noteId', authenticate, studyToolsController.deleteNote);

// Bookmarks routes
router.post('/bookmarks', authenticate, studyToolsController.createBookmark);
router.get('/bookmarks', authenticate, studyToolsController.getBookmarks);
router.delete('/bookmarks/:bookmarkId', authenticate, studyToolsController.deleteBookmark);

export default router;