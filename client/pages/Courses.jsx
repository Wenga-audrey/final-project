import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { api } from '@shared/api';
import { API_CONFIG } from '@shared/config';
import {
  BookOpen,
  Search,
  Filter,
  Clock,
  Users,
  Star,
  Play,
  CheckCircle,
  ChevronRight,
  Award,
  Target,
  ArrowLeft,
  Calendar,
  GraduationCap,
  Brain,
  Eye
} from '@/lib/icons';

export default function Courses() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState({});

  // Fetch courses data - Updated to use new endpoint structure
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Use the correct endpoint for preparatory classes
        const response = await api.get(API_CONFIG.ENDPOINTS.PREP_CLASSES.LIST);

        if (response.success) {
          setCourses(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching preparatory classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Updated to use new endpoint structure
  const handleEnroll = async (classId) => {
    try {
      setEnrolling(prev => ({ ...prev, [classId]: true }));

      // Use the correct endpoint for enrolling in preparatory classes
      const response = await api.post(API_CONFIG.ENDPOINTS.PREP_CLASSES.ENROLL(classId));

      if (response.success) {
        // Refresh course data after enrollment
        const response = await api.get(API_CONFIG.ENDPOINTS.PREP_CLASSES.LIST);
        if (response.success) {
          setCourses(response.data || []);
        }
      }
    } catch (error) {
      console.error('Error enrolling in preparatory class:', error);
    } finally {
      setEnrolling(prev => ({ ...prev, [classId]: false }));
    }
  };

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.examType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleContinueCourse = (classId) => {
    // Navigate to the course detail page
    navigate(`/course/${classId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream flex items-center justify-center">
        <div className="text-center card brand-shadow">
          <div className="w-16 h-16 bg-mindboost-green rounded-full flex items-center justify-center mx-auto mb-6 brand-shadow">
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <h2 className="text-3xl font-extrabold text-mindboost-dark-blue mb-2">Loading Courses...</h2>
          <p className="text-mindboost-slate">Preparing your course catalog</p>
        </div>
      </div>
    );
  }

  // If viewing a specific course
  if (id) {
    const course = courses.find(c => c.id === id);
    if (!course) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream flex items-center justify-center">
          <div className="text-center card brand-shadow">
            <BookOpen className="h-16 w-16 text-mindboost-green mx-auto mb-4" />
            <h2 className="text-3xl font-extrabold text-mindboost-dark-blue mb-2">Course Not Found</h2>
            <p className="text-mindboost-slate mb-6">The course you're looking for doesn't exist or has been removed.</p>
            <Button asChild className="brand-btn">
              <Link to="/courses">Browse All Courses</Link>
            </Button>
          </div>
        </div>
      );
    }

    // Calculate progress based on enrollment
    const progress = course.enrollment?.progress || 0;
    const completedLessons = Math.floor((progress / 100) * (course._count?.lessons || 0));

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Button asChild variant="ghost" className="flex items-center">
                <Link to="/courses">
                  <ChevronRight className="h-4 w-4 rotate-180 mr-2" />
                  Back to Courses
                </Link>
              </Button>
              <div className="flex items-center space-x-4">
                <h1 className="text-lg font-semibold text-gray-900">Course Details</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Course Header */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="md:flex">
              <div className="md:w-1/3">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.name}
                    className="w-full h-64 md:h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-64 md:h-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-white" />
                  </div>
                )}
              </div>
              <div className="p-6 md:p-8 md:w-2/3">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <Badge className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {course.examType}
                  </Badge>
                  <Badge variant="outline" className="border-gray-300 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                    Active
                  </Badge>
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-5 w-5 fill-current" />
                    <span className="ml-1 text-gray-900 font-semibold">4.8</span>
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.name}</h1>
                <p className="text-gray-600 mb-8 text-lg">{course.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                    <Users className="h-6 w-6 text-gray-500 mr-3" />
                    <div>
                      <div className="font-semibold text-gray-900">{course._count?.enrollments || 0} students</div>
                      <div className="text-sm text-gray-600">Enrolled</div>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                    <Clock className="h-6 w-6 text-gray-500 mr-3" />
                    <div>
                      <div className="font-semibold text-gray-900">Flexible Duration</div>
                      <div className="text-sm text-gray-600">Self-paced</div>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                    <BookOpen className="h-6 w-6 text-gray-500 mr-3" />
                    <div>
                      <div className="font-semibold text-gray-900">{course.subjects?.length || 0} subjects</div>
                      <div className="text-sm text-gray-600">Comprehensive</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {course.enrollment ? (
                    <Button 
                      onClick={() => handleContinueCourse(course.id)}
                      className="bg-gradient-to-r from-mindboost-green to-mindboost-dark-green hover:from-mindboost-green/90 hover:to-mindboost-dark-green/90 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Continue Learning
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrolling[course.id]}
                      className="bg-gradient-to-r from-mindboost-green to-mindboost-dark-green hover:from-mindboost-green/90 hover:to-mindboost-dark-green/90 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                    >
                      {enrolling[course.id] ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Enrolling...
                        </>
                      ) : (
                        <>
                          <GraduationCap className="h-5 w-5 mr-2" />
                          Enroll Now
                        </>
                      )}
                    </Button>
                  )}
                  
                  <Button 
                    asChild 
                    variant="outline" 
                    className="border-mindboost-green text-mindboost-green hover:bg-mindboost-light-green px-8 py-3 rounded-xl font-bold"
                  >
                    <Link to={`/course/${course.id}/subjects`}>
                      <Eye className="h-5 w-5 mr-2" />
                      View Curriculum
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Course Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">About This Course</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-6">
                    This comprehensive {course.name} course is designed to prepare you for the {course.examType} examination. 
                    Whether you're just starting your preparation or looking to reinforce your knowledge, this course will 
                    provide you with the tools and understanding you need to succeed.
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
                      <div className="text-2xl font-bold text-mindboost-dark-green">{course.subjects?.length || 0}</div>
                      <div className="text-gray-700">Subjects</div>
                    </div>
                    <div className="text-center p-4 bg-mindboost-light-blue/50 rounded-xl border border-mindboost-blue/20">
                      <div className="text-2xl font-bold text-mindboost-blue">{course._count?.chapters || 0}</div>
                      <div className="text-gray-700">Chapters</div>
                    </div>
                    <div className="text-center p-4 bg-mindboost-cream/50 rounded-xl border border-mindboost-dark-green/20">
                      <div className="text-2xl font-bold text-mindboost-dark-green">{course._count?.lessons || 0}</div>
                      <div className="text-gray-700">Lessons</div>
                    </div>
                    <div className="text-center p-4 bg-mindboost-light-green/50 rounded-xl border border-mindboost-green/20">
                      <div className="text-2-xl font-bold text-mindboost-green">{course._count?.quizzes || 0}</div>
                      <div className="text-gray-700">Quizzes</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              {/* Progress Card */}
              {course.enrollment && (
                <Card className="border-0 shadow-lg mb-6">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900">Your Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-700">Overall Progress</span>
                          <span className="font-semibold text-gray-900">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-3 rounded-full" />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{completedLessons} of {course._count?.lessons || 0} lessons completed</span>
                        <span className="text-mindboost-green font-semibold">{course._count?.quizzes || 0} quizzes</span>
                      </div>
                      <Button 
                        onClick={() => handleContinueCourse(course.id)}
                        className="w-full bg-gradient-to-r from-mindboost-green to-mindboost-dark-green hover:from-mindboost-green/90 hover:to-mindboost-dark-green/90 text-white mt-4"
                      >
                        Continue Learning
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Subjects List */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Course Subjects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {course.subjects && course.subjects.length > 0 ? (
                      course.subjects.map((subject) => (
                        <div 
                          key={subject.id} 
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-mindboost-light-green/30 transition-colors cursor-pointer"
                          onClick={() => navigate(`/subject/${subject.id}`)}
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-mindboost-green/10 rounded-lg flex items-center justify-center mr-3">
                              <BookOpen className="h-5 w-5 text-mindboost-green" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                              <p className="text-sm text-gray-600">{subject._count?.chapters || 0} chapters</p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600 text-center py-4">No subjects available yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between h-16 gap-4">
            <h1 className="text-xl font-bold text-gray-900">Courses</h1>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="flex items-center border-gray-300 text-gray-700 hover:bg-gray-50">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-4 rounded-2xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-lg"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{courses.length}</div>
                  <div className="text-blue-100">Total Courses</div>
                </div>
                <BookOpen className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {courses.filter(c => c.enrollment).length}
                  </div>
                  <div className="text-green-100">Enrolled</div>
                </div>
                <Target className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-violet-500 text-white rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {Math.round(courses.reduce((sum, course) => {
                      return sum + (course.enrollment?.progress || 0);
                    }, 0) / (courses.length || 1))}%
                  </div>
                  <div className="text-purple-100">Avg Progress</div>
                </div>
                <Award className="h-10 w-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {courses.filter(c => c.examType === 'ENAM').length}
                  </div>
                  <div className="text-orange-100">ENAM Prep</div>
                </div>
                <GraduationCap className="h-10 w-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => {
            // Calculate progress based on enrollment
            const progress = course.enrollment?.progress || 0;

            return (
              <Card key={course.id} className="border-0 shadow-lg bg-white rounded-2xl hover:shadow-xl transition-shadow overflow-hidden">
                <div className="relative">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-white" />
                    </div>
                  )}
                  <Badge className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                    {course.examType}
                  </Badge>
                  <Badge className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Active
                  </Badge>
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2">{course.name}</CardTitle>
                  <div className="flex items-center text-sm text-gray-600 mt-2">
                    <span>by MindBoost</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6 text-sm line-clamp-3">{course.description}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{course._count?.enrollments || 0} students</span>
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      <span>{course.subjects?.length || 0} subjects</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700">Progress</span>
                      <span className="text-sm font-semibold text-gray-900">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2 rounded-full" />
                  </div>

                  <div className="flex gap-3">
                    {course.enrollment ? (
                      <Button
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 font-semibold rounded-xl"
                        onClick={() => handleContinueCourse(course.id)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {progress > 0 ? 'Continue' : 'Start'}
                      </Button>
                    ) : (
                      <Button
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 font-semibold rounded-xl"
                        onClick={() => handleEnroll(course.id)}
                        disabled={enrolling[course.id]}
                      >
                        {enrolling[course.id] ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                            Enrolling...
                          </>
                        ) : (
                          'Enroll Now'
                        )}
                      </Button>
                    )}
                    <Button asChild variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl">
                      <Link to={`/course/${course.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
            <Button
              onClick={() => setSearchTerm('')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 font-semibold rounded-xl"
            >
              View All Courses
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}