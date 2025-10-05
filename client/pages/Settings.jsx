import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    User,
    Mail,
    Lock,
    Bell,
    Shield,
    CreditCard,
    Palette,
    Globe,
    Save,
    ChevronLeft,
    Eye,
    EyeOff,
    Key,
    Smartphone,
    Tablet,
    Monitor,
    Sun,
    Moon,
    Laptop,
    Zap,
    Target,
    Award,
    Brain,
} from '@/lib/icons';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Settings() {
    const { section } = useParams();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState(section || 'profile');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [settings, setSettings] = useState({
        // Profile
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+237 6XX XXX XXX',
        location: 'Yaoundé, Cameroon',
        bio: 'Passionate learner preparing for ENAM entrance exams.',

        // Security
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',

        // Notifications
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        newsletter: true,
        courseUpdates: true,
        achievementNotifications: true,

        // Privacy
        profileVisibility: 'public',
        dataSharing: false,
        activityTracking: true,

        // Billing
        currentPlan: 'Premium',
        billingDate: '2024-04-15',
        paymentMethod: 'Visa ending in 1234',

        // Preferences
        language: 'en',
        timezone: 'UTC+1',
        theme: 'light',
        examTarget: 'ENAM',
        studyReminders: true,
        dailyGoal: 2,
    });

    const sections = [
        { id: 'profile', name: 'Profile', icon: User, description: 'Manage your personal information' },
        { id: 'security', name: 'Security', icon: Lock, description: 'Update your password and security settings' },
        { id: 'notifications', name: 'Notifications', icon: Bell, description: 'Choose how you want to be notified' },
        { id: 'privacy', name: 'Privacy', icon: Shield, description: 'Control your privacy settings' },
        { id: 'billing', name: 'Billing', icon: CreditCard, description: 'Manage your subscription and payment methods' },
        { id: 'preferences', name: 'Preferences', icon: Palette, description: 'Customize your learning experience' }
    ];

    const handleSave = () => {
        // Save settings logic would go here
        console.log('Settings saved:', settings);
        // Show success message
    };

    const handleChange = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSectionChange = (sectionId) => {
        setActiveSection(sectionId);
        navigate(`/settings/${sectionId}`);
    };

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
                            Account Settings
                        </h1>
                        <p className="text-xl text-white/90 max-w-3xl mx-auto">
                            Customize your MindBoost experience and manage your account preferences
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-16 -mt-12 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar Navigation */}
                        <div className="lg:col-span-1">
                            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl">
                                <CardContent className="p-0">
                                    <nav className="space-y-1">
                                        {sections.map((section) => {
                                            const Icon = section.icon;
                                            return (
                                                <button
                                                    key={section.id}
                                                    onClick={() => handleSectionChange(section.id)}
                                                    className={`w-full flex items-center px-4 py-4 text-left transition-all rounded-xl m-2 ${activeSection === section.id
                                                        ? 'bg-mindboost-green/10 text-mindboost-green font-semibold border-l-4 border-mindboost-green'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    <Icon className="h-5 w-5 mr-3" />
                                                    <div className="flex-1 text-left">
                                                        <div className="font-medium">{section.name}</div>
                                                        <div className="text-xs text-gray-500">{section.description}</div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </nav>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl">
                                <CardHeader className="border-b border-gray-100">
                                    <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                                        {sections.find(s => s.id === activeSection)?.icon &&
                                            React.createElement(sections.find(s => s.id === activeSection).icon, { className: "h-6 w-6 text-mindboost-green mr-3" })
                                        }
                                        {sections.find(s => s.id === activeSection)?.name} Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {/* Profile Settings */}
                                    {activeSection === 'profile' && (
                                        <div className="space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <Label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                                                        First Name
                                                    </Label>
                                                    <Input
                                                        id="firstName"
                                                        value={settings.firstName}
                                                        onChange={(e) => handleChange('firstName', e.target.value)}
                                                        placeholder="First Name"
                                                        className="rounded-xl py-3"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Last Name
                                                    </Label>
                                                    <Input
                                                        id="lastName"
                                                        value={settings.lastName}
                                                        onChange={(e) => handleChange('lastName', e.target.value)}
                                                        placeholder="Last Name"
                                                        className="rounded-xl py-3"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Email Address
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={settings.email}
                                                    onChange={(e) => handleChange('email', e.target.value)}
                                                    placeholder="Email"
                                                    className="rounded-xl py-3"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Phone Number
                                                </Label>
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    value={settings.phone}
                                                    onChange={(e) => handleChange('phone', e.target.value)}
                                                    placeholder="Phone Number"
                                                    className="rounded-xl py-3"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Location
                                                </Label>
                                                <Input
                                                    id="location"
                                                    value={settings.location}
                                                    onChange={(e) => handleChange('location', e.target.value)}
                                                    placeholder="Location"
                                                    className="rounded-xl py-3"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="examTarget" className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Target Exam
                                                </Label>
                                                <select
                                                    id="examTarget"
                                                    value={settings.examTarget}
                                                    onChange={(e) => handleChange('examTarget', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green focus:border-mindboost-green"
                                                >
                                                    <option value="ENAM">ENAM (École Nationale d'Administration et de Magistrature)</option>
                                                    <option value="ENS">ENS (École Normale Supérieure)</option>
                                                    <option value="Police">Police Nationale</option>
                                                    <option value="Customs">Douanes</option>
                                                    <option value="Gendarmerie">Gendarmerie Nationale</option>
                                                    <option value="IRIC">IRIC (Institut des Relations Internationales)</option>
                                                </select>
                                            </div>

                                            <div>
                                                <Label htmlFor="bio" className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Bio
                                                </Label>
                                                <Textarea
                                                    id="bio"
                                                    value={settings.bio}
                                                    onChange={(e) => handleChange('bio', e.target.value)}
                                                    placeholder="Tell us about yourself"
                                                    rows={4}
                                                    className="rounded-xl py-3"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Security Settings */}
                                    {activeSection === 'security' && (
                                        <div className="space-y-8">
                                            <div>
                                                <Label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Current Password
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="currentPassword"
                                                        type={showCurrentPassword ? "text" : "password"}
                                                        value={settings.currentPassword}
                                                        onChange={(e) => handleChange('currentPassword', e.target.value)}
                                                        placeholder="Current Password"
                                                        className="rounded-xl py-3 pr-12"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-0 w-8 h-8 text-gray-500 hover:text-gray-700"
                                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    >
                                                        {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                    </Button>
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                                    New Password
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="newPassword"
                                                        type={showNewPassword ? "text" : "password"}
                                                        value={settings.newPassword}
                                                        onChange={(e) => handleChange('newPassword', e.target.value)}
                                                        placeholder="New Password"
                                                        className="rounded-xl py-3 pr-12"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-0 w-8 h-8 text-gray-500 hover:text-gray-700"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                    >
                                                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                    </Button>
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Confirm New Password
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="confirmPassword"
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        value={settings.confirmPassword}
                                                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                                        placeholder="Confirm New Password"
                                                        className="rounded-xl py-3 pr-12"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-0 w-8 h-8 text-gray-500 hover:text-gray-700"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-gray-200">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                                    <Key className="h-5 w-5 text-mindboost-green mr-2" />
                                                    Two-Factor Authentication
                                                </h3>
                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                    <div>
                                                        <p className="font-medium text-gray-900">Add an extra layer of security to your account</p>
                                                        <p className="text-sm text-gray-600">Currently disabled</p>
                                                    </div>
                                                    <Button className="bg-mindboost-green hover:bg-mindboost-green/90 text-white rounded-full px-4 py-2">
                                                        Enable
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="pt-4">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                                    <Shield className="h-5 w-5 text-mindboost-green mr-2" />
                                                    Security Activity
                                                </h3>
                                                <div className="space-y-3">
                                                    <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                                            <Shield className="h-4 w-4 text-green-600" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-900">Successful login</p>
                                                            <p className="text-xs text-gray-600">From Yaoundé, Cameroon • 2 hours ago</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                                            <Shield className="h-4 w-4 text-green-600" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-900">Password changed</p>
                                                            <p className="text-xs text-gray-600">From Yaoundé, Cameroon • 1 day ago</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Notification Settings */}
                                    {activeSection === 'notifications' && (
                                        <div className="space-y-8">
                                            <div className="bg-mindboost-light-green/50 p-4 rounded-xl border border-mindboost-green/20">
                                                <h3 className="font-semibold text-gray-900 mb-2">Notification Preferences</h3>
                                                <p className="text-sm text-gray-600">Choose how you want to be notified about important updates and activities.</p>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-mindboost-green/10 rounded-full flex items-center justify-center mr-4">
                                                            <Mail className="h-5 w-5 text-mindboost-green" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium text-gray-900">Email Notifications</h3>
                                                            <p className="text-sm text-gray-600">Receive notifications via email</p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={settings.emailNotifications}
                                                        onCheckedChange={(checked) => handleChange('emailNotifications', checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-mindboost-blue/10 rounded-full flex items-center justify-center mr-4">
                                                            <Smartphone className="h-5 w-5 text-mindboost-blue" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium text-gray-900">Push Notifications</h3>
                                                            <p className="text-sm text-gray-600">Receive push notifications on your devices</p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={settings.pushNotifications}
                                                        onCheckedChange={(checked) => handleChange('pushNotifications', checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-mindboost-dark-green/10 rounded-full flex items-center justify-center mr-4">
                                                            <Tablet className="h-5 w-5 text-mindboost-dark-green" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium text-gray-900">SMS Notifications</h3>
                                                            <p className="text-sm text-gray-600">Receive text messages for important updates</p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={settings.smsNotifications}
                                                        onCheckedChange={(checked) => handleChange('smsNotifications', checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-mindboost-light-blue/10 rounded-full flex items-center justify-center mr-4">
                                                            <Monitor className="h-5 w-5 text-mindboost-light-blue" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium text-gray-900">Newsletter</h3>
                                                            <p className="text-sm text-gray-600">Receive our monthly newsletter</p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={settings.newsletter}
                                                        onCheckedChange={(checked) => handleChange('newsletter', checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-mindboost-green/10 rounded-full flex items-center justify-center mr-4">
                                                            <Target className="h-5 w-5 text-mindboost-green" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium text-gray-900">Course Updates</h3>
                                                            <p className="text-sm text-gray-600">Notify me about new lessons and course updates</p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={settings.courseUpdates}
                                                        onCheckedChange={(checked) => handleChange('courseUpdates', checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-mindboost-blue/10 rounded-full flex items-center justify-center mr-4">
                                                            <Award className="h-5 w-5 text-mindboost-blue" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium text-gray-900">Achievement Notifications</h3>
                                                            <p className="text-sm text-gray-600">Celebrate your learning milestones</p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={settings.achievementNotifications}
                                                        onCheckedChange={(checked) => handleChange('achievementNotifications', checked)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Privacy Settings */}
                                    {activeSection === 'privacy' && (
                                        <div className="space-y-8">
                                            <div className="bg-mindboost-light-green/50 p-4 rounded-xl border border-mindboost-green/20">
                                                <h3 className="font-semibold text-gray-900 mb-2">Privacy Controls</h3>
                                                <p className="text-sm text-gray-600">Manage your privacy settings and control how your data is used.</p>
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Visibility</h3>
                                                <div className="space-y-4">
                                                    <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                                                        <input
                                                            type="radio"
                                                            id="public"
                                                            name="profileVisibility"
                                                            checked={settings.profileVisibility === 'public'}
                                                            onChange={() => handleChange('profileVisibility', 'public')}
                                                            className="h-5 w-5 text-mindboost-green focus:ring-mindboost-green"
                                                        />
                                                        <label htmlFor="public" className="ml-4 block">
                                                            <div className="font-medium text-gray-900">Public</div>
                                                            <div className="text-sm text-gray-600">Anyone can see your profile</div>
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                                                        <input
                                                            type="radio"
                                                            id="friends"
                                                            name="profileVisibility"
                                                            checked={settings.profileVisibility === 'friends'}
                                                            onChange={() => handleChange('profileVisibility', 'friends')}
                                                            className="h-5 w-5 text-mindboost-green focus:ring-mindboost-green"
                                                        />
                                                        <label htmlFor="friends" className="ml-4 block">
                                                            <div className="font-medium text-gray-900">Friends Only</div>
                                                            <div className="text-sm text-gray-600">Only your connections can see your profile</div>
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                                                        <input
                                                            type="radio"
                                                            id="private"
                                                            name="profileVisibility"
                                                            checked={settings.profileVisibility === 'private'}
                                                            onChange={() => handleChange('profileVisibility', 'private')}
                                                            className="h-5 w-5 text-mindboost-green focus:ring-mindboost-green"
                                                        />
                                                        <label htmlFor="private" className="ml-4 block">
                                                            <div className="font-medium text-gray-900">Private</div>
                                                            <div className="text-sm text-gray-600">Only you can see your profile</div>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6 pt-4 border-t border-gray-200">
                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                    <div>
                                                        <h3 className="font-medium text-gray-900">Data Sharing</h3>
                                                        <p className="text-sm text-gray-600">Allow us to use your data for research and analytics</p>
                                                    </div>
                                                    <Switch
                                                        checked={settings.dataSharing}
                                                        onCheckedChange={(checked) => handleChange('dataSharing', checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                    <div>
                                                        <h3 className="font-medium text-gray-900">Activity Tracking</h3>
                                                        <p className="text-sm text-gray-600">Track your learning activity to improve recommendations</p>
                                                    </div>
                                                    <Switch
                                                        checked={settings.activityTracking}
                                                        onCheckedChange={(checked) => handleChange('activityTracking', checked)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-gray-200">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <Button variant="outline" className="border-mindboost-green text-mindboost-green hover:bg-mindboost-green/10 rounded-xl py-3">
                                                        Download My Data
                                                    </Button>
                                                    <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-50 rounded-xl py-3">
                                                        Delete Account
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Billing Settings */}
                                    {activeSection === 'billing' && (
                                        <div className="space-y-8">
                                            <div className="bg-mindboost-light-green/50 p-4 rounded-xl border border-mindboost-green/20">
                                                <h3 className="font-semibold text-gray-900 mb-2">Billing Information</h3>
                                                <p className="text-sm text-gray-600">Manage your subscription and payment methods.</p>
                                            </div>

                                            <div className="p-6 bg-gradient-to-r from-mindboost-green/10 to-mindboost-light-green/20 rounded-2xl border border-mindboost-green/20">
                                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-900">{settings.currentPlan}</h3>
                                                        <p className="text-gray-600">Next billing date: {new Date(settings.billingDate).toLocaleDateString()}</p>
                                                    </div>
                                                    <Badge className="bg-mindboost-green text-white w-fit">Active</Badge>
                                                </div>

                                                <div className="flex flex-wrap gap-4 mb-6">
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-mindboost-green">24</div>
                                                        <div className="text-sm text-gray-600">Courses</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-mindboost-blue">18</div>
                                                        <div className="text-sm text-gray-600">Completed</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-mindboost-dark-green">85%</div>
                                                        <div className="text-sm text-gray-600">Avg Score</div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-3">
                                                    <Button className="bg-mindboost-green hover:bg-mindboost-green/90 text-white rounded-full px-4 py-2">
                                                        Change Plan
                                                    </Button>
                                                    <Button variant="outline" className="border-mindboost-green text-mindboost-green hover:bg-mindboost-green/10 rounded-full px-4 py-2">
                                                        Billing History
                                                    </Button>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
                                                <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                                                    <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded flex items-center justify-center text-white font-bold mr-4">
                                                        VISA
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900">{settings.paymentMethod}</p>
                                                        <p className="text-gray-600">Expires 12/25</p>
                                                    </div>
                                                    <Button variant="outline" className="border-mindboost-green text-mindboost-green hover:bg-mindboost-green/10 rounded-full px-4 py-2">
                                                        Edit
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-gray-200">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                        <div>
                                                            <p className="font-medium text-gray-900">Premium Plan - March 2024</p>
                                                            <p className="text-sm text-gray-600">March 1, 2024</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium text-gray-900">15,000 FCFA</p>
                                                            <Badge className="bg-green-100 text-green-800 mt-1">Paid</Badge>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                        <div>
                                                            <p className="font-medium text-gray-900">Premium Plan - February 2024</p>
                                                            <p className="text-sm text-gray-600">February 1, 2024</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium text-gray-900">15,000 FCFA</p>
                                                            <Badge className="bg-green-100 text-green-800 mt-1">Paid</Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Preferences Settings */}
                                    {activeSection === 'preferences' && (
                                        <div className="space-y-8">
                                            <div className="bg-mindboost-light-green/50 p-4 rounded-xl border border-mindboost-green/20">
                                                <h3 className="font-semibold text-gray-900 mb-2">Learning Preferences</h3>
                                                <p className="text-sm text-gray-600">Customize your learning experience to match your goals.</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <Label htmlFor="language" className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Language
                                                    </Label>
                                                    <select
                                                        id="language"
                                                        value={settings.language}
                                                        onChange={(e) => handleChange('language', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green focus:border-mindboost-green"
                                                    >
                                                        <option value="en">English</option>
                                                        <option value="fr">French</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <Label htmlFor="timezone" className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Timezone
                                                    </Label>
                                                    <select
                                                        id="timezone"
                                                        value={settings.timezone}
                                                        onChange={(e) => handleChange('timezone', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green focus:border-mindboost-green"
                                                    >
                                                        <option value="UTC+1">(UTC+01:00) Paris, Berlin, Rome, Yaoundé</option>
                                                        <option value="UTC0">(UTC+00:00) London, Dublin, Lisbon</option>
                                                        <option value="UTC-5">(UTC-05:00) Eastern Time (US & Canada)</option>
                                                        <option value="UTC+2">(UTC+02:00) Cairo, Helsinki, Istanbul</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <Label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Theme
                                                </Label>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <button
                                                        onClick={() => handleChange('theme', 'light')}
                                                        className={`p-4 border rounded-xl flex flex-col items-center ${settings.theme === 'light'
                                                            ? 'border-mindboost-green ring-2 ring-mindboost-green/30 bg-mindboost-light-green/20'
                                                            : 'border-gray-300 bg-gray-50'
                                                            }`}
                                                    >
                                                        <div className="w-16 h-16 bg-white border rounded mb-2 flex items-center justify-center">
                                                            <Sun className="h-6 w-6 text-yellow-500" />
                                                        </div>
                                                        <span className="text-sm font-medium">Light</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleChange('theme', 'dark')}
                                                        className={`p-4 border rounded-xl flex flex-col items-center ${settings.theme === 'dark'
                                                            ? 'border-mindboost-green ring-2 ring-mindboost-green/30 bg-mindboost-light-green/20'
                                                            : 'border-gray-300 bg-gray-50'
                                                            }`}
                                                    >
                                                        <div className="w-16 h-16 bg-gray-800 border rounded mb-2 flex items-center justify-center">
                                                            <Moon className="h-6 w-6 text-gray-300" />
                                                        </div>
                                                        <span className="text-sm font-medium">Dark</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleChange('theme', 'system')}
                                                        className={`p-4 border rounded-xl flex flex-col items-center ${settings.theme === 'system'
                                                            ? 'border-mindboost-green ring-2 ring-mindboost-green/30 bg-mindboost-light-green/20'
                                                            : 'border-gray-300 bg-gray-50'
                                                            }`}
                                                    >
                                                        <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-800 border rounded mb-2 flex items-center justify-center">
                                                            <Laptop className="h-6 w-6 text-gray-600" />
                                                        </div>
                                                        <span className="text-sm font-medium">System</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-gray-200">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Goals</h3>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                        <div>
                                                            <h3 className="font-medium text-gray-900">Study Reminders</h3>
                                                            <p className="text-sm text-gray-600">Get reminders to study daily</p>
                                                        </div>
                                                        <Switch
                                                            checked={settings.studyReminders}
                                                            onCheckedChange={(checked) => handleChange('studyReminders', checked)}
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Daily Study Goal
                                                        </Label>
                                                        <div className="flex items-center gap-4">
                                                            <Input
                                                                type="number"
                                                                value={settings.dailyGoal}
                                                                onChange={(e) => handleChange('dailyGoal', parseInt(e.target.value) || 0)}
                                                                min="1"
                                                                max="12"
                                                                className="w-24 rounded-xl py-3 text-center"
                                                            />
                                                            <span className="text-gray-600">hours per day</span>
                                                        </div>
                                                        <div className="mt-3">
                                                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                                <span>Current progress</span>
                                                                <span>1.5h / {settings.dailyGoal}h</span>
                                                            </div>
                                                            <Progress value={(1.5 / settings.dailyGoal) * 100} className="h-2 rounded-full" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                                        <Button
                                            onClick={handleSave}
                                            className="bg-mindboost-green hover:bg-mindboost-green/90 text-white rounded-full px-6 py-3 font-bold"
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Changes
                                        </Button>
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