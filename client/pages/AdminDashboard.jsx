import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Users,
  BookOpen,
  CreditCard,
  BarChart3,
  Plus,
  Eye,
  Settings,
  Search,
  Filter,
  Calendar,
  Clock,
  Target,
  Award,
  TrendingUp,
  Zap,
  Brain,
  CheckCircle,
  XCircle,
  AlertCircle,
} from '@/lib/icons';
import { Link, useNavigate } from 'react-router-dom';
import { api } from "@shared/api";


// User interface converted to JSDoc comment
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} role
 * @property {string} status
 */

// Class interface converted to JSDoc comment
/**
 * @typedef {Object} Class
 * @property {string} id
 * @property {string} name
 * @property {number} studentCount
 * @property {string} status
 */

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch users and classes from API
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch dashboard data from the admin API
        const [usersRes, classesRes] = await Promise.all([
          api.get("/api/admin/users"),
          api.get("/api/admin/prep-classes")
        ]);

        if (usersRes.success) {
          setUsers(usersRes.users || []);
        }

        if (classesRes.success) {
          setClasses(classesRes.prepClasses || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewUser = (userId) => {
    navigate(`/admin/user/${userId}`);
  };

  const handleViewClass = (classId) => {
    navigate(`/admin/class/${classId}`);
  };

  const filteredUsers = users.filter(user =>
    (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredClasses = classes.filter(cls =>
    (cls.name && cls.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cls.examType && cls.examType.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Loading Admin Dashboard...
          </h2>
          <p className="text-gray-600">
            Preparing your admin tools
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream">

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-mindboost-green to-mindboost-dark-green py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 right-10 w-24 h-24 bg-white rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              Preparatory Class Admin Dashboard
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Manage all preparatory classes, users, and payments across the platform
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild className="bg-white text-mindboost-green hover:bg-gray-100 px-6 py-3 rounded-full font-bold">
                <Link to="/admin/create-user">
                  <Plus className="mr-2 h-5 w-5" />
                  Add New User
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white text-white hover:bg-white/10 px-6 py-3 rounded-full font-bold">
                <Link to="/admin/create-class">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Create New Class
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white -mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-mindboost-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-mindboost-green" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{users.length}</div>
                <div className="text-gray-600">Total Users</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-mindboost-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-mindboost-green" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{classes.filter(c => c.isActive).length}</div>
                <div className="text-gray-600">Active Classes</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-mindboost-dark-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-6 w-6 text-mindboost-dark-green" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {classes.reduce((total, cls) => total + (cls._count?.enrollments || 0), 0)}
                </div>
                <div className="text-gray-600">Total Students</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-mindboost-light-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-mindboost-light-green" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(classes.reduce((avg, cls) => avg + (cls.averageProgress || 0), 0) / (classes.length || 1))}%
                </div>
                <div className="text-gray-600">Avg. Progress</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="overview" className="w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <TabsList className="grid w-full md:w-1/2 grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="classes">Classes</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <div className="relative w-full md:w-1/3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green focus:border-mindboost-green"
                />
              </div>
            </div>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Users */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 text-mindboost-green mr-2" />
                      Recent Users
                    </CardTitle>
                    <CardDescription>Newly registered users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredUsers.slice(0, 5).map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{user.firstName} {user.lastName}</h3>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={user.isActive ? 'default' : 'secondary'}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewUser(user.id)}
                              className="border-mindboost-green text-mindboost-green hover:bg-mindboost-green/10"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button asChild className="w-full mt-4 bg-mindboost-green hover:bg-mindboost-green/90 text-white">
                      <Link to="/admin/users">
                        <Plus className="mr-2 h-4 w-4" />
                        View All Users
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Active Classes */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="h-5 w-5 text-mindboost-green mr-2" />
                      Active Classes
                    </CardTitle>
                    <CardDescription>Currently running preparatory classes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredClasses.filter(c => c.isActive).slice(0, 5).map((cls) => (
                        <div key={cls.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div>
                            <h3 className="font-semibold text-gray-900">{cls.name}</h3>
                            <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                              <span>{cls._count?.enrollments || 0} students</span>
                              <Badge variant="secondary">{cls.examType}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="default" className="bg-mindboost-green">
                              {cls.averageProgress || 0}%
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewClass(cls.id)}
                              className="border-mindboost-green text-mindboost-green hover:bg-mindboost-green/10"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button asChild className="w-full mt-4 bg-mindboost-green hover:bg-mindboost-green/90 text-white">
                      <Link to="/admin/classes">
                        <Plus className="mr-2 h-4 w-4" />
                        View All Classes
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 text-mindboost-green mr-2" />
                    All Users
                  </CardTitle>
                  <CardDescription>Manage platform users</CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                      <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
                      <Button
                        onClick={() => setSearchTerm("")}
                        className="bg-mindboost-green hover:bg-mindboost-green/90 text-white"
                      >
                        Clear Search
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredUsers.map((user) => (
                        <Card key={user.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-center space-x-4 mb-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green rounded-full flex items-center justify-center text-white font-bold">
                                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900">{user.firstName} {user.lastName}</h3>
                                <p className="text-sm text-gray-600">{user.email}</p>
                              </div>
                            </div>

                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Role</span>
                                <Badge variant="secondary">{user.role}</Badge>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Status</span>
                                <Badge variant={user.isActive ? 'default' : 'secondary'}>
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Joined</span>
                                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>

                            <Button
                              onClick={() => handleViewUser(user.id)}
                              className="w-full bg-mindboost-green hover:bg-mindboost-green/90 text-white"
                            >
                              <Settings className="mr-2 h-4 w-4" />
                              Manage User
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="classes">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 text-mindboost-green mr-2" />
                    All Classes
                  </CardTitle>
                  <CardDescription>Manage preparatory classes</CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredClasses.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No classes found</h3>
                      <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
                      <Button
                        onClick={() => setSearchTerm("")}
                        className="bg-mindboost-green hover:bg-mindboost-green/90 text-white"
                      >
                        Clear Search
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredClasses.map((cls) => (
                        <div key={cls.id} className="p-6 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-xl font-bold text-gray-900">{cls.name}</h3>
                                <Badge className={cls.isActive ? "bg-mindboost-green text-white" : "bg-gray-500 text-white"}>
                                  {cls.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-2 mb-3">
                                <Badge variant="secondary">{cls.examType}</Badge>
                                <Badge variant="outline">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(cls.startDate).toLocaleDateString()}
                                </Badge>
                                <Badge variant="outline">
                                  <Users className="h-3 w-3 mr-1" />
                                  {cls._count?.enrollments || 0} students
                                </Badge>
                                <Badge variant="outline">
                                  <Target className="h-3 w-3 mr-1" />
                                  {cls.averageProgress || 0}% progress
                                </Badge>
                              </div>
                              <p className="text-gray-600">{cls.description}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button
                                onClick={() => handleViewClass(cls.id)}
                                className="bg-mindboost-green hover:bg-mindboost-green/90 text-white"
                              >
                                <Settings className="mr-2 h-4 w-4" />
                                Manage
                              </Button>
                              <Button
                                variant="outline"
                                className="border-mindboost-green text-mindboost-green hover:bg-mindboost-green/10"
                              >
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Analytics
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 text-mindboost-green mr-2" />
                      User Growth
                    </CardTitle>
                    <CardDescription>New user registrations over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">User growth chart would appear here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="h-5 w-5 text-mindboost-green mr-2" />
                      Class Performance
                    </CardTitle>
                    <CardDescription>Average progress across all classes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Class performance chart would appear here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

    </div>
  );
};

export default AdminDashboard;