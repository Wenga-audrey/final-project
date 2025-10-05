import { BaseController } from "../BaseController.js";
import { CollaborativeLearningService } from "../../services/collaborativeLearning/CollaborativeLearningService.js";

const collaborativeLearningService = new CollaborativeLearningService();

export class CollaborativeLearningController extends BaseController {
    /**
     * Create study group
     */
    createStudyGroup = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const groupData = req.body;

            const studyGroup = await collaborativeLearningService.createStudyGroup(userId, groupData);

            return this.handleSuccess(res, { studyGroup }, 'Study group created successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Join study group
     */
    joinStudyGroup = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { groupId } = req.body;

            if (!groupId) {
                return this.handleError(res, 'Group ID is required', 400);
            }

            const member = await collaborativeLearningService.joinStudyGroup(userId, groupId);

            return this.handleSuccess(res, { member }, 'Joined study group successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Leave study group
     */
    leaveStudyGroup = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { groupId } = req.body;

            if (!groupId) {
                return this.handleError(res, 'Group ID is required', 400);
            }

            await collaborativeLearningService.leaveStudyGroup(userId, groupId);

            return this.handleSuccess(res, { success: true }, 'Left study group successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Create peer tutoring session
     */
    createPeerTutoringSession = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const sessionId = req.body.sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const sessionData = req.body;

            const session = await collaborativeLearningService.createPeerTutoringSession(userId, sessionId, sessionData);

            return this.handleSuccess(res, { session }, 'Peer tutoring session created successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Join peer tutoring session
     */
    joinPeerTutoringSession = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { sessionId } = req.body;

            if (!sessionId) {
                return this.handleError(res, 'Session ID is required', 400);
            }

            const participant = await collaborativeLearningService.joinPeerTutoringSession(userId, sessionId);

            return this.handleSuccess(res, { participant }, 'Joined tutoring session successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Create knowledge sharing post
     */
    createKnowledgePost = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const postData = req.body;

            const post = await collaborativeLearningService.createKnowledgePost(userId, postData);

            return this.handleSuccess(res, { post }, 'Knowledge post created successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Get knowledge posts
     */
    getKnowledgePosts = this.asyncHandler(async (req, res) => {
        try {
            const filters = req.query;

            const posts = await collaborativeLearningService.getKnowledgePosts(filters);

            return this.handleSuccess(res, { posts }, 'Knowledge posts retrieved successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Add comment to knowledge post
     */
    addCommentToPost = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { postId } = req.params;
            const commentData = req.body;

            if (!postId) {
                return this.handleError(res, 'Post ID is required', 400);
            }

            const comment = await collaborativeLearningService.addCommentToPost(userId, postId, commentData);

            return this.handleSuccess(res, { comment }, 'Comment added successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Like knowledge post
     */
    likeKnowledgePost = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { postId } = req.params;

            if (!postId) {
                return this.handleError(res, 'Post ID is required', 400);
            }

            const result = await collaborativeLearningService.likeKnowledgePost(userId, postId);

            return this.handleSuccess(res, result, 'Post like status updated');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Create group project
     */
    createGroupProject = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const projectData = req.body;

            const project = await collaborativeLearningService.createGroupProject(userId, projectData);

            return this.handleSuccess(res, { project }, 'Group project created successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Join group project
     */
    joinGroupProject = this.asyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { projectId } = req.body;

            if (!projectId) {
                return this.handleError(res, 'Project ID is required', 400);
            }

            const member = await collaborativeLearningService.joinGroupProject(userId, projectId);

            return this.handleSuccess(res, { member }, 'Joined group project successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    /**
     * Get study group details
     */
    getStudyGroupDetails = this.asyncHandler(async (req, res) => {
        try {
            const { groupId } = req.params;

            if (!groupId) {
                return this.handleError(res, 'Group ID is required', 400);
            }

            const groupDetails = await collaborativeLearningService.getStudyGroupDetails(groupId);

            return this.handleSuccess(res, { group: groupDetails }, 'Study group details retrieved successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });
}