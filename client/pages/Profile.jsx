import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { api } from '@shared/api';
import { useAuth } from '@/hooks/use-auth';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  Camera,
  BookOpen,
  Target,
  Award,
  Settings,
  ChevronLeft,
  GraduationCap,
  Clock,
  CheckCircle,
  Star,
  Eye,
  Lock,
  Bell,
  CreditCard,
  LogOut,
  Shield,
  TrendingUp,
  Zap,
  Brain,
} from '@/lib/icons';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Profile() {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [editedProfile, setEditedProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/profile');

        if (response.success && response.data?.user) {
          const userData = response.data.user;
          const profileData = {
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phone: userData.phone || '',
            location: userData.location || 'Not specified',
            bio: userData.bio || 'No bio provided',
            joinDate: userData.createdAt || new Date().toISOString(),
            avatar: userData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${userData.firstName || 'U'}${userData.lastName || ''}`,
            examTarget: userData.examTarget || 'ENAM',
            currentLevel: userData.currentLevel || 'Beginner',
            studyHours: userData.studyHours || 120,
            coursesCompleted: userData.coursesCompleted || 18,
            totalCourses: userData.totalCourses || 24,
            achievements: userData.achievements || 12,
            streak: userData.streak || 7,
            avgScore: userData.avgScore || 85,
          };

          setProfile(profileData);
          setEditedProfile(profileData);
        } else {
          throw new Error('Failed to fetch profile data');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');

        // Fallback to mock data
        const mockProfile = {
          firstName: authUser?.firstName || 'John',
          lastName: authUser?.lastName || 'Doe',
          email: authUser?.email || 'john.doe@example.com',
          phone: '+237 6XX XXX XXX',
          location: 'Yaoundé, Cameroon',
          bio: 'Passionate learner focused on administrative sciences. Enjoys collaborative learning and helping peers understand complex concepts.',
          joinDate: '2023-01-15',
          avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=JD',
          examTarget: 'ENAM',
          currentLevel: 'Intermediate',
          studyHours: 120,
          coursesCompleted: 18,
          totalCourses: 24,
          achievements: 12,
          streak: 7,
          avgScore: 85,
        };

        setProfile(mockProfile);
        setEditedProfile(mockProfile);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authUser]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updateData = {
        firstName: editedProfile.firstName,
        lastName: editedProfile.lastName,
        phone: editedProfile.phone,
        location: editedProfile.location,
        bio: editedProfile.bio,
        examTarget: editedProfile.examTarget,
        // Note: In a real implementation, you would upload the avatar file separately
        // and send the URL in the updateData
      };

      const response = await api.put('/api/profile', updateData);

      if (response.success && response.data?.user) {
        const userData = response.data.user;
        const updatedProfile = {
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          location: userData.location || 'Not specified',
          bio: userData.bio || 'No bio provided',
          joinDate: userData.createdAt || new Date().toISOString(),
          avatar: userData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${userData.firstName || 'U'}${userData.lastName || ''}`,
          examTarget: userData.examTarget || 'ENAM',
          currentLevel: userData.currentLevel || 'Beginner',
          studyHours: userData.studyHours || 120,
          coursesCompleted: userData.coursesCompleted || 18,
          totalCourses: userData.totalCourses || 24,
          achievements: userData.achievements || 12,
          streak: userData.streak || 7,
          avgScore: userData.avgScore || 85,
        };

        setProfile(updatedProfile);
        setIsEditing(false);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile);
  };

  const handleChange = (field, value) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // In a real implementation, you would upload the file to your server
      // For now, we'll just create a local preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditedProfile(prev => ({ ...prev, avatar: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Profile...</h2>
          <p className="text-gray-600">Preparing your personalized profile</p>
        </div>
      </div>
    );
  }

  const progressPercentage = profile ? Math.round((profile.coursesCompleted / profile.totalCourses) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-mindboost-green to-mindboost-dark-green py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 right-10 w-24 h-24 bg-white rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              My Profile
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Manage your personal information, track your progress, and customize your learning experience
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 -mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="text-red-700 text-center">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                      <User className="h-6 w-6 text-mindboost-green mr-3" />
                      Personal Information
                    </CardTitle>
                    <div>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-mindboost-green hover:bg-mindboost-green/90 text-white rounded-full px-4 py-2"
                          >
                            {saving ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleCancel}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-4 py-2"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={handleEdit}
                          className="bg-mindboost-green hover:bg-mindboost-green/90 text-white rounded-full px-4 py-2"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 mb-6 md:mb-0 flex flex-col items-center">
                      <div className="relative">
                        <img
                          src={isEditing ? editedProfile.avatar : profile.avatar}
                          alt="Profile"
                          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                        />
                        {isEditing && (
                          <>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarChange}
                              className="hidden"
                              id="avatar-upload"
                            />
                            <label htmlFor="avatar-upload">
                              <Button
                                variant="secondary"
                                size="sm"
                                className="absolute bottom-2 right-2 rounded-full p-2 bg-white shadow-lg hover:bg-gray-100 cursor-pointer"
                                asChild
                              >
                                <span>
                                  <Camera className="h-4 w-4" />
                                </span>
                              </Button>
                            </label>
                          </>
                        )}
                      </div>
                      <div className="mt-4 text-center">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {isEditing ? `${editedProfile.firstName} ${editedProfile.lastName}` : `${profile.firstName} ${profile.lastName}`}
                        </h2>
                        <p className="text-mindboost-green font-semibold">Student</p>
                        <div className="flex items-center justify-center mt-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Joined {new Date(profile.joinDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="md:w-2/3 md:pl-8">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                          {isEditing ? (
                            <div className="grid grid-cols-2 gap-3">
                              <Input
                                value={editedProfile.firstName}
                                onChange={(e) => handleChange('firstName', e.target.value)}
                                placeholder="First Name"
                                className="rounded-xl py-3"
                              />
                              <Input
                                value={editedProfile.lastName}
                                onChange={(e) => handleChange('lastName', e.target.value)}
                                placeholder="Last Name"
                                className="rounded-xl py-3"
                              />
                            </div>
                          ) : (
                            <p className="text-gray-900 text-lg">{profile.firstName} {profile.lastName}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                          {isEditing ? (
                            <Input
                              type="email"
                              value={editedProfile.email}
                              onChange={(e) => handleChange('email', e.target.value)}
                              placeholder="Email"
                              disabled
                              className="rounded-xl py-3"
                            />
                          ) : (
                            <div className="flex items-center">
                              <Mail className="h-5 w-5 text-mindboost-green mr-3" />
                              <p className="text-gray-900">{profile.email}</p>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                          {isEditing ? (
                            <Input
                              type="tel"
                              value={editedProfile.phone}
                              onChange={(e) => handleChange('phone', e.target.value)}
                              placeholder="Phone"
                              className="rounded-xl py-3"
                            />
                          ) : (
                            <div className="flex items-center">
                              <Phone className="h-5 w-5 text-mindboost-green mr-3" />
                              <p className="text-gray-900">{profile.phone || 'Not provided'}</p>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                          {isEditing ? (
                            <Input
                              value={editedProfile.location}
                              onChange={(e) => handleChange('location', e.target.value)}
                              placeholder="Location"
                              className="rounded-xl py-3"
                            />
                          ) : (
                            <div className="flex items-center">
                              <MapPin className="h-5 w-5 text-mindboost-green mr-3" />
                              <p className="text-gray-900">{profile.location}</p>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Target Exam</label>
                          {isEditing ? (
                            <Input
                              value={editedProfile.examTarget}
                              onChange={(e) => handleChange('examTarget', e.target.value)}
                              placeholder="Target Exam"
                              className="rounded-xl py-3"
                            />
                          ) : (
                            <div className="flex items-center">
                              <Target className="h-5 w-5 text-mindboost-green mr-3" />
                              <p className="text-gray-900">{profile.examTarget}</p>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                          {isEditing ? (
                            <Textarea
                              value={editedProfile.bio}
                              onChange={(e) => handleChange('bio', e.target.value)}
                              placeholder="Tell us about yourself"
                              rows={4}
                              className="rounded-xl py-3"
                            />
                          ) : (
                            <p className="text-gray-700 bg-gray-50 p-4 rounded-xl">{profile.bio}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Progress */}
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                    <TrendingUp className="h-6 w-6 text-mindboost-green mr-3" />
                    Learning Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-mindboost-light-green/50 rounded-xl">
                      <div className="w-12 h-12 bg-mindboost-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <BookOpen className="h-6 w-6 text-mindboost-green" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{profile.coursesCompleted}</div>
                      <div className="text-gray-600 text-sm">Courses Completed</div>
                    </div>

                    <div className="text-center p-4 bg-mindboost-light-blue/50 rounded-xl">
                      <div className="w-12 h-12 bg-mindboost-blue/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <GraduationCap className="h-6 w-6 text-mindboost-blue" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{profile.totalCourses}</div>
                      <div className="text-gray-600 text-sm">Total Courses</div>
                    </div>

                    <div className="text-center p-4 bg-mindboost-cream/50 rounded-xl">
                      <div className="w-12 h-12 bg-mindboost-dark-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock className="h-6 w-6 text-mindboost-dark-green" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{profile.studyHours}h</div>
                      <div className="text-gray-600 text-sm">Study Hours</div>
                    </div>

                    <div className="text-center p-4 bg-mindboost-light-green/50 rounded-xl">
                      <div className="w-12 h-12 bg-mindboost-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Star className="h-6 w-6 text-mindboost-green" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{profile.achievements}</div>
                      <div className="text-gray-600 text-sm">Achievements</div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-900">Course Completion</span>
                      <span className="font-bold text-mindboost-green">{progressPercentage}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-3 rounded-full" />
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>{profile.coursesCompleted} of {profile.totalCourses} courses</span>
                      <span>{profile.avgScore}% average score</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Account Settings */}
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                    <Settings className="h-5 w-5 text-mindboost-green mr-2" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Button asChild variant="ghost" className="w-full justify-start hover:bg-mindboost-light-green/50 rounded-xl py-3">
                      <Link to="/settings/profile" className="flex items-center">
                        <User className="h-5 w-5 text-mindboost-green mr-3" />
                        Profile Settings
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-start hover:bg-mindboost-light-green/50 rounded-xl py-3">
                      <Link to="/settings/preferences" className="flex items-center">
                        <Zap className="h-5 w-5 text-mindboost-green mr-3" />
                        Preferences
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-start hover:bg-mindboost-light-green/50 rounded-xl py-3">
                      <Link to="/settings/notifications" className="flex items-center">
                        <Bell className="h-5 w-5 text-mindboost-green mr-3" />
                        Notifications
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-start hover:bg-mindboost-light-green/50 rounded-xl py-3">
                      <Link to="/settings/privacy" className="flex items-center">
                        <Shield className="h-5 w-5 text-mindboost-green mr-3" />
                        Privacy & Security
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-start hover:bg-mindboost-light-green/50 rounded-xl py-3">
                      <Link to="/settings/billing" className="flex items-center">
                        <CreditCard className="h-5 w-5 text-mindboost-green mr-3" />
                        Billing & Subscription
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start hover:bg-red-50 rounded-xl py-3 text-red-600"
                      onClick={logout}
                    >
                      <LogOut className="h-5 w-5 text-red-600 mr-3" />
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                    <Award className="h-5 w-5 text-mindboost-green mr-2" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                        <Award className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Quiz Master</div>
                        <div className="text-sm text-gray-600">Scored 95% on Mathematics Quiz</div>
                      </div>
                    </div>

                    <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <Target className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Streak Builder</div>
                        <div className="text-sm text-gray-600">7-day study streak</div>
                      </div>
                    </div>

                    <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <BookOpen className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Bookworm</div>
                        <div className="text-sm text-gray-600">Completed 10 courses</div>
                      </div>
                    </div>

                    <Button asChild variant="outline" className="w-full border-mindboost-green text-mindboost-green hover:bg-mindboost-green/10 rounded-xl">
                      <Link to="/achievements">
                        <Eye className="h-4 w-4 mr-2" />
                        View All Achievements
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Streak */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-2xl font-bold">{profile.streak}</div>
                      <div className="text-orange-100 text-sm">Day Streak</div>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="text-orange-100 text-sm">
                    Keep it up! You're on fire! 🔥
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}