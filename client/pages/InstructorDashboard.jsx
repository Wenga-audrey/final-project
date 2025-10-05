import React, { useEffect, useState } from "react";
import { api } from "@shared/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Users,
  BarChart3,
  Calendar,
  Clock,
  Target,
  Award,
  Plus,
  Eye,
  Search,
  Filter,
  TrendingUp,
  Zap,
  Brain,
  Upload,
  FileText,
  Sparkles,
  MessageSquare,
  Home,
} from "@/lib/icons";
import { Link } from "react-router-dom";
import InstructorSidebar from "@/components/InstructorSidebar";
import { useAuth } from "@/hooks/use-auth";

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [prepClasses, setPrepClasses] = useState([]);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [progress, setProgress] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, content, students

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch assigned classes
        const classesRes = await api.get("/api/instructor/prep-classes");
        if (classesRes.success) setPrepClasses(classesRes.data?.prepClasses || []);

        // Fetch assigned subjects (subjects the instructor teaches)
        const subjectsRes = await api.get(`/api/instructor/${user?.id}/subjects`);
        if (subjectsRes.success) setAssignedSubjects(subjectsRes.data?.subjects || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    if (user?.id) fetchData();
  }, [user?.id]);

  async function handleViewProgress(classId) {
    try {
      const res = await api.get(`/api/instructor/prep-classes/${classId}/learner-progress`);
      if (res.success) {
        setProgress(res.data?.learners || []);
        setSelectedClass(classId);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  }

  const filteredClasses = prepClasses.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.examType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProgress = progress.filter(learner =>
    `${learner.user.firstName} ${learner.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    learner.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-white to-mindboost-light-green">
        <InstructorSidebar />
        <div className="flex-1 ml-64">
          <div className="min-h-screen bg-gradient-to-br from-white to-mindboost-light-green flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Dashboard...</h2>
              <p className="text-gray-600">Preparing your instructor tools</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-white to-mindboost-light-green">
      <InstructorSidebar />
      <div className="flex-1 ml-64">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-mindboost-green to-mindboost-light-green py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 right-10 w-24 h-24 bg-white rounded-full blur-2xl"></div>
            <div className="absolute bottom-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-6 md:mb-0">
                <div className="flex items-center space-x-3 mb-3">
                  <Button asChild variant="outline" size="sm" className="border-white text-white hover:bg-white/10">
                    <Link to="/">
                      <Home className="h-4 w-4 mr-2" />
                      Back to Home
                    </Link>
                  </Button>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                  Instructor Dashboard
                </h1>
                <p className="text-xl text-white/90 max-w-3xl mb-8">
                  Manage your assigned subjects, create content with AI assistance, and track student progress
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  onClick={() => setActiveTab('overview')}
                  variant={activeTab === 'overview' ? 'secondary' : 'outline'}
                  className={activeTab === 'overview' ? 'bg-white text-mindboost-green' : 'border-white text-white hover:bg-white/10'}
                >
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Overview
                </Button>
                <Button
                  onClick={() => setActiveTab('content')}
                  variant={activeTab === 'content' ? 'secondary' : 'outline'}
                  className={activeTab === 'content' ? 'bg-white text-mindboost-green' : 'border-white text-white hover:bg-white/10'}
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Content
                </Button>
                <Button
                  onClick={() => setActiveTab('students')}
                  variant={activeTab === 'students' ? 'secondary' : 'outline'}
                  className={activeTab === 'students' ? 'bg-white text-mindboost-green' : 'border-white text-white hover:bg-white/10'}
                >
                  <Users className="mr-2 h-5 w-5" />
                  Students
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-white -mt-12 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="modern-card text-center animate-fade-in hover-lift">
                <div className="p-6">
                  <div className="w-12 h-12 bg-mindboost-light-green rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <BookOpen className="h-6 w-6 text-mindboost-green" />
                  </div>
                  <div className="text-2xl font-bold text-mindboost-green">{prepClasses.length}</div>
                  <div className="text-gray-600">Active Classes</div>
                </div>
              </div>

              <div className="modern-card text-center animate-fade-in hover-lift" style={{ animationDelay: '0.1s' }}>
                <div className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-mindboost-green">
                    {prepClasses.reduce((total, cls) => total + (cls._count?.enrollments || 0), 0)}
                  </div>
                  <div className="text-gray-600">Total Students</div>
                </div>
              </div>

              <div className="modern-card text-center animate-fade-in hover-lift" style={{ animationDelay: '0.2s' }}>
                <div className="p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-mindboost-green">
                    {Math.round(prepClasses.reduce((avg, cls) => avg + (cls.averageProgress || 0), 0) / (prepClasses.length || 1))}%
                  </div>
                  <div className="text-gray-600">Avg. Progress</div>
                </div>
              </div>

              <div className="modern-card text-center animate-fade-in hover-lift" style={{ animationDelay: '0.3s' }}>
                <div className="p-6">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Award className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="text-2xl font-bold text-mindboost-green">
                    {prepClasses.filter(cls => cls.averageProgress >= 80).length}
                  </div>
                  <div className="text-gray-600">High-Performing Classes</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 bg-gradient-to-br from-gray-50 to-mindboost-light-green/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {activeTab === 'overview' && (
              <div>
                {/* Overview Tab */}
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Dashboard Overview</h2>
                  <p className="text-gray-600">Quick stats and recent activity</p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-mindboost-light-green rounded-xl">
                          <Upload className="h-6 w-6 text-mindboost-green" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Upload Content</h3>
                          <p className="text-sm text-gray-600">Add lessons and materials</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setActiveTab('content')}
                        className="w-full mt-4 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white"
                      >
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                          <Sparkles className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">AI Quiz Generator</h3>
                          <p className="text-sm text-gray-600">Create quizzes with AI</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setActiveTab('content')}
                        variant="outline"
                        className="w-full mt-4 border-blue-500 text-blue-600 hover:bg-blue-50"
                      >
                        Generate Quiz
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-purple-100 rounded-xl">
                          <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Student Progress</h3>
                          <p className="text-sm text-gray-600">Monitor learning progress</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setActiveTab('students')}
                        variant="outline"
                        className="w-full mt-4 border-purple-500 text-purple-600 hover:bg-purple-50"
                      >
                        View Students
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Assigned Subjects */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Assigned Subjects</h3>
                  {assignedSubjects.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No subjects assigned yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {assignedSubjects.map((subject, index) => (
                        <Card key={subject.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-bold text-gray-900">{subject.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {subject.class?.examType}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                              {subject.class?.name}
                            </p>
                            <Button
                              onClick={() => {
                                setSelectedSubject(subject.id);
                                setActiveTab('content');
                              }}
                              variant="outline"
                              size="sm"
                              className="w-full border-mindboost-green text-mindboost-green hover:bg-mindboost-light-green"
                            >
                              Manage Content
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div>
                {/* Content Management Tab */}
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Content Management</h2>
                  <p className="text-gray-600">Upload materials and create quizzes for your subjects</p>
                </div>

                {selectedSubject ? (
                  <div>
                    <Button
                      onClick={() => setSelectedSubject(null)}
                      variant="outline"
                      className="mb-6 border-mindboost-green text-mindboost-green"
                    >
                      ← Back to Subjects
                    </Button>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Upload Content */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Upload className="h-5 w-5 mr-2" />
                            Upload Content
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <Button className="w-full bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white">
                              <FileText className="h-4 w-4 mr-2" />
                              Upload PDF Lesson
                            </Button>
                            <Button variant="outline" className="w-full border-mindboost-green text-mindboost-green">
                              <Sparkles className="h-4 w-4 mr-2" />
                              AI Content Suggestions
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Create Quiz */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Target className="h-5 w-5 mr-2" />
                            Create Quiz
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                              <Plus className="h-4 w-4 mr-2" />
                              Manual Quiz Creation
                            </Button>
                            <Button variant="outline" className="w-full border-blue-500 text-blue-600 hover:bg-blue-50">
                              <Sparkles className="h-4 w-4 mr-2" />
                              AI-Generated Quiz
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Select a Subject to Manage</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {assignedSubjects.map((subject) => (
                        <Card
                          key={subject.id}
                          className="cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => setSelectedSubject(subject.id)}
                        >
                          <CardContent className="p-6">
                            <h4 className="font-bold text-gray-900 mb-2">{subject.name}</h4>
                            <p className="text-sm text-gray-600">{subject.class?.name}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'students' && (
              <div>
                {/* Students Tab */}
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Student Management</h2>
                  <p className="text-gray-600">Track progress and communicate with your students</p>
                </div>

                {/* Search */}
                <div className="mb-6">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green focus:border-mindboost-green"
                    />
                  </div>
                </div>

                {/* Classes and Students */}
                {!selectedClass ? (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Your Classes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredClasses.map((cls, index) => (
                        <Card key={cls.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <h4 className="font-bold text-gray-900 mb-2">{cls.name}</h4>
                            <Badge variant="secondary" className="mb-4 bg-mindboost-light-green text-mindboost-green">
                              {cls.examType}
                            </Badge>
                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Students:</span>
                                <span className="font-semibold">{cls._count?.enrollments || 0}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Avg Progress:</span>
                                <span className="font-semibold text-mindboost-green">{cls.averageProgress || 0}%</span>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleViewProgress(cls.id)}
                              className="w-full bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Students
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <Button
                      onClick={() => setSelectedClass(null)}
                      variant="outline"
                      className="mb-6 border-mindboost-green text-mindboost-green"
                    >
                      ← Back to Classes
                    </Button>

                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Students in {prepClasses.find(cls => cls.id === selectedClass)?.name}
                    </h3>

                    {filteredProgress.length === 0 ? (
                      <div className="text-center py-16">
                        <Users className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                        <h4 className="text-xl font-bold text-gray-900 mb-2">No students found</h4>
                        <p className="text-gray-600">No students match your search criteria</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredProgress.map((learner, index) => (
                          <Card key={learner.user.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-4">
                                  <div className="w-12 h-12 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green rounded-full flex items-center justify-center text-white font-bold">
                                    {learner.user.firstName?.[0]}{learner.user.lastName?.[0]}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-gray-900">
                                      {learner.user.firstName} {learner.user.lastName}
                                    </h4>
                                    <p className="text-sm text-gray-600">{learner.user.email}</p>
                                  </div>
                                </div>
                                <Badge className="bg-mindboost-light-green text-mindboost-green">
                                  {learner.progress}%
                                </Badge>
                              </div>

                              <div className="mb-4">
                                <div className="flex justify-between text-sm mb-2">
                                  <span className="text-gray-600">Progress</span>
                                  <span className="font-semibold text-mindboost-green">{learner.progress}%</span>
                                </div>
                                <Progress value={learner.progress} className="h-2" />
                              </div>

                              <div className="flex justify-between text-sm text-gray-600 mb-4">
                                <span>{learner.completedLessons || 0} lessons completed</span>
                                <span>{learner.totalLessons || 0} total lessons</span>
                              </div>

                              <Button
                                asChild
                                variant="outline"
                                className="w-full border-mindboost-green text-mindboost-green hover:bg-mindboost-light-green"
                              >
                                <Link to={`/messages/send?recipient=${learner.user.id}`}>
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Send Message
                                </Link>
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}