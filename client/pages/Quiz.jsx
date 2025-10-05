import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { api } from '@shared/api';
import {
  BookOpen,
  Clock,
  Target,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Brain,
  Award,
  TrendingUp,
  Eye,
  RotateCcw,
  Play,
  Pause,
} from '@/lib/icons';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Quiz() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizState, setQuizState] = useState('loading'); // loading, intro, active, review, results
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState(null);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  // Fetch quiz data
  useEffect(() => {
    async function fetchQuiz() {
      if (!id) {
        setError('Quiz ID is required');
        return;
      }

      try {
        // Try to fetch chapter quiz first
        const response = await api.get(`/api/quizzes/chapter/${id}`);
        if (response && response.questions) {
          setQuiz({
            id: response.id,
            title: response.title || 'Chapter Quiz',
            subject: response.chapter?.subject?.name || 'Subject',
            description: response.description || 'Test your knowledge',
            duration: response.timeLimit || 30,
            totalQuestions: response.questions.length,
            questions: response.questions.map(q => ({
              id: q.id,
              question: q.question,
              options: q.options ? q.options.map((opt, idx) => ({
                id: String.fromCharCode(97 + idx), // a, b, c, d
                text: opt
              })) : [],
              correctAnswer: q.correctAnswer,
              explanation: q.explanation
            }))
          });
          setTimeLeft(response.timeLimit ? response.timeLimit * 60 : 1800);
          setQuizState('intro');
        } else {
          // If chapter quiz not found, try subject quiz
          const subjectResponse = await api.get(`/api/quizzes/subject/${id}`);
          if (subjectResponse && subjectResponse.questions) {
            setQuiz({
              id: subjectResponse.id,
              title: subjectResponse.title || 'Subject Quiz',
              subject: subjectResponse.subject?.name || 'Subject',
              description: subjectResponse.description || 'Test your knowledge',
              duration: subjectResponse.timeLimit || 30,
              totalQuestions: subjectResponse.questions.length,
              questions: subjectResponse.questions.map(q => ({
                id: q.id,
                question: q.question,
                options: q.options ? q.options.map((opt, idx) => ({
                  id: String.fromCharCode(97 + idx), // a, b, c, d
                  text: opt
                })) : [],
                correctAnswer: q.correctAnswer,
                explanation: q.explanation
              }))
            });
            setTimeLeft(subjectResponse.timeLimit ? subjectResponse.timeLimit * 60 : 1800);
            setQuizState('intro');
          } else {
            setError('Quiz not found');
          }
        }
      } catch (err) {
        console.error('Failed to fetch quiz:', err);
        setError('Failed to load quiz');
      }
    }

    fetchQuiz();
  }, [id]);

  // Timer effect
  useEffect(() => {
    if (quizState === 'active' && timeLeft > 0 && !isTimerPaused) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quizState === 'active') {
      handleSubmitQuiz();
    }
  }, [quizState, timeLeft, isTimerPaused]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleAnswerSelect = (questionId, answerId) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = () => {
    setQuizState('review');
  };

  const handleFinalSubmit = async () => {
    if (!id) {
      // If no ID, just show results (demo mode)
      setQuizState('results');
      return;
    }

    try {
      // Submit answers to backend
      const answers = {};
      Object.keys(selectedAnswers).forEach(questionId => {
        answers[questionId] = selectedAnswers[questionId];
      });

      let response;
      // Try submitting as chapter quiz first
      try {
        response = await api.post(`/api/quizzes/chapter/${id}/submit`, { answers });
      } catch (err) {
        // If that fails, try as subject quiz
        response = await api.post(`/api/quizzes/subject/${id}/submit`, { answers });
      }

      if (response && response.success) {
        // Update quiz with results for display
        setQuiz(prevQuiz => ({
          ...prevQuiz,
          results: response
        }));
        setQuizState('results');
      } else {
        setError('Failed to submit quiz');
        setQuizState('results'); // Still show results page
      }
    } catch (err) {
      console.error('Failed to submit quiz:', err);
      setError('Failed to submit quiz');
      setQuizState('results'); // Still show results page
    }
  };

  const handleRetakeQuiz = () => {
    setSelectedAnswers({});
    setCurrentQuestion(0);
    setTimeLeft(quiz.duration * 60);
    setQuizState('intro');
  };

  const calculateScore = () => {
    if (!quiz || !quiz.questions) return 0;

    let correct = 0;
    quiz.questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / quiz.questions.length) * 100);
  };

  // Loading state
  if (quizState === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Quiz...</h2>
          <p className="text-gray-600">Preparing your assessment</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    console.error('Quiz error:', error);
  }

  // Intro Screen
  if (quizState === 'intro') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Hero Section */}
        <section className="bg-mindboost-green py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 right-10 w-24 h-24 bg-white rounded-full blur-2xl"></div>
            <div className="absolute bottom-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-black text-black mb-4">
                {quiz.title}
              </h1>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                {quiz.description}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 -mt-12 relative z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="border-0 shadow-xl bg-white rounded-2xl">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-center w-16 h-16 bg-mindboost-green/10 rounded-full mx-auto mb-6">
                  <Target className="h-8 w-8 text-mindboost-green" />
                </div>
                <CardTitle className="text-2xl font-bold text-center text-black">Quiz Overview</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-6 bg-gray-100 rounded-xl">
                    <div className="w-12 h-12 bg-mindboost-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-6 w-6 text-mindboost-green" />
                    </div>
                    <div className="text-3xl font-bold text-black">{quiz.totalQuestions}</div>
                    <div className="text-gray-700">Questions</div>
                  </div>

                  <div className="text-center p-6 bg-gray-100 rounded-xl">
                    <div className="w-12 h-12 bg-mindboost-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-6 w-6 text-mindboost-blue" />
                    </div>
                    <div className="text-3xl font-bold text-black">{quiz.duration}</div>
                    <div className="text-gray-700">Minutes</div>
                  </div>

                  <div className="text-center p-6 bg-gray-100 rounded-xl">
                    <div className="w-12 h-12 bg-mindboost-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Brain className="h-6 w-6 text-mindboost-dark-green" />
                    </div>
                    <div className="text-3xl font-bold text-black">{quiz.subject}</div>
                    <div className="text-gray-700">Subject</div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-red-800">Notice</h3>
                        <p className="text-red-700 mt-2">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-100 border border-mindboost-green/20 rounded-xl p-6 mb-8">
                  <h3 className="font-semibold text-black mb-4 flex items-center">
                    <AlertCircle className="h-5 w-5 text-mindboost-green mr-2" />
                    Important Instructions
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-mindboost-green rounded-full mt-2 mr-3"></div>
                      <span className="text-black">This quiz contains {quiz.totalQuestions} multiple choice questions</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-mindboost-green rounded-full mt-2 mr-3"></div>
                      <span className="text-black">You have {quiz.duration} minutes to complete the quiz</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-mindboost-green rounded-full mt-2 mr-3"></div>
                      <span className="text-black">You cannot go back to previous questions once submitted</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-mindboost-green rounded-full mt-2 mr-3"></div>
                      <span className="text-black">Make sure to review your answers before submitting</span>
                    </li>
                  </ul>
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={() => setQuizState('active')}
                    className="bg-mindboost-green text-white rounded-full px-6 py-3 font-bold shadow-lg"
                  >
                    <Play className="mr-2 h-4 w-4 inline align-middle" />
                    Start Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  // Active Quiz Screen
  if (quizState === 'active' && quiz) {
    const question = quiz.questions[currentQuestion];

    return (
      <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream">
        <Header />

        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Button asChild variant="ghost" className="mb-6 hover:bg-mindboost-light-green/50 rounded-full">
              <Link to="/dashboard/learner">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>

            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl">
              <CardHeader className="border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">{quiz.title}</CardTitle>
                    <p className="text-gray-600">Question {currentQuestion + 1} of {quiz.questions.length}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsTimerPaused(!isTimerPaused)}
                      className="border-mindboost-green text-mindboost-green hover:bg-mindboost-green/10 rounded-full"
                    >
                      {isTimerPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    </Button>
                    <div className="flex items-center bg-mindboost-light-green/50 px-4 py-2 rounded-full">
                      <Clock className="h-5 w-5 text-mindboost-green mr-2" />
                      <span className="text-xl font-bold text-gray-900">{formatTime(timeLeft)}</span>
                    </div>
                  </div>
                </div>
                <Progress value={((currentQuestion + 1) / quiz.questions.length) * 100} className="mt-4 h-2 rounded-full" />
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-8">
                  <div className="flex items-start mb-6">
                    <div className="w-10 h-10 bg-mindboost-green/10 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="text-mindboost-green font-bold">{currentQuestion + 1}</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">{question.question}</h2>
                  </div>

                  <RadioGroup
                    value={selectedAnswers[question.id] || ''}
                    onValueChange={(value) => handleAnswerSelect(question.id, value)}
                    className="space-y-4"
                  >
                    {question.options.map((option) => (
                      <div
                        key={option.id}
                        className={`flex items-center space-x-4 p-4 border rounded-xl transition-all ${selectedAnswers[question.id] === option.id
                          ? 'border-mindboost-green bg-mindboost-green/10'
                          : 'border-gray-200 hover:border-mindboost-green/50 hover:bg-gray-50'
                          }`}
                      >
                        <RadioGroupItem
                          value={option.id}
                          id={option.id}
                          className="border-2 border-mindboost-green text-mindboost-green"
                        />
                        <Label
                          htmlFor={option.id}
                          className="text-gray-900 cursor-pointer flex-1 text-lg"
                        >
                          {option.text}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="flex justify-between">
                  <Button
                    onClick={handlePrevQuestion}
                    disabled={currentQuestion === 0}
                    variant="outline"
                    className="border-mindboost-green text-mindboost-green hover:bg-mindboost-green/10 rounded-full px-5 py-2.5 text-sm"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2 inline align-middle" />
                    Previous
                  </Button>

                  {currentQuestion === quiz.questions.length - 1 ? (
                    <Button
                      onClick={handleSubmitQuiz}
                      disabled={!selectedAnswers[question.id]}
                      className="bg-mindboost-green hover:bg-mindboost-green/90 text-white rounded-full px-5 py-2.5 text-sm font-bold"
                    >
                      Review Answers
                      <Eye className="ml-2 h-4 w-4 inline align-middle" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextQuestion}
                      disabled={!selectedAnswers[question.id]}
                      className="bg-mindboost-green hover:bg-mindboost-green/90 text-white rounded-full px-5 py-2.5 text-sm font-bold"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2 inline align-middle" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  // Review Screen - FIXED: Hide correct answers and explanations until final submission
  if (quizState === 'review' && quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream">
        <Header />

        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Button asChild variant="ghost" className="mb-6 hover:bg-mindboost-light-green/50 rounded-full">
              <Link to="/dashboard/learner">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>

            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                  <Eye className="h-6 w-6 text-mindboost-green mr-3" />
                  Review Your Answers
                </CardTitle>
                <p className="text-gray-600">Please review your answers before submitting</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6 mb-8">
                  {quiz.questions.map((question, index) => {
                    const userAnswer = selectedAnswers[question.id];

                    return (
                      <div key={question.id} className="border border-gray-200 rounded-xl p-6 hover:border-mindboost-green/30 transition-colors">
                        <div className="flex items-start mb-4">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center mr-4 bg-mindboost-green/10 text-mindboost-green font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">Question {index + 1}</h3>
                            <p className="text-gray-700">{question.question}</p>
                          </div>
                        </div>

                        <div className="ml-12 space-y-4">
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-600 mb-2">Your Answer</p>
                            <p className="font-medium">
                              {userAnswer
                                ? question.options.find(opt => opt.id === userAnswer)?.text
                                : 'Not answered'}
                            </p>
                          </div>

                          <div className="p-4 bg-mindboost-light-blue/50 rounded-lg border border-mindboost-blue/20">
                            <p className="text-sm text-mindboost-blue mb-2">Status</p>
                            <p className="font-medium text-mindboost-blue">Answer saved. Final results will be shown after submission.</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <Button
                    onClick={() => setQuizState('active')}
                    variant="outline"
                    className="border-mindboost-green text-mindboost-green hover:bg-mindboost-green/10 rounded-full px-5 py-2.5 text-sm"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2 inline align-middle" />
                    Back to Quiz
                  </Button>

                  <Button
                    onClick={handleFinalSubmit}
                    className="bg-mindboost-green hover:bg-mindboost-green/90 text-white rounded-full px-5 py-2.5 text-sm font-bold"
                  >
                    Submit Final Answers
                    <Target className="ml-2 h-4 w-4 inline align-middle" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  // Results Screen
  if (quizState === 'results' && quiz) {
    const score = calculateScore();
    const passed = score >= 70;

    return (
      <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream">
        <Header />

        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Button asChild variant="ghost" className="mb-6 hover:bg-mindboost-light-green/50 rounded-full">
              <Link to="/dashboard/learner">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>

            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl">
              <CardHeader className="border-b border-gray-100 text-center">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                  {passed ? (
                    <CheckCircle className="h-12 w-12" />
                  ) : (
                    <XCircle className="h-12 w-12" />
                  )}
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900">
                  {passed ? 'Congratulations!' : 'Quiz Complete'}
                </CardTitle>
                <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
                  {passed
                    ? 'You passed the quiz. Great job!'
                    : 'You did not pass this time. Keep studying and try again.'}
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center mb-10">
                  <div className="inline-block relative">
                    <div className="text-7xl font-black mb-2">
                      <span className={passed ? 'text-mindboost-green' : 'text-red-500'}>{score}%</span>
                      <span className="text-2xl text-gray-500">/100</span>
                    </div>
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-mindboost-green/20 rounded-full flex items-center justify-center">
                      <Award className="h-6 w-6 text-mindboost-green" />
                    </div>
                  </div>
                  <p className="text-gray-600">Your Score</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                    <div className="p-6 bg-mindboost-light-green/50 rounded-xl border border-mindboost-green/20">
                      <div className="w-12 h-12 bg-mindboost-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="h-6 w-6 text-mindboost-green" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{quiz.questions.length}</div>
                      <div className="text-gray-600">Total Questions</div>
                    </div>

                    <div className="p-6 bg-mindboost-light-blue/50 rounded-xl border border-mindboost-blue/20">
                      <div className="w-12 h-12 bg-mindboost-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-6 w-6 text-mindboost-blue" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">
                        {quiz.questions.filter(q => selectedAnswers[q.id] === q.correctAnswer).length}
                      </div>
                      <div className="text-gray-600">Correct Answers</div>
                    </div>

                    <div className="p-6 bg-mindboost-cream/50 rounded-xl border border-mindboost-dark-green/20">
                      <div className="w-12 h-12 bg-mindboost-dark-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="h-6 w-6 text-mindboost-dark-green" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">
                        {Math.round((quiz.questions.filter(q => selectedAnswers[q.id] === q.correctAnswer).length / quiz.questions.length) * 100)}%
                      </div>
                      <div className="text-gray-600">Accuracy</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button
                    onClick={handleRetakeQuiz}
                    className="bg-mindboost-green hover:bg-mindboost-green/90 text-white rounded-full px-5 py-2.5 text-sm font-bold"
                  >
                    <RotateCcw className="h-4 w-4 mr-2 inline align-middle" />
                    Retake Quiz
                  </Button>
                  <Button asChild variant="outline" className="border-mindboost-green text-mindboost-green hover:bg-mindboost-green/10 rounded-full px-5 py-2.5 text-sm">
                    <Link to="/quiz-results">
                      <BookOpen className="h-4 w-4 mr-2 inline align-middle" />
                      View Detailed Results
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-mindboost-green text-mindboost-green hover:bg-mindboost-green/10 rounded-full px-5 py-2.5 text-sm">
                    <Link to="/dashboard/learner">
                      <ChevronLeft className="h-4 w-4 mr-2 inline align-middle" />
                      Dashboard
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  return null;
}