import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { CollaborativeLearningController } from '../controllers/collaborativeLearning/CollaborativeLearningController.js';

const router = express.Router();
const collaborativeLearningController = new CollaborativeLearningController();

// Study group routes
router.post('/study-groups', authenticate, collaborativeLearningController.createStudyGroup);
router.post('/study-groups/join', authenticate, collaborativeLearningController.joinStudyGroup);
router.post('/study-groups/leave', authenticate, collaborativeLearningController.leaveStudyGroup);
router.get('/study-groups/:groupId', authenticate, collaborativeLearningController.getStudyGroupDetails);

// Peer tutoring routes
router.post('/tutoring-sessions', authenticate, collaborativeLearningController.createPeerTutoringSession);
router.post('/tutoring-sessions/join', authenticate, collaborativeLearningController.joinPeerTutoringSession);

// Knowledge sharing routes
router.post('/knowledge-posts', authenticate, collaborativeLearningController.createKnowledgePost);
router.get('/knowledge-posts', authenticate, collaborativeLearningController.getKnowledgePosts);
router.post('/knowledge-posts/:postId/comments', authenticate, collaborativeLearningController.addCommentToPost);
router.post('/knowledge-posts/:postId/like', authenticate, collaborativeLearningController.likeKnowledgePost);

// Group project routes
router.post('/projects', authenticate, collaborativeLearningController.createGroupProject);
router.post('/projects/join', authenticate, collaborativeLearningController.joinGroupProject);

export default router;