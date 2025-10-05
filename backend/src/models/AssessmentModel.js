import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

// JSDoc comments instead of TypeScript interfaces
/**
 * @typedef {Object} CreateAssessmentData
 * @property {string} title
 * @property {string} [description]
 * @property {string} type
 * @property {number} [timeLimit]
 * @property {number} passingScore
 * @property {string} lessonId
 * @property {any[]} questions
 */

/**
 * @typedef {Object} SubmitAssessmentData
 * @property {Record<string, any>} answers
 * @property {number} timeSpent
 */

export class AssessmentModel {
  static async findById(id) {
    return await prisma.assessment.findUnique({
      where: { id },
      include: {
        lesson: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                examType: true,
                level: true,
              },
            },
          },
        },
      },
    });
  }

  static async findByLessonId(lessonId) {
    return await prisma.assessment.findMany({
      where: { lessonId },
      orderBy: { createdAt: "asc" },
    });
  }

  static async create(assessmentData) {
    return await prisma.assessment.create({
      data: {
        title: assessmentData.title,
        description: assessmentData.description,
        type: assessmentData.type,
        timeLimit: assessmentData.timeLimit,
        passingScore: assessmentData.passingScore,
        lessonId: assessmentData.lessonId,
        questions: {
          create: assessmentData.questions.map((q, index) => ({
            question: q.question,
            type: q.type,
            options: JSON.stringify(q.options || []),
            correctAnswer: JSON.stringify(q.correctAnswer),
            explanation: q.explanation,
            order: index + 1,
          })),
        },
      },
      include: {
        lesson: {
          include: {
            course: true,
          },
        },
      },
    });
  }

  static async submit(
    userId,
    assessmentId,
    submissionData,
  ) {
    const assessment = await this.findById(assessmentId);
    if (!assessment) {
      throw new Error("Assessment not found");
    }

    // Check if already submitted
    const existingResult = await prisma.assessmentResult.findFirst({
      where: {
        userId,
        assessmentId,
      },
    });

    if (existingResult) {
      throw new Error("Assessment already submitted");
    }

    // Get questions for scoring
    const questions = await prisma.question.findMany({
      where: { assessmentId },
      orderBy: { order: "asc" },
    });

    let correctAnswers = 0;
    const totalQuestions = questions.length;

    questions.forEach((question, index) => {
      const userAnswer = submissionData.answers[index.toString()];
      const correctAnswer = JSON.parse(question.correctAnswer);

      if (question.type === "multiple_choice") {
        if (userAnswer === correctAnswer) {
          correctAnswers++;
        }
      } else if (question.type === "true_false") {
        if (userAnswer === correctAnswer) {
          correctAnswers++;
        }
      }
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= assessment.passingScore;

    // Save result
    const result = await prisma.assessmentResult.create({
      data: {
        userId,
        assessmentId,
        score,
        totalPoints: totalQuestions,
        timeSpent: submissionData.timeSpent,
        answers: {
          create: Object.entries(submissionData.answers).map(
            ([questionIndex, answer]) => {
              const question = questions[parseInt(questionIndex)];
              const correctAnswer = JSON.parse(question.correctAnswer);
              return {
                questionId: question.id,
                answer: JSON.stringify(answer),
                isCorrect: answer === correctAnswer,
                timeSpent: Math.floor(
                  submissionData.timeSpent / totalQuestions,
                ),
              };
            },
          ),
        },
      },
      include: {
        assessment: {
          include: {
            lesson: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    return {
      result,
      feedback: {
        score,
        passed,
        correctAnswers,
        totalQuestions,
        passingScore: assessment.passingScore,
      },
    };
  }

  static async getUserResults(userId, assessmentId) {
    const where = { userId };
    if (assessmentId) {
      where.assessmentId = assessmentId;
    }

    return await prisma.assessmentResult.findMany({
      where,
      include: {
        assessment: {
          include: {
            lesson: {
              include: {
                course: {
                  select: {
                    id: true,
                    title: true,
                    examType: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  static async getAssessmentAnalytics(assessmentId) {
    const results = await prisma.assessmentResult.findMany({
      where: { assessmentId },
      select: {
        score: true,
        timeSpent: true,
        createdAt: true,
      },
    });

    if (results.length === 0) {
      return {
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        completionRate: 0,
        averageTime: 0,
        totalAttempts: 0,
      };
    }

    const scores = results.map((r) => r.score);
    const times = results.map((r) => r.timeSpent);

    return {
      averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      completionRate: 100, // All are completed if they have results
      averageTime: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
      totalAttempts: results.length,
    };
  }

  /**
   * Generate adaptive assessment based on user performance
   */
  static async generateAdaptiveAssessment(
    userId,
    examType,
    difficulty = "INTERMEDIATE",
  ) {
    // Get user's weak areas from previous assessments
    const userResults = await prisma.assessmentResult.findMany({
      where: { userId },
      include: {
        assessment: true,
        answers: {
          include: {
            question: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5, // Last 5 assessments
    });

    // Analyze weak areas
    const weakAreas = [];
    userResults.forEach((result) => {
      result.answers.forEach((answer) => {
        if (!answer.isCorrect) {
          weakAreas.push({
            question: answer.question.question,
            topic: answer.question.topic || "General",
            userAnswer: JSON.parse(answer.answer),
            correctAnswer: JSON.parse(answer.question.correctAnswer),
            difficulty: answer.question.difficulty || "MEDIUM",
            skillLevel: answer.question.skillLevel || "INTERMEDIATE",
          });
        }
      });
    });

    // Generate questions based on weak areas and difficulty
    const questions = this.getDefaultQuestions(examType, difficulty);

    // If we have weak areas, focus more on those topics
    if (weakAreas.length > 0) {
      // For now, we'll just return default questions
      // In a real implementation, we would generate questions focused on weak areas
    }

    return {
      title: `${examType} Adaptive Assessment`,
      description: `Adaptive assessment for ${examType} at ${difficulty} level`,
      type: "adaptive",
      passingScore: 70,
      timeLimit: questions.length * 2, // 2 minutes per question
      questions,
    };
  }

  static getDefaultQuestions(examType, difficulty) {
    // This would typically call an AI service to generate questions
    // For now, we'll return some sample questions
    return [
      {
        question: "Sample question 1",
        type: "multiple_choice",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: "Option A",
        explanation: "This is a sample explanation",
        difficulty: "EASY",
        points: 1,
        topic: "General",
        skillLevel: "BEGINNER",
      },
      {
        question: "Sample question 2",
        type: "multiple_choice",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: "Option B",
        explanation: "This is a sample explanation",
        difficulty: "MEDIUM",
        points: 2,
        topic: "General",
        skillLevel: "INTERMEDIATE",
      },
    ];
  }
}