import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import AIRecommendations from '@/components/AIRecommendations';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@shared/api';
import { API_CONFIG } from '@shared/config';
import {
  BookOpen,
  Clock,
  Trophy,
  TrendingUp,
  Users,
  Calendar,
  Play,
  Target,
  Award,
  BarChart3,
  MessageCircle,
  Bell,
  Settings,
  LogOut,
  User,
  ChevronRight,
  Star,
  Fire,
  Zap,
  Brain,
  CheckCircle,
  AlertCircle,
  Activity,
  Download,
  Share,
  RefreshCw,
  Plus,
  Eye,
  ArrowRight,
  Sparkles,
  Menu,
  X,
  GraduationCap
} from '@/lib/icons';
import { useAuth } from '@/hooks/use-auth';

export default function LearnerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeClass, setActiveClass] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [recentQuizResults, setRecentQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch learner context (active class and subjects) using new endpoint structure
        const contextResponse = await api.get(API_CONFIG.ENDPOINTS.LEARNER.CONTEXT);

        if (contextResponse.success) {
          setActiveClass(contextResponse.data.activeClass);
          setSubjects(contextResponse.data.subjects || []);
        }

        // Fetch dashboard stats using new endpoint structure
        const dashboardResponse = await api.get(API_CONFIG.ENDPOINTS.LEARNER.DASHBOARD);

        if (dashboardResponse.success) {
          setDashboardData(dashboardResponse.data);
        }

        // Fetch recent quiz results using new endpoint structure
        const quizResponse = await api.get(API_CONFIG.ENDPOINTS.LEARNER.RECENT_QUIZ_RESULTS);

        if (quizResponse.success) {
          setRecentQuizResults(quizResponse.data || []);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // Use fetched data only - no mock data fallback
  const displaySubjects = subjects;
  const displayDashboardData = dashboardData || {
    totalCourses: 0,
    completedCourses: 0,
    totalAssessments: 0,
    averageScore: 0,
    studyTimeThisWeek: 0,
    studyTimeTotal: 0,
    rank: 0,
    totalStudents: 0
  };
  const displayQuizResults = recentQuizResults;

  const handleSubjectClick = (subjectId) => {
    navigate(`/subject/${subjectId}`);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Dashboard...</h2>
          <p className="text-gray-600">Preparing your personalized learning experience</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <Button asChild variant="outline" size="sm" className="border-mindboost-green text-mindboost-green hover:bg-mindboost-light-green rounded-full">
                <Link to="/">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 mb-2">
              Welcome back, {user?.firstName || 'Student'}! 👋
            </h1>
            {activeClass && (
              <div className="flex items-center space-x-3 mb-3 p-4 bg-mindboost-light-green/50 rounded-xl border border-mindboost-green/20">
                <GraduationCap className="h-8 w-8 text-mindboost-green" />
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    Enrolled in: {activeClass.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {activeClass.examType} • {new Date(activeClass.startDate).toLocaleDateString()} - {new Date(activeClass.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
            <p className="text-lg text-gray-600">
              Ready to continue your learning journey?
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-6 mt-4 md:mt-0 p-4 bg-white rounded-2xl shadow-md border border-mindboost-light-green/30">
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-mindboost-green">#{displayDashboardData.rank}</div>
              <div className="text-xs md:text-sm text-gray-500">Your Rank</div>
            </div>
            <div className="w-px h-8 md:h-12 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-mindboost-green">{displayDashboardData.averageScore}%</div>
              <div className="text-xs md:text-sm text-gray-500">Avg Score</div>
            </div>
            <div className="w-px h-8 md:h-12 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-mindboost-green">{displayDashboardData.studyTimeThisWeek}h</div>
              <div className="text-xs md:text-sm text-gray-500">This Week</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="modern-card p-4 md:p-6 animate-fade-in hover-lift bg-gradient-to-br from-white to-mindboost-light-green/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl md:text-3xl font-black text-mindboost-green">{displayDashboardData.totalCourses}</div>
              <div className="text-gray-600 text-xs md:text-sm font-medium">Enrolled Courses</div>
            </div>
            <div className="p-3 bg-mindboost-light-green rounded-xl">
              <BookOpen className="h-6 md:h-8 w-6 md:w-8 text-mindboost-green" />
            </div>
          </div>
        </div>

        <div className="modern-card p-4 md:p-6 animate-fade-in hover-lift bg-gradient-to-br from-white to-yellow-50/30" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl md:text-3xl font-black text-mindboost-green">{displayDashboardData.averageScore}%</div>
              <div className="text-gray-600 text-xs md:text-sm font-medium">Average Score</div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Trophy className="h-6 md:h-8 w-6 md:w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="modern-card p-4 md:p-6 animate-fade-in hover-lift bg-gradient-to-br from-white to-blue-50/30" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl md:text-3xl font-black text-mindboost-green">{displayDashboardData.studyTimeThisWeek}h</div>
              <div className="text-gray-600 text-xs md:text-sm font-medium">This Week</div>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Clock className="h-6 md:h-8 w-6 md:w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="modern-card p-4 md:p-6 animate-fade-in hover-lift bg-gradient-to-br from-white to-purple-50/30" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl md:text-3xl font-black text-mindboost-green">#{displayDashboardData.rank}</div>
              <div className="text-gray-600 text-xs md:text-sm font-medium">Class Rank</div>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Award className="h-6 md:h-8 w-6 md:w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          {/* Current Subjects */}
          <div className="modern-card animate-slide-up bg-white/80 backdrop-blur-sm">
            <div className="border-b border-gray-100 p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center">
                    <BookOpen className="h-5 md:h-6 w-5 md:w-6 mr-3 text-mindboost-green" />
                    {activeClass ? `${activeClass.name} Subjects` : 'Your Subjects'}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {activeClass ? `Complete subjects for your ${activeClass.examType} preparation` : 'Continue your learning journey'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button asChild variant="outline" className="border-mindboost-green text-mindboost-green hover:bg-mindboost-light-green rounded-xl">
                    <Link to="/study-groups">
                      <Users className="h-4 w-4 mr-2" />
                      Study Groups
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-mindboost-green text-mindboost-green hover:bg-mindboost-light-green rounded-xl">
                    <Link to="/forums">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Discussions
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-4 md:p-6">
              {displaySubjects.length > 0 ? (
                <div className="grid gap-4 md:gap-6">
                  {displaySubjects.map((subject, index) => (
                    <div
                      key={subject.id}
                      onClick={() => handleSubjectClick(subject.id)}
                      className="group p-4 md:p-6 bg-gradient-to-r from-white to-mindboost-light-green/30 rounded-2xl border border-gray-200 hover:border-mindboost-green hover:shadow-xl transition-all duration-300 cursor-pointer hover-lift animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300 shadow-lg">
                            {subject.title[0]}
                          </div>
                          <div>
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-mindboost-green transition-colors">
                              {subject.title}
                            </h3>
                            <div className="flex items-center space-x-3 text-sm text-gray-500">
                              <Badge variant="outline" className="bg-mindboost-light-green text-mindboost-green border-mindboost-green rounded-lg">
                                {subject.examType}
                              </Badge>
                              <span>{subject.completedLessons}/{subject.totalLessons} lessons</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl md:text-2xl font-bold text-mindboost-green">{subject.progress}%</div>
                          <div className="text-xs md:text-sm text-gray-500">Complete</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-semibold text-gray-900">{subject.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-mindboost-green to-mindboost-dark-green h-full rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${subject.progress}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs md:text-sm text-gray-500">
                            Last accessed: {new Date(subject.lastAccessed).toLocaleDateString()}
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-mindboost-green group-hover:translate-x-1 transition-all duration-300" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-mindboost-green/20 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No subjects yet</h3>
                  <p className="text-gray-600 mb-4">You haven't enrolled in any subjects yet.</p>
                  <Button asChild className="bg-mindboost-green hover:bg-mindboost-green/90 text-white">
                    <Link to="/courses">
                      <Plus className="h-4 w-4 mr-2" />
                      Browse Courses
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Quiz Results */}
          <div className="modern-card animate-slide-up bg-white/80 backdrop-blur-sm" style={{ animationDelay: '0.2s' }}>
            <div className="border-b border-gray-100 p-4 md:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center">
                  <Target className="h-5 md:h-6 w-5 md:w-6 mr-3 text-mindboost-green" />
                  Recent Quiz Results
                </h2>
                <Button asChild variant="outline" className="border-mindboost-green text-mindboost-green hover:bg-mindboost-light-green rounded-xl">
                  <Link to="/quiz">
                    <Plus className="h-4 w-4 mr-2" />
                    Take Quiz
                  </Link>
                </Button>
              </div>
            </div>
            <div className="p-4 md:p-6">
              {displayQuizResults.length === 0 ? (
                <div className="text-center py-8 animate-fade-in">
                  <div className="w-16 h-16 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-gray-500 mb-4 text-lg">No quiz results yet</p>
                  <Button asChild className="bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white hover:shadow-lg transition-all duration-300 rounded-xl px-6 py-3">
                    <Link to="/quiz">Take Your First Quiz</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayQuizResults.map((result, index) => (
                    <div
                      key={result.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-mindboost-light-green/20 rounded-xl border border-gray-200 hover:border-mindboost-green hover:shadow-lg transition-all duration-300 hover-lift animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                          {Math.round((result.score / result.maxScore) * 100)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">{result.title}</h4>
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <span>{new Date(result.completedAt).toLocaleDateString()}</span>
                            <Badge variant="outline" className="bg-mindboost-light-green text-mindboost-green border-mindboost-green rounded-lg">
                              {result.subject}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-mindboost-green">
                          {result.score}/{result.maxScore}
                        </div>
                        <div className="text-sm text-gray-500">
                          {Math.round((result.score / result.maxScore) * 100)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 md:space-y-8">
          {/* AI Recommendations */}
          <AIRecommendations />

          {/* Quick Actions */}
          <div className="modern-card animate-slide-up bg-white/80 backdrop-blur-sm" style={{ animationDelay: '0.4s' }}>
            <div className="p-4 md:p-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center mb-4">
                <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button asChild className="w-full justify-start bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white hover:shadow-lg transition-all duration-300 rounded-xl">
                  <Link to="/quiz">
                    <Target className="h-4 w-4 mr-3" />
                    Take Practice Quiz
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start border-mindboost-green text-mindboost-green hover:bg-mindboost-light-green rounded-xl">
                  <Link to="/courses">
                    <BookOpen className="h-4 w-4 mr-3" />
                    Browse Courses
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start border-mindboost-green text-mindboost-green hover:bg-mindboost-light-green rounded-xl">
                  <Link to="/study-groups">
                    <Users className="h-4 w-4 mr-3" />
                    Study Groups
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start border-mindboost-green text-mindboost-green hover:bg-mindboost-light-green rounded-xl">
                  <Link to="/forums">
                    <MessageCircle className="h-4 w-4 mr-3" />
                    Discussions
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start border-mindboost-green text-mindboost-green hover:bg-mindboost-light-green rounded-xl">
                  <Link to="/achievements">
                    <Award className="h-4 w-4 mr-3" />
                    Achievements
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Study Streak */}
          <div className="modern-card animate-slide-up text-black overflow-hidden bg-gradient-to-br from-orange-50 to-white" style={{ animationDelay: '0.5s' }}>
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-2xl md:text-3xl font-black text-mindboost-green">12</div>
                  <div className="text-gray-600 text-xs md:text-sm font-medium">Day Streak</div>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Fire className="h-6 md:h-8 w-6 md:w-8 text-orange-500" />
                </div>
              </div>
              <div className="text-xs md:text-sm text-gray-600">
                Keep it up! You're on fire! 🔥
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="modern-card animate-slide-up bg-white/80 backdrop-blur-sm" style={{ animationDelay: '0.6s' }}>
            <div className="p-4 md:p-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center mb-4">
                <BarChart3 className="h-5 w-5 mr-2 text-mindboost-green" />
                Performance Trend
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">This Week</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-green-600 font-semibold">+12%</span>
                  </div>
                </div>
                <div className="h-32 bg-gradient-to-t from-mindboost-light-green to-transparent rounded-lg flex items-end justify-center shadow-inner p-4">
                  <div className="flex items-end space-x-2 w-full h-full">
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-mindboost-green rounded-t-lg" style={{ height: '60%' }}></div>
                      <span className="text-xs text-gray-500 mt-1">Mon</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-mindboost-green rounded-t-lg" style={{ height: '80%' }}></div>
                      <span className="text-xs text-gray-500 mt-1">Tue</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-mindboost-green rounded-t-lg" style={{ height: '40%' }}></div>
                      <span className="text-xs text-gray-500 mt-1">Wed</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-mindboost-green rounded-t-lg" style={{ height: '90%' }}></div>
                      <span className="text-xs text-gray-500 mt-1">Thu</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-mindboost-green rounded-t-lg" style={{ height: '70%' }}></div>
                      <span className="text-xs text-gray-500 mt-1">Fri</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-mindboost-green rounded-t-lg" style={{ height: '85%' }}></div>
                      <span className="text-xs text-gray-500 mt-1">Sat</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-mindboost-green rounded-t-lg" style={{ height: '75%' }}></div>
                      <span className="text-xs text-gray-500 mt-1">Sun</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}