import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { api } from '@shared/api';
import { API_CONFIG } from '@shared/config';
import { useAuth } from '@/hooks/use-auth';
import {
  BookOpen,
  Play,
  FileText,
  Users,
  Clock,
  Star,
  ChevronLeft,
  Target,
  Award,
  CheckCircle,
  TrendingUp,
  Calendar,
  Brain,
  Lock,
  Download,
  Eye
} from '@/lib/icons';

export default function SubjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [subject, setSubject] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Icon mapping for achievements
  const iconMap = {
    Target,
    Play,
    FileText,
    Clock,
    Star,
    Award,
    Users,
    Brain
  };

  useEffect(() => {
    fetchSubjectData();
  }, [id]);

  const fetchSubjectData = async () => {
    try {
      setLoading(true);

      // Fetch subject details using new endpoint structure
      const subjectResponse = await api.get(API_CONFIG.ENDPOINTS.SUBJECTS.DETAIL(id));
      if (subjectResponse.success) {
        // Extract lessons and resources from the subject response
        const lessonsData = [];
        const resourcesData = [];
        
        // Process chapters and lessons from the subject data
        if (subjectResponse.data.chapters) {
          subjectResponse.data.chapters.forEach(chapter => {
            // Add lessons from each chapter
            if (chapter.lessons) {
              chapter.lessons.forEach(lesson => {
                lessonsData.push({
                  id: lesson.id,
                  title: lesson.title,
                  duration: lesson.duration || '20 min',
                  type: lesson.type || 'video',
                  completed: lesson.completed || false
                });
              });
            }
            
            // Add quizzes as resources
            if (chapter.quizzes) {
              chapter.quizzes.forEach(quiz => {
                resourcesData.push({
                  id: quiz.id,
                  title: quiz.title,
                  type: 'quiz',
                  description: quiz.description || 'Quiz resource'
                });
              });
            }
          });
        }
        
        // Also check for direct quizzes on the subject
        if (subjectResponse.data.quizzes) {
          subjectResponse.data.quizzes.forEach(quiz => {
            resourcesData.push({
              id: quiz.id,
              title: quiz.title,
              type: 'quiz',
              description: quiz.description || 'Quiz resource'
            });
          });
        }

        setSubject({
          id: subjectResponse.data.id,
          name: subjectResponse.data.name,
          description: subjectResponse.data.description,
          instructor: subjectResponse.data.instructor?.name || 'Instructor',
          level: subjectResponse.data.level || 'Intermediate',
          duration: `${subjectResponse.data.duration || 12} weeks`,
          students: subjectResponse.data.studentCount || 0,
          rating: subjectResponse.data.rating || 4.5,
          progress: subjectResponse.data.progress || 0,
          lessonsCompleted: lessonsData.filter(l => l.completed).length || 0,
          totalLessons: lessonsData.length || 0,
          thumbnail: subjectResponse.data.thumbnail || 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&h=450&fit=crop',
          categories: subjectResponse.data.categories || []
        });
        
        setLessons(lessonsData);
        setResources(resourcesData);
      }
    } catch (err) {
      console.error('Error fetching subject data:', err);
      setError('Failed to load subject data');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Play className="h-5 w-5 text-blue-500" />;
      case 'pdf': return <FileText className="h-5 w-5 text-red-500" />;
      case 'article': return <BookOpen className="h-5 w-5 text-green-500" />;
      case 'quiz': return <Target className="h-5 w-5 text-purple-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeName = (type) => {
    switch (type) {
      case 'video': return 'Video Lesson';
      case 'pdf': return 'PDF Document';
      case 'article': return 'Article';
      case 'quiz': return 'Quiz';
      default: return 'Resource';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Subject...</h2>
          <p className="text-gray-600">Preparing your learning materials</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Subject</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={fetchSubjectData}
            className="bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white hover:from-mindboost-green/90 hover:to-mindboost-dark-green/90"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!subject) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream">
      {/* Header with Back Button */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-mindboost-light-green">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button asChild variant="ghost" className="hover:bg-mindboost-light-green/50 rounded-full">
            <Link to="/courses" className="flex items-center text-mindboost-dark-green">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Link>
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subject Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:w-1/3">
              <img
                src={subject.thumbnail}
                alt={subject.name}
                className="w-full h-64 md:h-full object-cover"
              />
            </div>
            <div className="p-6 md:w-2/3">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge className="bg-mindboost-light-green text-mindboost-dark-green border border-mindboost-green">
                  {subject.level}
                </Badge>
                <div className="flex items-center text-yellow-500">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="ml-1 text-gray-900 font-semibold">{subject.rating}</span>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{subject.name}</h1>
              <p className="text-gray-600 mb-6">{subject.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-mindboost-green mr-2" />
                  <span className="text-gray-700">{subject.students} students</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-mindboost-green mr-2" />
                  <span className="text-gray-700">{subject.duration}</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-mindboost-green mr-2" />
                  <span className="text-gray-700">{subject.totalLessons} lessons</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Progress</span>
                  <span className="font-semibold text-gray-900">{subject.progress}%</span>
                </div>
                <Progress value={subject.progress} className="h-3 rounded-full" />
                <div className="text-sm text-gray-600 mt-1">
                  {subject.lessonsCompleted} of {subject.totalLessons} lessons completed
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button 
                  className="bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white hover:from-mindboost-green/90 hover:to-mindboost-dark-green/90 rounded-full px-6 py-3 font-bold shadow-lg hover:shadow-xl"
                  onClick={() => setActiveTab('lessons')}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Continue Learning
                </Button>
                <Button 
                  variant="outline" 
                  className="border-mindboost-green text-mindboost-dark-green hover:bg-mindboost-green/10 rounded-full px-6 py-3"
                  onClick={() => setActiveTab('resources')}
                >
                  <Award className="h-4 w-4 mr-2" />
                  Resources
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${activeTab === 'overview'
              ? 'border-mindboost-green text-mindboost-dark-green'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('lessons')}
            className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${activeTab === 'lessons'
              ? 'border-mindboost-green text-mindboost-dark-green'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            Lessons
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${activeTab === 'resources'
              ? 'border-mindboost-green text-mindboost-dark-green'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            Resources
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">About This Course</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-6">
                    This comprehensive {subject.name} course is designed to take you from foundational concepts
                    to advanced problem-solving techniques. Whether you're preparing for exams, advancing your
                    career, or simply expanding your knowledge, this course will provide you with the tools
                    and understanding you need.
                  </p>

                  <h3 className="text-lg font-semibold text-gray-900 mb-4">What You'll Learn</h3>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-mindboost-green mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">Master fundamental concepts and techniques</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-mindboost-green mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">Solve complex problems and equations</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-mindboost-green mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">Understand practical applications</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-mindboost-green mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">Apply concepts to real-world scenarios</span>
                    </li>
                  </ul>

                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Structure</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-mindboost-light-green/50 rounded-xl border border-mindboost-green/20">
                      <div className="text-2xl font-bold text-mindboost-dark-green">12</div>
                      <div className="text-gray-700">Modules</div>
                    </div>
                    <div className="text-center p-4 bg-mindboost-light-blue/50 rounded-xl border border-mindboost-blue/20">
                      <div className="text-2xl font-bold text-mindboost-blue">24</div>
                      <div className="text-gray-700">Lessons</div>
                    </div>
                    <div className="text-center p-4 bg-mindboost-cream/50 rounded-xl border border-mindboost-dark-green/20">
                      <div className="text-2xl font-bold text-mindboost-dark-green">8</div>
                      <div className="text-gray-700">Quizzes</div>
                    </div>
                    <div className="text-center p-4 bg-mindboost-light-green/50 rounded-xl border border-mindboost-green/20">
                      <div className="text-2xl font-bold text-mindboost-green">2</div>
                      <div className="text-gray-700">Projects</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-6">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Instructor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                      {subject.instructor.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{subject.instructor}</h3>
                      <p className="text-gray-600">Professor of {subject.name}</p>
                      <div className="flex items-center mt-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-700 ml-1">{subject.rating} Instructor Rating</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4 border-mindboost-green text-mindboost-dark-green hover:bg-mindboost-green/10 rounded-full">
                    View Profile
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {subject.categories.map((category, index) => (
                      <Badge key={index} className="bg-mindboost-light-blue/50 text-mindboost-blue border border-mindboost-blue/20">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'lessons' && (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Course Lessons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lessons.length > 0 ? (
                  lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className={`flex items-center justify-between p-4 border rounded-xl transition-all ${lesson.locked
                        ? 'bg-gray-50 border-gray-200 opacity-70'
                        : 'hover:bg-mindboost-light-green/30 border-mindboost-green/20'
                        }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${lesson.completed
                          ? 'bg-mindboost-green/10 text-mindboost-green'
                          : lesson.locked
                            ? 'bg-gray-200 text-gray-500'
                            : 'bg-mindboost-light-blue/50 text-mindboost-blue'
                          }`}>
                          {lesson.locked ? (
                            <Lock className="h-5 w-5" />
                          ) : lesson.completed ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <span className="font-semibold">{index + 1}</span>
                          )}
                        </div>
                        <div>
                          <h3 className={`font-semibold ${lesson.locked ? 'text-gray-500' : 'text-gray-900'}`}>
                            {lesson.title}
                          </h3>
                          <div className="flex items-center text-sm mt-1">
                            {getTypeIcon(lesson.type)}
                            <span className="text-gray-600 ml-2">{getTypeName(lesson.type)}</span>
                            <span className="mx-2">•</span>
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600 ml-1">{lesson.duration}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        disabled={lesson.locked}
                        className={
                          lesson.completed
                            ? 'bg-mindboost-green/10 text-mindboost-green hover:bg-mindboost-green/20 border border-mindboost-green/30'
                            : lesson.locked
                              ? 'bg-gray-100 text-gray-400 border border-gray-200'
                              : 'bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white hover:from-mindboost-green/90 hover:to-mindboost-dark-green/90'
                        }
                        onClick={() => navigate(`/lesson/${lesson.id}`)}
                      >
                        {lesson.completed ? (
                          <>
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </>
                        ) : lesson.locked ? (
                          <>
                            <Lock className="h-4 w-4 mr-1" />
                            Locked
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            Start
                          </>
                        )}
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No lessons available</h3>
                    <p className="text-gray-600">Lessons will be added soon.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'resources' && (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Course Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resources.length > 0 ? (
                  resources.map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between p-4 border border-mindboost-green/20 rounded-xl hover:bg-mindboost-light-green/30 transition-all">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-mindboost-light-blue/50 rounded-lg flex items-center justify-center mr-4 border border-mindboost-blue/20">
                          {getTypeIcon(resource.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                          <p className="text-gray-600 text-sm mt-1">{resource.description}</p>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <span className="uppercase font-medium">{getTypeName(resource.type)}</span>
                            <span className="mx-2">•</span>
                            <span>{resource.size}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-mindboost-green text-mindboost-dark-green hover:bg-mindboost-green/10"
                        onClick={() => navigate(`/quiz/${resource.id}`)}
                      >
                        <Target className="h-4 w-4 mr-1" />
                        Take Quiz
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No resources available</h3>
                    <p className="text-gray-600">Resources will be added soon.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}