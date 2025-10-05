import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Unified AI Service for Mindboost Platform
 * Consolidates all AI functionality into a single, well-organized service
 */

export class AIService {
  constructor() {
    this.apiKey = process.env.GOOGLE_AI_API_KEY;
    this.modelName = process.env.GOOGLE_AI_MODEL || "models/gemini-pro-latest";
    this.maxRetries = 3;
    this.baseDelay = 1000; // 1 second

    if (!this.apiKey) {
      console.warn("Google AI API key not found. AI features will be disabled.");
      this.model = null;
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = genAI.getGenerativeModel({ model: this.modelName });
      console.log(`✅ AI Service initialized with model: ${this.modelName}`);
    } catch (error) {
      console.error("Failed to initialize Google Generative AI:", error.message);
      this.model = null;
    }
  }

  /**
   * Delay function for exponential backoff
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate text using the AI model with retry logic
   */
  async generateText(prompt) {
    if (!this.model) {
      return {
        success: false,
        error: "AI service not initialized. Check API key configuration."
      };
    }

    let lastError = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return {
          success: true,
          content: text
        };
      } catch (error) {
        lastError = error;
        console.error(`AI Generation Error (Attempt ${attempt}/${this.maxRetries}):`, error.message);

        // If it's not the last attempt, wait before retrying
        if (attempt < this.maxRetries) {
          // Exponential backoff: 1s, 2s, 4s, etc.
          const delayTime = this.baseDelay * Math.pow(2, attempt - 1);
          console.log(`Retrying in ${delayTime}ms...`);
          await this.delay(delayTime);
        }
      }
    }

    // If all retries failed, return the last error
    return {
      success: false,
      error: lastError instanceof Error ? lastError.message : "Unknown AI service error after retries"
    };
  }

  /**
   * Generate adaptive quiz questions based on content and learner profile
   */
  async generateAdaptiveQuizQuestions(content, type = 'chapter', config = {}) {
    const prompt = `
Generate adaptive quiz questions for educational content.

Content Type: ${type}
Content Details:
${JSON.stringify(content, null, 2)}

Learner Configuration:
${JSON.stringify(config, null, 2)}

Generate ${config.questionCount || 5} multiple-choice questions with:
1. Question text
2. 4 options (A, B, C, D)
3. Correct answer
4. Explanation
5. Difficulty level (EASY, MEDIUM, HARD)
6. Topic tag
7. Points value (1-3)

Format as JSON array:
[
  {
    "question": "Question text",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "correctAnswer": "A) Option 1",
    "explanation": "Explanation of correct answer",
    "difficulty": "MEDIUM",
    "topic": "Topic name",
    "points": 1
  }
]

Requirements:
- Questions should be in French (for Cameroon context)
- Adapt to learner's level and weak areas
- Focus on key concepts from the content
- Include clear explanations
`;

    return this.generateText(prompt);
  }

  /**
   * Generate study suggestions based on learner performance
   */
  async generateStudySuggestions(weakAreas, userPerformance, learnerProfile) {
    const prompt = `
Analyze student performance and provide personalized study suggestions.

Weak Areas:
${JSON.stringify(weakAreas, null, 2)}

User Performance:
${JSON.stringify(userPerformance, null, 2)}

Learner Profile:
${JSON.stringify(learnerProfile, null, 2)}

Provide comprehensive suggestions in French with:
1. Overall feedback
2. Weakness analysis
3. Adaptive study plan
4. Recommended actions
5. Progress milestones
6. Motivational message
7. Next quiz recommendation

Format as JSON:
{
  "overallFeedback": "Feedback message",
  "weaknessAnalysis": {
    "primaryWeaknesses": ["weakness1", "weakness2"],
    "improvementPotential": "HIGH|MEDIUM|LOW"
  },
  "adaptiveStudyPlan": [
    {
      "topic": "Topic name",
      "suggestion": "Study suggestion",
      "priority": "HIGH|MEDIUM|LOW",
      "estimatedTime": "minutes"
    }
  ],
  "recommendedActions": [
    {
      "action": "Action description",
      "timeline": "When to do it"
    }
  ],
  "progressMilestones": [
    {
      "milestone": "Achievement goal",
      "timeframe": "Expected timeframe"
    }
  ],
  "motivationalMessage": "Encouraging message",
  "nextQuizRecommendation": {
    "suggestedDifficulty": "EASY|MEDIUM|HARD",
    "focusAreas": ["area1", "area2"]
  }
}
`;

    return this.generateText(prompt);
  }

  /**
   * Generate personalized learning path
   */
  async generateLearningPath(userProfile, goals, availableHours) {
    const prompt = `
Create a personalized learning path for a student.

User Profile:
${JSON.stringify(userProfile, null, 2)}

Learning Goals:
${JSON.stringify(goals, null, 2)}

Available Study Hours per Day: ${availableHours}

Generate a structured study plan with:
1. Total duration
2. Daily time allocation
3. Phases with topics and goals
4. Recommendations
5. Milestones

Format as JSON:
{
  "studyPlan": {
    "totalDuration": "X weeks",
    "dailyHours": ${availableHours},
    "phases": [
      {
        "phase": "Phase name",
        "duration": "X weeks",
        "topics": ["topic1", "topic2"],
        "goals": "Phase goals"
      }
    ],
    "recommendations": ["tip1", "tip2"],
    "milestones": ["milestone1", "milestone2"]
  }
}
`;

    return this.generateText(prompt);
  }

  /**
   * Generate performance insights
   */
  async analyzePerformance(assessmentResults, studyTime) {
    const averageScore = assessmentResults.reduce((sum, result) => sum + result.score, 0) / assessmentResults.length;
    const recentTrend = assessmentResults.slice(-5).map((r) => r.score);

    const prompt = `
Analyze student's learning performance and provide insights.

Performance Data:
- Average Score: ${averageScore.toFixed(1)}%
- Recent Scores: ${recentTrend.join(", ")}%
- Total Study Time: ${studyTime} minutes
- Number of Assessments: ${assessmentResults.length}

Provide analysis in JSON format:
{
  "overallPerformance": "excellent|good|average|needs_improvement",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "studyStrategy": "Specific strategy based on performance",
  "motivationalMessage": "Encouraging message for the student",
  "predictedOutcome": "Prediction based on current trajectory"
}
`;

    return this.generateText(prompt);
  }

  /**
   * Generate study reminders
   */
  async generateStudyReminder(userProgress, streakDays) {
    const prompt = `
Generate a personalized study reminder message for a student.

Current Progress:
- Completed Courses: ${userProgress.completedCourses || 0}
- Study Streak: ${streakDays} days
- Recent Activity: ${userProgress.recentActivity || "moderate"}

Create an encouraging, personalized message that:
1. Acknowledges their progress
2. Motivates continued learning
3. Suggests next steps
4. Keeps it brief and positive

Return just the message text.
`;

    return this.generateText(prompt);
  }

  /**
   * Generate lesson content
   */
  async generateLessonContent(topic, level, learningStyle, duration) {
    const prompt = `
Create educational content for a lesson.

Topic: ${topic}
Level: ${level}
Learning Style: ${learningStyle}
Duration: ${duration} minutes

Include:
1. Learning objectives
2. Key concepts with clear explanations
3. Real-world examples
4. Interactive elements for ${learningStyle} learners
5. Practice questions
6. Summary points

Format as structured markdown with clear sections.
Make it engaging and appropriate for the student's level.
`;

    return this.generateText(prompt);
  }

  /**
   * Generate AI chatbot responses
   */
  async generateChatbotResponse(userMessage, context, conversationHistory) {
    const prompt = `
You are an AI learning assistant for Mindboost platform. Respond helpfully and encouragingly.

Student Message: "${userMessage}"

Context:
${JSON.stringify(context, null, 2)}

Previous Conversation:
${conversationHistory.slice(-3).map(msg => `${msg.role}: ${msg.content}`).join("\n")}

Provide a helpful, encouraging response that:
1. Addresses their specific question
2. Offers study tips if relevant
3. Motivates continued learning
4. Keeps it conversational and supportive

Return just the response text.
`;

    return this.generateText(prompt);
  }

  /**
   * Generate personalized recommendations
   */
  async generateRecommendations(userProfile) {
    const prompt = `
Generate personalized learning recommendations for a student on the Mindboost platform.

Student Profile:
${JSON.stringify(userProfile, null, 2)}

Provide recommendations in JSON format with:
1. Personalized study plan
2. Recommended resources
3. Study tips
4. Motivational message

Format as JSON:
{
  "studyPlan": [
    {
      "subject": "Subject name",
      "recommendation": "Study recommendation",
      "priority": "HIGH|MEDIUM|LOW",
      "estimatedTime": "minutes"
    }
  ],
  "resources": [
    {
      "title": "Resource title",
      "type": "QUIZ|LESSON|VIDEO|ARTICLE",
      "description": "Resource description",
      "link": "/path/to/resource"
    }
  ],
  "tips": ["tip1", "tip2", "tip3"],
  "motivationalMessage": "Encouraging message for the student"
}
`;

    return this.generateText(prompt);
  }
}

// Export factory function instead of singleton instance
export function createAIService() {
  return new AIService();
}