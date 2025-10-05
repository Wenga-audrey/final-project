import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Target,
  ChevronLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
  Calendar,
  Clock
} from '@/lib/icons';

export default function QuizResults() {
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // Mock quiz results data
  const quizResults = [
    {
      id: '1',
      title: 'Mathematics Fundamentals Quiz',
      subject: 'Mathematics',
      date: '2024-01-15',
      score: 85,
      timeSpent: 25,
      totalQuestions: 20,
      correctAnswers: 17,
      status: 'passed'
    },
    {
      id: '2',
      title: 'Physics Concepts Test',
      subject: 'Physics',
      date: '2024-01-10',
      score: 72,
      timeSpent: 32,
      totalQuestions: 25,
      correctAnswers: 18,
      status: 'passed'
    },
    {
      id: '3',
      title: 'Chemistry Basics Quiz',
      subject: 'Chemistry',
      date: '2024-01-05',
      score: 68,
      timeSpent: 28,
      totalQuestions: 20,
      correctAnswers: 14,
      status: 'failed'
    },
    {
      id: '4',
      title: 'Literature Analysis Test',
      subject: 'Literature',
      date: '2023-12-20',
      score: 92,
      timeSpent: 45,
      totalQuestions: 30,
      correctAnswers: 28,
      status: 'passed'
    }
  ];

  const detailedResults = {
    '1': {
      quizTitle: 'Mathematics Fundamentals Quiz',
      subject: 'Mathematics',
      date: '2024-01-15',
      score: 85,
      timeSpent: 25,
      totalQuestions: 20,
      correctAnswers: 17,
      questions: [
        {
          id: '1',
          question: 'What is the derivative of f(x) = x²?',
          userAnswer: '2x',
          correctAnswer: '2x',
          explanation: 'The derivative of x² is 2x using the power rule.',
          status: 'correct'
        },
        {
          id: '2',
          question: 'Solve for x: 2x + 5 = 15',
          userAnswer: 'x = 5',
          correctAnswer: 'x = 5',
          explanation: 'Subtract 5 from both sides: 2x = 10, then divide by 2: x = 5.',
          status: 'correct'
        },
        {
          id: '3',
          question: 'What is the area of a circle with radius r?',
          userAnswer: 'πr',
          correctAnswer: 'πr²',
          explanation: 'The area of a circle is given by the formula A = πr².',
          status: 'incorrect'
        }
      ]
    }
  };

  const handleViewDetails = (quizId) => {
    setSelectedQuiz(detailedResults[quizId] || null);
  };

  const handleBackToList = () => {
    setSelectedQuiz(null);
  };

  // Detailed Results View
  if (selectedQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Button asChild variant="ghost" className="mb-6" onClick={handleBackToList}>
            <div>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Results
            </div>
          </Button>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">{selectedQuiz.quizTitle}</CardTitle>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <Badge className="bg-blue-100 text-blue-800">{selectedQuiz.subject}</Badge>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{new Date(selectedQuiz.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{selectedQuiz.timeSpent} min</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{selectedQuiz.score}%</div>
                  <div className="text-gray-700">Score</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{selectedQuiz.correctAnswers}</div>
                  <div className="text-gray-700">Correct</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {selectedQuiz.totalQuestions - selectedQuiz.correctAnswers}
                  </div>
                  <div className="text-gray-700">Incorrect</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">{selectedQuiz.timeSpent}</div>
                  <div className="text-gray-700">Minutes</div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Question Review</h3>
                {selectedQuiz.questions.map((question, index) => (
                  <div key={question.id} className="border rounded-lg p-6">
                    <div className="flex items-start mb-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${question.status === 'correct' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                        {question.status === 'correct' ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Question {index + 1}</h4>
                        <p className="text-gray-700">{question.question}</p>
                      </div>
                    </div>

                    <div className="ml-11 space-y-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Your Answer</p>
                        <p className={`font-medium ${question.status === 'correct' ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {question.userAnswer}
                        </p>
                      </div>

                      {question.status === 'incorrect' && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-700">Correct Answer</p>
                          <p className="font-medium text-green-600">{question.correctAnswer}</p>
                        </div>
                      )}

                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">Explanation</p>
                        <p className="font-medium">{question.explanation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button asChild className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600">
              <Link to="/quiz">
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Quiz
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Results List View
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <Button asChild variant="ghost" className="mr-4">
            <Link to="/dashboard/learner">
              <ChevronLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quiz Results</h1>
            <p className="text-gray-600">Review your performance and track your progress</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{quizResults.length}</div>
                  <div className="text-blue-100">Total Quizzes</div>
                </div>
                <BookOpen className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {quizResults.filter(q => q.status === 'passed').length}
                  </div>
                  <div className="text-green-100">Passed</div>
                </div>
                <CheckCircle className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-violet-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {Math.round(quizResults.reduce((sum, quiz) => sum + quiz.score, 0) / quizResults.length)}%
                  </div>
                  <div className="text-purple-100">Avg Score</div>
                </div>
                <Target className="h-10 w-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Quiz History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {quizResults.map((quiz) => (
                <div key={quiz.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                        <Badge className={`ml-3 ${quiz.status === 'passed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                          {quiz.status === 'passed' ? 'Passed' : 'Failed'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span>{quiz.subject}</span>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{new Date(quiz.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{quiz.timeSpent} min</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 md:mt-0 md:ml-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700">Score</span>
                        <span className={`font-bold ${quiz.score >= 70 ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {quiz.score}%
                        </span>
                      </div>
                      <Progress
                        value={quiz.score}
                        className="h-2 mb-4"
                        indicatorClassName={
                          quiz.score >= 70 ? 'bg-green-500' : 'bg-red-500'
                        }
                      />
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{quiz.correctAnswers}/{quiz.totalQuestions} correct</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(quiz.id)}
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}