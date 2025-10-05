import { BaseController } from "../BaseController.js";
import { aiService } from "../../services/aiService.js";

export class AIControllerV2 extends BaseController {
    generateQuiz = this.asyncHandler(async (req, res) => {
        try {
            const { content, type = 'chapter', config } = req.body;

            if (!content) {
                return this.handleError(res, 'Content is required', 400);
            }

            const aiResponse = await aiService.generateAdaptiveQuizQuestions(content, type, config);

            if (!aiResponse.success) {
                // Provide fallback quiz questions
                const fallbackQuiz = [
                    {
                        question: "Quel est le sujet principal de cette leçon ?",
                        options: [
                            "A) Option 1",
                            "B) Option 2",
                            "C) Option 3",
                            "D) Option 4"
                        ],
                        correctAnswer: "A) Option 1",
                        explanation: "Ceci est une question d'exemple générée automatiquement.",
                        difficulty: "MEDIUM",
                        topic: "Sujet général",
                        points: 1
                    }
                ];

                console.warn('AI service failed, using fallback quiz:', aiResponse.error);
                return this.handleSuccess(res, { questions: fallbackQuiz }, 'Quiz généré avec des questions d\'exemple');
            }

            let items = [];
            try {
                items = JSON.parse(aiResponse.content);
            } catch (parseErr) {
                return this.handleError(res, 'Invalid quiz format generated', 500);
            }

            return this.handleSuccess(res, { questions: items }, 'Quiz generated successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    generateStudySuggestions = this.asyncHandler(async (req, res) => {
        try {
            const { weakAreas, userPerformance, learnerProfile } = req.body;

            if (!weakAreas || !userPerformance) {
                return this.handleError(res, 'weakAreas and userPerformance are required', 400);
            }

            const aiResponse = await aiService.generateStudySuggestions(
                weakAreas,
                userPerformance,
                learnerProfile || {
                    userId: req.user.id,
                    currentLevel: 'INTERMEDIATE',
                    weakAreas: [],
                    strongAreas: [],
                    averageScore: 70,
                    recentPerformance: [70],
                    preferredDifficulty: 'MEDIUM'
                }
            );

            // Provide fallback suggestions if AI fails
            const fallbackSuggestions = {
                overallFeedback: "Continuez vos efforts ! Vos progrès sont notés.",
                weaknessAnalysis: {
                    primaryWeaknesses: ["Révision régulière", "Pratique des exercices"],
                    improvementPotential: "MEDIUM"
                },
                adaptiveStudyPlan: [
                    {
                        topic: "Révision des bases",
                        suggestion: "Consacrez 30 minutes par jour à la révision des concepts de base",
                        priority: "HIGH",
                        estimatedTime: "30 minutes"
                    }
                ],
                recommendedActions: [
                    {
                        action: "Faites un quiz quotidien",
                        timeline: "Tous les jours"
                    }
                ],
                progressMilestones: [
                    {
                        milestone: "Compléter 5 quiz supplémentaires",
                        timeframe: "Cette semaine"
                    }
                ],
                motivationalMessage: "Chaque petit pas compte dans votre parcours d'apprentissage !",
                nextQuizRecommendation: {
                    suggestedDifficulty: "MEDIUM",
                    focusAreas: ["Révision générale"]
                }
            };

            if (!aiResponse.success) {
                console.warn('AI service failed, using fallback suggestions:', aiResponse.error);
                return this.handleSuccess(res, { suggestions: fallbackSuggestions }, 'Suggestions générées (mode dégradé)');
            }

            let suggestions = {};
            try {
                suggestions = JSON.parse(aiResponse.content);
            } catch (parseErr) {
                suggestions = fallbackSuggestions;
            }

            return this.handleSuccess(res, { suggestions }, 'Study suggestions generated successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });

    chat = this.asyncHandler(async (req, res) => {
        try {
            const { message, context, conversationHistory } = req.body;

            if (!message) {
                return this.handleError(res, 'Message is required', 400);
            }

            const aiResponse = await aiService.generateChatbotResponse(
                message,
                context || {},
                conversationHistory || []
            );

            // Provide fallback response if AI fails
            const fallbackResponse = "Je suis votre assistant d'apprentissage Mindboost. Je suis actuellement indisponible pour répondre à votre question spécifique, mais je peux vous aider à planifier votre étude ou vous rappeler l'importance de la pratique régulière. Comment puis-je vous aider ?";

            if (!aiResponse.success) {
                console.warn('AI service failed, using fallback response:', aiResponse.error);
                return this.handleSuccess(res, { response: fallbackResponse }, 'Response generated (fallback mode)');
            }

            return this.handleSuccess(res, { response: aiResponse.content }, 'Response generated successfully');
        } catch (error) {
            return this.handleServerError(res, error);
        }
    });
}