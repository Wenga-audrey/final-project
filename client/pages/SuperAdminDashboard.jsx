import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@shared/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Users,
  BookOpen,
  CreditCard,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Search,
  Filter,
  Calendar,
  Clock,
  Target,
  Award,
  TrendingUp,
  Zap,
  Brain,
  Shield,
  Server,
  Database,
  Activity,
  Download,
  Upload,
  Lock,
  Key,
  Settings,
  Home,
  UserPlus,
  Trash2,
  Edit,
} from "@/lib/icons";
import { useAuth } from "@/hooks/use-auth";


export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    userStats: 0,
    paidUsers: 0,
    revenue: 0,
    exams: 0,
    courses: 0,
    successRates: { rate: "0%" }
  });
  const [pendingLessons, setPendingLessons] = useState([]);
  const [pendingSyllabi, setPendingSyllabi] = useState([]);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [backups, setBackups] = useState([]);
  const [securitySettings, setSecuritySettings] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Form states
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: ''
  });

  useEffect(() => {
    async function fetchAllData() {
      try {
        setLoading(true);

        // Fetch dashboard stats
        const statsRes = await api.get("/api/super-admin/dashboard");
        if (statsRes.success) {
          setStats({
            userStats: statsRes.stats.userStats,
            paidUsers: statsRes.stats.paidUsers,
            revenue: statsRes.stats.totalRevenue.toLocaleString(),
            exams: statsRes.stats.exams,
            courses: statsRes.stats.courses,
            successRates: { rate: "98%" }
          });
        }

        // Fetch users
        const usersRes = await api.get("/api/super-admin/users");
        if (usersRes.success) {
          setUsers(usersRes.users || []);
        }

        // Fetch backups
        const backupsRes = await api.get("/api/super-admin/backups");
        if (backupsRes.success) {
          setBackups(backupsRes.backups || []);
        }

        // Fetch security settings
        const securityRes = await api.get("/api/super-admin/security");
        if (securityRes.success) {
          setSecuritySettings(securityRes.settings || {});
        }

        // Fetch audit logs
        const logsRes = await api.get("/api/super-admin/audit-logs");
        if (logsRes.success) {
          setLogs(logsRes.logs || []);
        }
      } catch (error) {
        console.error("Error fetching super admin data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, []);

  async function handleApproveLesson(id) {
    try {
      const res = await api.post(`/api/super-admin/lessons/${id}/approve`);
      if (res.success) {
        setPendingLessons(pendingLessons.filter(l => l.id !== id));
      }
    } catch (error) {
      console.error("Error approving lesson:", error);
    }
  }

  // User management
  const handleCreateUser = async () => {
    try {
      const res = await api.post("/api/super-admin/users", newUserForm);
      if (res.success) {
        setUsers([...users, res.user]);
        setNewUserForm({ name: '', email: '', role: '' });
        alert('User created successfully!');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    }
  };

  const handleSuspendUser = async (userId) => {
    try {
      const res = await api.patch(`/api/super-admin/users/${userId}/suspend`);
      if (res.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, suspended: true } : u));
        alert('User suspended successfully!');
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('Failed to suspend user');
    }
  };

  // Backup management
  const handleCreateBackup = async () => {
    try {
      const res = await api.post("/api/super-admin/backups");
      if (res.success) {
        setBackups([res.backup, ...backups]);
        alert('Backup created successfully!');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('Failed to create backup');
    }
  };

  const handleDownloadBackup = async (backupId) => {
    try {
      const res = await api.get(`/api/super-admin/backups/${backupId}/download`);
      if (res.success) {
        // Trigger download
        window.open(res.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Error downloading backup:', error);
      alert('Failed to download backup');
    }
  };

  // Security settings
  const handleUpdateSecurity = async (settings) => {
    try {
      const res = await api.patch("/api/super-admin/security", settings);
      if (res.success) {
        setSecuritySettings(res.settings);
        alert('Security settings updated!');
      }
    } catch (error) {
      console.error('Error updating security:', error);
      alert('Failed to update security settings');
    }
  };

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Loading Super Admin Dashboard...
          </h2>
          <p className="text-gray-600">
            Preparing your platform management tools
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Loading Super Admin Dashboard...
          </h2>
          <p className="text-gray-600">
            Preparing your system management tools
          </p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
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
                Super Admin Dashboard
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mb-8">
                Platform-wide oversight, backups, security, and system management
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
                onClick={() => setActiveTab('users')}
                variant={activeTab === 'users' ? 'secondary' : 'outline'}
                className={activeTab === 'users' ? 'bg-white text-mindboost-green' : 'border-white text-white hover:bg-white/10'}
              >
                <Users className="mr-2 h-5 w-5" />
                Users
              </Button>
              <Button
                onClick={() => setActiveTab('backups')}
                variant={activeTab === 'backups' ? 'secondary' : 'outline'}
                className={activeTab === 'backups' ? 'bg-white text-mindboost-green' : 'border-white text-white hover:bg-white/10'}
              >
                <Database className="mr-2 h-5 w-5" />
                Backups
              </Button>
              <Button
                onClick={() => setActiveTab('security')}
                variant={activeTab === 'security' ? 'secondary' : 'outline'}
                className={activeTab === 'security' ? 'bg-white text-mindboost-green' : 'border-white text-white hover:bg-white/10'}
              >
                <Shield className="mr-2 h-5 w-5" />
                Security
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold text-mindboost-green">{stats.userStats?.toLocaleString()}</p>
                      </div>
                      <Users className="h-8 w-8 text-mindboost-green" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">System Health</p>
                        <p className="text-2xl font-bold text-green-600">99.9%</p>
                      </div>
                      <Server className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Backups</p>
                        <p className="text-2xl font-bold text-blue-600">{backups.length}</p>
                      </div>
                      <Database className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Security Alerts</p>
                        <p className="text-2xl font-bold text-red-600">0</p>
                      </div>
                      <Shield className="h-8 w-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <UserPlus className="h-5 w-5 mr-2" />
                      Create Admin User
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">Add new administrators or moderators</p>
                    <Button
                      onClick={() => setActiveTab('users')}
                      className="w-full bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white"
                    >
                      Manage Users
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Download className="h-5 w-5 mr-2" />
                      System Backup
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">Create and manage system backups</p>
                    <Button
                      onClick={() => setActiveTab('backups')}
                      variant="outline"
                      className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                    >
                      Backup System
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lock className="h-5 w-5 mr-2" />
                      Security Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">Configure security policies and access</p>
                    <Button
                      onClick={() => setActiveTab('security')}
                      variant="outline"
                      className="w-full border-red-500 text-red-600 hover:bg-red-50"
                    >
                      Security Config
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={newUserForm.name}
                            onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newUserForm.email}
                            onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                            placeholder="john@example.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="role">Role</Label>
                          <Select value={newUserForm.role} onValueChange={(value) => setNewUserForm({ ...newUserForm, role: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="LEARNER">Learner</SelectItem>
                              <SelectItem value="TEACHER">Teacher</SelectItem>
                              <SelectItem value="PREP_ADMIN">Prep Admin</SelectItem>
                              <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleCreateUser} className="w-full">
                          Create User
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {users.map((user) => (
                    <Card key={user.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green rounded-full flex items-center justify-center text-white font-bold">
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">
                                {user.firstName} {user.lastName}
                              </h4>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                          </div>
                          <Badge className={user.suspended ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                            {user.suspended ? 'Suspended' : 'Active'}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{user.role}</Badge>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleSuspendUser(user.id)}
                              variant="outline"
                              size="sm"
                              className="border-red-500 text-red-600 hover:bg-red-50"
                            >
                              {user.suspended ? 'Unsuspend' : 'Suspend'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Backups Tab */}
            <TabsContent value="backups">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">System Backups</h2>
                  <Button onClick={handleCreateBackup} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <Download className="h-4 w-4 mr-2" />
                    Create Backup
                  </Button>
                </div>

                {backups.length === 0 ? (
                  <div className="text-center py-12">
                    <Database className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No backups found</h3>
                    <p className="text-gray-600">Create your first system backup</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {backups.map((backup) => (
                      <Card key={backup.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <Database className="h-8 w-8 text-blue-600" />
                              <div>
                                <h4 className="font-bold text-gray-900">Backup {backup.id}</h4>
                                <p className="text-sm text-gray-600">
                                  Created: {new Date(backup.createdAt).toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Size: {backup.size || 'Unknown'}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleDownloadBackup(backup.id)}
                                variant="outline"
                                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
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

            {/* Security Tab */}
            <TabsContent value="security">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Lock className="h-5 w-5 mr-2" />
                        Password Policy
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Minimum length</span>
                          <span className="font-semibold">8 characters</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Require special characters</span>
                          <span className="font-semibold">Yes</span>
                        </div>
                        <Button variant="outline" className="w-full border-red-500 text-red-600 hover:bg-red-50">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure Policy
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Shield className="h-5 w-5 mr-2" />
                        Access Control
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Two-factor auth</span>
                          <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Session timeout</span>
                          <span className="font-semibold">30 minutes</span>
                        </div>
                        <Button variant="outline" className="w-full border-red-500 text-red-600 hover:bg-red-50">
                          <Key className="h-4 w-4 mr-2" />
                          Manage Access
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Security Logs */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      Security Logs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {logs.slice(0, 5).map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-semibold text-gray-900">{log.action}</p>
                            <p className="text-sm text-gray-600">{log.user} • {new Date(log.createdAt).toLocaleString()}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {log.type || 'System'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

    </DashboardLayout>
  );
}