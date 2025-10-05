import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@shared/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PrepClassAdminSidebar from "@/components/PrepClassAdminSidebar";
import {
  Plus,
  BookOpen,
  Users,
  UserCheck,
  GraduationCap,
  Home,
  Settings,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2
} from "@/lib/icons";
import { useAuth } from "@/hooks/use-auth";

export default function PrepClassAdminDashboard() {
  const { user } = useAuth();
  const [prepClasses, setPrepClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Form states for creating classes
  const [newClassForm, setNewClassForm] = useState({
    name: '',
    description: '',
    examType: '',
    startDate: '',
    endDate: '',
    price: '',
    maxStudents: ''
  });

  // Form states for adding subjects
  const [newSubjectForm, setNewSubjectForm] = useState({
    name: '',
    description: '',
    order: ''
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [classesRes, enrollmentsRes, instructorsRes] = await Promise.all([
          api.get("/api/admin/prep-classes"),
          api.get("/api/admin/pending-enrollments"),
          api.get("/api/admin/instructors")
        ]);

        if (classesRes.success) setPrepClasses(classesRes.data || []);
        if (enrollmentsRes.success) setPendingEnrollments(enrollmentsRes.data || []);
        if (instructorsRes.success) setInstructors(instructorsRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Create new preparatory class
  const handleCreateClass = async () => {
    try {
      const res = await api.post("/api/admin/prep-classes", newClassForm);
      if (res.success) {
        setPrepClasses([...prepClasses, res.data]);
        setNewClassForm({
          name: '', description: '', examType: '', startDate: '', endDate: '', price: '', maxStudents: ''
        });
        alert('Class created successfully!');
      }
    } catch (error) {
      console.error('Error creating class:', error);
      alert('Failed to create class');
    }
  };

  // Add subject to class
  const handleAddSubject = async (classId) => {
    try {
      const res = await api.post(`/api/admin/prep-classes/${classId}/subjects`, newSubjectForm);
      if (res.success) {
        // Update the class with new subject
        setPrepClasses(prepClasses.map(cls =>
          cls.id === classId
            ? { ...cls, subjects: [...(cls.subjects || []), res.data] }
            : cls
        ));
        setNewSubjectForm({ name: '', description: '', order: '' });
        alert('Subject added successfully!');
      }
    } catch (error) {
      console.error('Error adding subject:', error);
      alert('Failed to add subject');
    }
  };

  // Assign teacher to subject
  const handleAssignTeacher = async (subjectId, teacherId) => {
    try {
      const res = await api.post(`/api/admin/subjects/${subjectId}/assign-teacher`, { teacherId });
      if (res.success) {
        alert('Teacher assigned successfully!');
        // Refresh data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error assigning teacher:', error);
      alert('Failed to assign teacher');
    }
  };

  // Validate enrollment
  const handleValidateEnrollment = async (enrollmentId, status) => {
    try {
      const res = await api.patch(`/api/admin/enrollments/${enrollmentId}/validate`, { status });
      if (res.success) {
        setPendingEnrollments(pendingEnrollments.filter(e => e.id !== enrollmentId));
        alert(`Enrollment ${status.toLowerCase()} successfully!`);
      }
    } catch (error) {
      console.error('Error validating enrollment:', error);
      alert('Failed to validate enrollment');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-white to-mindboost-light-green">
        <PrepClassAdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Dashboard...</h2>
            <p className="text-gray-600">Setting up your admin tools</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-white to-mindboost-light-green">
      <PrepClassAdminSidebar />
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-gradient-to-br from-mindboost-green to-mindboost-light-green py-8 px-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 right-10 w-24 h-24 bg-white rounded-full blur-2xl"></div>
            <div className="absolute bottom-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="relative">
            <div className="flex items-center space-x-3 mb-3">
              <Button asChild variant="outline" size="sm" className="border-white text-white hover:bg-white/10">
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
              Preparatory Class Admin Dashboard
            </h1>
            <p className="text-white/90 max-w-3xl">
              Create and manage preparatory classes, assign subjects and teachers, validate enrollments
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="classes">Classes</TabsTrigger>
              <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
              <TabsTrigger value="teachers">Teachers</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Classes</p>
                        <p className="text-2xl font-bold text-mindboost-green">{prepClasses.length}</p>
                      </div>
                      <GraduationCap className="h-8 w-8 text-mindboost-green" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Pending Enrollments</p>
                        <p className="text-2xl font-bold text-blue-600">{pendingEnrollments.length}</p>
                      </div>
                      <UserCheck className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Students</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {prepClasses.reduce((total, cls) => total + (cls._count?.enrollments || 0), 0)}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Available Teachers</p>
                        <p className="text-2xl font-bold text-green-600">{instructors.length}</p>
                      </div>
                      <BookOpen className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Plus className="h-5 w-5 mr-2" />
                      Create New Class
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">Set up a new preparatory class with subjects and schedule</p>
                    <Button
                      onClick={() => setActiveTab('classes')}
                      className="w-full bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white"
                    >
                      Create Class
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <UserCheck className="h-5 w-5 mr-2" />
                      Review Enrollments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">Validate pending student enrollment requests</p>
                    <Button
                      onClick={() => setActiveTab('enrollments')}
                      variant="outline"
                      className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                    >
                      Review ({pendingEnrollments.length})
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Classes Tab */}
            <TabsContent value="classes">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Manage Classes</h2>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Class
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create New Preparatory Class</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Class Name</Label>
                          <Input
                            id="name"
                            value={newClassForm.name}
                            onChange={(e) => setNewClassForm({ ...newClassForm, name: e.target.value })}
                            placeholder="e.g., ENAM 2024"
                          />
                        </div>
                        <div>
                          <Label htmlFor="examType">Exam Type</Label>
                          <Select value={newClassForm.examType} onValueChange={(value) => setNewClassForm({ ...newClassForm, examType: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select exam type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ENAM">ENAM</SelectItem>
                              <SelectItem value="ENS">ENS</SelectItem>
                              <SelectItem value="POLICE">Police Nationale</SelectItem>
                              <SelectItem value="CUSTOMS">Customs</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="startDate">Start Date</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={newClassForm.startDate}
                            onChange={(e) => setNewClassForm({ ...newClassForm, startDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="endDate">End Date</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={newClassForm.endDate}
                            onChange={(e) => setNewClassForm({ ...newClassForm, endDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="price">Price (FCFA)</Label>
                          <Input
                            id="price"
                            type="number"
                            value={newClassForm.price}
                            onChange={(e) => setNewClassForm({ ...newClassForm, price: e.target.value })}
                            placeholder="30000"
                          />
                        </div>
                        <div>
                          <Label htmlFor="maxStudents">Max Students</Label>
                          <Input
                            id="maxStudents"
                            type="number"
                            value={newClassForm.maxStudents}
                            onChange={(e) => setNewClassForm({ ...newClassForm, maxStudents: e.target.value })}
                            placeholder="50"
                          />
                        </div>
                        <Button onClick={handleCreateClass} className="w-full">
                          Create Class
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {prepClasses.map((cls) => (
                    <Card key={cls.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{cls.name}</CardTitle>
                            <Badge variant="outline" className="mt-2">{cls.examType}</Badge>
                          </div>
                          <Badge className={cls.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {cls.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Students</p>
                              <p className="font-semibold">{cls._count?.enrollments || 0}/{cls.maxStudents}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Subjects</p>
                              <p className="font-semibold">{cls.subjects?.length || 0}</p>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedClass(cls)}
                              className="flex-1"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Manage
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Enrollments Tab */}
            <TabsContent value="enrollments">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Pending Enrollments</h2>

                {pendingEnrollments.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-green-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No pending enrollments</h3>
                    <p className="text-gray-600">All enrollment requests have been processed</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingEnrollments.map((enrollment) => (
                      <Card key={enrollment.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green rounded-full flex items-center justify-center text-white font-bold">
                                {enrollment.user.firstName?.[0]}{enrollment.user.lastName?.[0]}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900">
                                  {enrollment.user.firstName} {enrollment.user.lastName}
                                </h4>
                                <p className="text-sm text-gray-600">{enrollment.user.email}</p>
                                <p className="text-sm text-blue-600">{enrollment.class.name}</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleValidateEnrollment(enrollment.id, 'APPROVED')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleValidateEnrollment(enrollment.id, 'REJECTED')}
                                variant="outline"
                                className="border-red-500 text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Teachers Tab */}
            <TabsContent value="teachers">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Teacher Management</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {instructors.map((instructor) => (
                    <Card key={instructor.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {instructor.firstName?.[0]}{instructor.lastName?.[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">
                              {instructor.firstName} {instructor.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">{instructor.email}</p>
                            <Badge variant="outline" className="mt-1">Teacher</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}