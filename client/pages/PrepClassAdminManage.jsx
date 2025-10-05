import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { api } from '@shared/api';
import { API_CONFIG } from '@shared/config';
import DashboardLayout from '@/components/DashboardLayout';
import {
  BookOpen,
  Users,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Save,
  ArrowLeft,
  RefreshCw // Using RefreshCw instead of Loader2
} from '@/lib/icons';

export default function PrepClassAdminManage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('classes');
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newClass, setNewClass] = useState({
    name: '',
    description: '',
    examType: '',
    startDate: '',
    endDate: ''
  });
  const [newSubject, setNewSubject] = useState({
    name: '',
    description: '',
    classId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Use new endpoint structure
      const [classesResponse, teachersResponse, enrollmentsResponse] = await Promise.all([
        api.get(API_CONFIG.ENDPOINTS.PREP_ADMIN.CLASSES),
        api.get('/api/prep-admin/teachers'),
        api.get('/api/prep-admin/enrollments')
      ]);

      if (classesResponse.success) setClasses(classesResponse.data);
      if (teachersResponse.success) setTeachers(teachersResponse.data);
      if (enrollmentsResponse.success) setEnrollments(enrollmentsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async () => {
    if (!newClass.name || !newClass.examType) {
      toast({
        title: 'Required Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      // Use new endpoint structure
      const response = await api.post(API_CONFIG.ENDPOINTS.PREP_ADMIN.CREATE_CLASS, newClass);

      if (response.success) {
        toast({
          title: 'Class Created',
          description: 'Preparatory class has been successfully created'
        });
        setNewClass({
          name: '',
          description: '',
          examType: '',
          startDate: '',
          endDate: ''
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating class:', error);
      toast({
        title: 'Error',
        description: 'Failed to create class',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubject.name || !newSubject.classId) {
      toast({
        title: 'Required Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      // Use the correct endpoint for creating subjects
      const response = await api.post(API_CONFIG.ENDPOINTS.SUBJECTS.CREATE, {
        classId: newSubject.classId,
        name: newSubject.name,
        description: newSubject.description
      });

      if (response.success) {
        toast({
          title: 'Subject Added',
          description: 'Subject has been successfully added to the class'
        });
        setNewSubject({
          name: '',
          description: '',
          classId: ''
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error adding subject:', error);
      toast({
        title: 'Error',
        description: 'Failed to add subject',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAssignTeacher = async (classId, subjectId, teacherId) => {
    try {
      // Use the correct endpoint for assigning teachers to subjects
      const response = await api.post(API_CONFIG.ENDPOINTS.SUBJECTS.ASSIGN_TEACHER(subjectId), {
        teacherId
      });

      if (response.success) {
        toast({
          title: 'Teacher Assigned',
          description: 'Teacher has been successfully assigned to the subject'
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error assigning teacher:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign teacher',
        variant: 'destructive'
      });
    }
  };

  const handleValidateEnrollment = async (enrollmentId) => {
    try {
      // Use new endpoint structure
      const response = await api.post(API_CONFIG.ENDPOINTS.PREP_ADMIN.VALIDATE_ENROLLMENT(enrollmentId));

      if (response.success) {
        toast({
          title: 'Enrollment Validated',
          description: 'Student enrollment has been successfully validated'
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error validating enrollment:', error);
      toast({
        title: 'Error',
        description: 'Failed to validate enrollment',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-mindboost-green rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="h-8 w-8 text-white animate-spin" />
            </div>
            <p className="text-gray-600">Loading data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Manage Preparatory Classes</h1>
            <p className="text-gray-600 mt-2">
              Create classes, assign teachers, and validate student enrollments
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('classes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'classes'
                ? 'border-mindboost-green text-mindboost-green'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Classes
            </button>
            <button
              onClick={() => setActiveTab('enrollments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'enrollments'
                ? 'border-mindboost-green text-mindboost-green'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Enrollments
            </button>
          </nav>
        </div>

        {/* Classes Tab */}
        {activeTab === 'classes' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Class Form */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Class</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="className" className="text-sm font-medium text-gray-700">
                      Class Name *
                    </Label>
                    <Input
                      id="className"
                      value={newClass.name}
                      onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                      placeholder="Enter class name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="classDescription" className="text-sm font-medium text-gray-700">
                      Description
                    </Label>
                    <Textarea
                      id="classDescription"
                      value={newClass.description}
                      onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                      placeholder="Enter class description"
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="examType" className="text-sm font-medium text-gray-700">
                      Exam Type *
                    </Label>
                    <Select value={newClass.examType} onValueChange={(value) => setNewClass({ ...newClass, examType: value })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select exam type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ENAM">ENAM</SelectItem>
                        <SelectItem value="ENS">ENS</SelectItem>
                        <SelectItem value="Police">Police Nationale</SelectItem>
                        <SelectItem value="Douanes">Douanes</SelectItem>
                        <SelectItem value="Gendarmerie">Gendarmerie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                        Start Date
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={newClass.startDate}
                        onChange={(e) => setNewClass({ ...newClass, startDate: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                        End Date
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={newClass.endDate}
                        onChange={(e) => setNewClass({ ...newClass, endDate: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleCreateClass}
                    disabled={saving}
                    className="w-full bg-mindboost-green hover:bg-mindboost-green/90 text-white"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Class
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Add Subject Form */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Add Subject to Class</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="classSelect" className="text-sm font-medium text-gray-700">
                      Select Class *
                    </Label>
                    <Select value={newSubject.classId} onValueChange={(value) => setNewSubject({ ...newSubject, classId: value })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subjectName" className="text-sm font-medium text-gray-700">
                      Subject Name *
                    </Label>
                    <Input
                      id="subjectName"
                      value={newSubject.name}
                      onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                      placeholder="Enter subject name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subjectDescription" className="text-sm font-medium text-gray-700">
                      Description
                    </Label>
                    <Textarea
                      id="subjectDescription"
                      value={newSubject.description}
                      onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                      placeholder="Enter subject description"
                      className="mt-1"
                      rows={2}
                    />
                  </div>

                  <Button
                    onClick={handleAddSubject}
                    disabled={saving}
                    variant="outline"
                    className="w-full border-mindboost-green text-mindboost-green hover:bg-mindboost-green/10"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Subject
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Classes List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Existing Classes</CardTitle>
                </CardHeader>
                <CardContent>
                  {classes.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No classes created</h3>
                      <p className="text-gray-500">Get started by creating your first preparatory class.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {classes.map((cls) => (
                        <div key={cls.id} className="border border-gray-200 rounded-xl p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                              <p className="text-gray-600 mt-1">{cls.description}</p>
                              <div className="flex items-center mt-2 text-sm text-gray-500">
                                <span className="bg-mindboost-light-green text-mindboost-green px-2 py-1 rounded-full">
                                  {cls.examType}
                                </span>
                                <span className="mx-2">•</span>
                                <span>{cls._count?.enrollments || 0} students</span>
                                <span className="mx-2">•</span>
                                <span>{cls._count?.subjects || 0} subjects</span>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Subjects */}
                          <div className="mt-6">
                            <h4 className="font-medium text-gray-900 mb-3">Subjects</h4>
                            {cls.subjects && cls.subjects.length > 0 ? (
                              <div className="space-y-3">
                                {cls.subjects.map((subject) => (
                                  <div key={subject.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                      <span className="font-medium text-gray-900">{subject.name}</span>
                                      <p className="text-sm text-gray-600">{subject.description}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Select
                                        value={subject.teacherId || ''}
                                        onValueChange={(value) => handleAssignTeacher(cls.id, subject.id, value)}
                                      >
                                        <SelectTrigger className="w-40">
                                          <SelectValue placeholder="Assign teacher" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {teachers.map((teacher) => (
                                            <SelectItem key={teacher.id} value={teacher.id}>
                                              {teacher.firstName} {teacher.lastName}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <Button variant="ghost" size="sm">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm">No subjects added yet</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Enrollments Tab */}
        {activeTab === 'enrollments' && (
          <Card>
            <CardHeader>
              <CardTitle>Student Enrollments</CardTitle>
            </CardHeader>
            <CardContent>
              {enrollments.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No pending enrollments</h3>
                  <p className="text-gray-500">All student enrollments have been processed.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-mindboost-green rounded-full flex items-center justify-center text-white font-bold">
                          {enrollment.user.firstName[0]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {enrollment.user.firstName} {enrollment.user.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {enrollment.prepClass.name} • {enrollment.user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${enrollment.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : enrollment.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                          {enrollment.status}
                        </span>
                        {enrollment.status === 'PENDING' && (
                          <Button
                            onClick={() => handleValidateEnrollment(enrollment.id)}
                            size="sm"
                            className="bg-mindboost-green hover:bg-mindboost-green/90 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}