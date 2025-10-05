import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress as ProgressUI } from '@/components/ui/progress';
import { api } from '@shared/api';
import { useAuth } from '@/hooks/use-auth';
import {
    BarChart3,
    BookOpen,
    Target,
    Clock,
    TrendingUp,
    Calendar,
    Award,
    Brain,
    ChevronLeft,
    Zap,
    Users,
    Star,
    CheckCircle,
    PieChart,
    LineChart,
    Activity
} from '@/lib/icons';

// Simple chart components
const BarChart = ({ data, color = "from-blue-500 to-blue-600" }) => {
    const maxValue = Math.max(...data.map(item => item.value), 1);

    return (
        <div className="flex items-end justify-between h-40 pt-4">
            {data.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1 px-1">
                    <div className="text-xs text-gray-600 mb-2">{item.label}</div>
                    <div
                        className={`w-full bg-gradient-to-t ${color} rounded-t-lg transition-all hover:opacity-90`}
                        style={{ height: `${(item.value / maxValue) * 100}%` }}
                    ></div>
                    <div className="text-xs text-gray-600 mt-2">{item.value}</div>
                </div>
            ))}
        </div>
    );
};

const PieChartComponent = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let startAngle = 0;

    const colors = [
        'from-blue-400 to-blue-600',
        'from-green-400 to-green-600',
        'from-purple-400 to-purple-600',
        'from-orange-400 to-orange-600',
        'from-pink-400 to-pink-600'
    ];

    return (
        <div className="relative w-40 h-40 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-white shadow-lg"></div>
            {data.map((item, index) => {
                const percentage = (item.value / total) * 100;
                const angle = (percentage / 100) * 360;
                const clipPath = `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((startAngle + angle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((startAngle + angle - 90) * Math.PI / 180)}%, 50% 50%)`;
                startAngle += angle;

                return (
                    <div
                        key={index}
                        className={`absolute inset-0 bg-gradient-to-r ${colors[index % colors.length]} rounded-full`}
                        style={{ clipPath }}
                    ></div>
                );
            })}
            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{total}</div>
                    <div className="text-xs text-gray-600">Total</div>
                </div>
            </div>
        </div>
    );
};

const LineChartComponent = ({ data }) => {
    const maxValue = Math.max(...data.map(item => item.value), 1);
    const minValue = Math.min(...data.map(item => item.value), 0);
    const range = maxValue - minValue || 1;

    return (
        <div className="h-40 pt-4 relative">
            <div className="absolute inset-0 flex items-end">
                {data.map((item, index) => {
                    const height = ((item.value - minValue) / range) * 100;
                    return (
                        <div
                            key={index}
                            className="flex-1 flex flex-col items-center"
                            style={{ height: '100%' }}
                        >
                            <div
                                className="w-2 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t hover:from-blue-600 hover:to-blue-500 transition-all"
                                style={{ height: `${height}%` }}
                            ></div>
                            <div className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-left">
                                {item.label}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200"></div>
        </div>
    );
};

export default function ProgressTracking() {
    const { user } = useAuth();
    const [progressData, setProgressData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('week');

    useEffect(() => {
        fetchProgressData();
    }, [timeRange]);

    const fetchProgressData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/analytics/personal?range=${timeRange}`);

            if (response) {
                // Transform the data to match the existing structure
                const transformedData = transformAnalyticsData(response);
                setProgressData(transformedData);
            }
        } catch (err) {
            setError('Failed to fetch progress data');
            console.error('Error fetching progress data:', err);

            // Fallback to mock data
            const mockData = {
                overallProgress: 72,
                subjects: [
                    { id: 'math', name: 'Mathematics', progress: 85, timeSpent: 24, quizzesTaken: 12, averageScore: 88, color: 'from-blue-500 to-blue-600' },
                    { id: 'physics', name: 'Physics', progress: 68, timeSpent: 18, quizzesTaken: 8, averageScore: 76, color: 'from-purple-500 to-purple-600' },
                    { id: 'chemistry', name: 'Chemistry', progress: 78, timeSpent: 20, quizzesTaken: 10, averageScore: 82, color: 'from-green-500 to-green-600' },
                    { id: 'biology', name: 'Biology', progress: 65, timeSpent: 15, quizzesTaken: 7, averageScore: 72, color: 'from-orange-500 to-orange-600' }
                ],
                weeklyActivity: [
                    { day: 'Mon', hours: 2.5 },
                    { day: 'Tue', hours: 3.2 },
                    { day: 'Wed', hours: 1.8 },
                    { day: 'Thu', hours: 4.1 },
                    { day: 'Fri', hours: 2.9 },
                    { day: 'Sat', hours: 3.7 },
                    { day: 'Sun', hours: 1.5 }
                ],
                monthlyProgress: [
                    { month: 'Jan', value: 45 },
                    { month: 'Feb', value: 52 },
                    { month: 'Mar', value: 68 },
                    { month: 'Apr', value: 72 }
                ],
                subjectDistribution: [
                    { subject: 'Math', value: 35 },
                    { subject: 'Physics', value: 25 },
                    { subject: 'Chemistry', value: 20 },
                    { subject: 'Biology', value: 15 },
                    { subject: 'Others', value: 5 }
                ],
                achievements: [
                    { id: '1', name: 'Quiz Master', date: '2024-01-15' },
                    { id: '2', name: 'Streak Starter', date: '2024-01-10' },
                    { id: '3', name: 'Bookworm', date: '2024-01-12' }
                ],
                overview: {
                    totalStudyTime: 1560,
                    totalCourses: 12,
                    completedCourses: 8,
                    averageScore: 82,
                    streak: 7
                }
            };

            setProgressData(mockData);
        } finally {
            setLoading(false);
        }
    };

    const transformAnalyticsData = (data) => {
        // Calculate overall progress from learning paths
        let overallProgress = 0;
        if (data.learningPathProgress && data.learningPathProgress.length > 0) {
            const totalProgress = data.learningPathProgress.reduce((sum, path) => sum + path.progress, 0);
            overallProgress = Math.round(totalProgress / data.learningPathProgress.length);
        }

        // Transform subjects data
        const subjects = data.performanceByExamType ?
            Object.entries(data.performanceByExamType).map(([examType, performance], index) => {
                const colors = [
                    'from-blue-500 to-blue-600',
                    'from-purple-500 to-purple-600',
                    'from-green-500 to-green-600',
                    'from-orange-500 to-orange-600'
                ];

                return {
                    id: examType.toLowerCase().replace(/\s+/g, '-'),
                    name: examType,
                    progress: Math.round(performance.average || 0),
                    timeSpent: Math.round((data.trends?.studyTime?.length || 0) * 1.5), // Estimate
                    quizzesTaken: performance.count || 0,
                    averageScore: Math.round(performance.average || 0),
                    color: colors[index % colors.length]
                };
            }) : [];

        // Transform weekly activity data
        const weeklyActivity = data.trends?.studyTime ?
            data.trends.studyTime.slice(0, 7).map((session, index) => ({
                day: new Date(session.date).toLocaleDateString('en-US', { weekday: 'short' }),
                hours: Math.round(session.duration / 60 * 10) / 10 // Convert minutes to hours
            })) : [];

        // Transform monthly progress data
        const monthlyProgress = data.trends?.monthlyProgress ?
            data.trends.monthlyProgress.map((item, index) => ({
                month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index],
                value: Math.round(item.progress || 0)
            })) : [];

        // Transform subject distribution data
        const subjectDistribution = data.subjectDistribution ?
            Object.entries(data.subjectDistribution).map(([subject, value]) => ({
                subject: subject,
                value: Math.round(value || 0)
            })) : [];

        // Mock achievements data (would need a real achievements API)
        const achievements = [
            { id: '1', name: 'Quiz Master', date: '2024-01-15' },
            { id: '2', name: 'Streak Starter', date: '2024-01-10' },
            { id: '3', name: 'Bookworm', date: '2024-01-12' }
        ];

        return {
            overallProgress,
            subjects,
            weeklyActivity,
            monthlyProgress,
            subjectDistribution,
            achievements,
            overview: data.overview
        };
    };

    const timeRangeOptions = [
        { id: 'week', name: 'This Week' },
        { id: 'month', name: 'This Month' },
        { id: 'quarter', name: 'This Quarter' },
        { id: 'year', name: 'This Year' }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header with Back Button */}
                    <div className="flex items-center mb-8">
                        <Button asChild variant="ghost" className="hover:bg-mindboost-light-green/50 rounded-full mr-4">
                            <Link to="/dashboard/learner" className="flex items-center text-mindboost-dark-green">
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Link>
                        </Button>
                        <div className="h-8 w-64 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
                        ))}
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>
                        <div className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>
                    </div>

                    {/* Subject Progress */}
                    <div className="h-96 bg-gray-200 rounded-2xl animate-pulse"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BarChart3 className="h-8 w-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Progress</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Button
                        onClick={fetchProgressData}
                        className="bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white hover:from-mindboost-green/90 hover:to-mindboost-dark-green/90 rounded-full"
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    if (!progressData) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header with Back Button */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div className="flex items-center mb-4 md:mb-0">
                        <Button asChild variant="ghost" className="hover:bg-mindboost-light-green/50 rounded-full mr-4">
                            <Link to="/dashboard/learner" className="flex items-center text-mindboost-dark-green">
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Progress Tracking</h1>
                            <p className="text-gray-600">Monitor your learning journey and identify areas for improvement</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="text-gray-700">Time Range:</span>
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mindboost-green"
                        >
                            {timeRangeOptions.map((option) => (
                                <option key={option.id} value={option.id}>
                                    {option.name}
                                </option>
                            ))}
                        </select>
                        <Button className="bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white hover:from-mindboost-green/90 hover:to-mindboost-dark-green/90 rounded-full">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Detailed Report
                        </Button>
                    </div>
                </div>

                {/* Overall Progress */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <Card className="lg:col-span-2 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                                <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                                Overall Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-lg font-semibold text-gray-900">Completion</span>
                                <span className="text-2xl font-bold text-blue-600">{progressData.overallProgress}%</span>
                            </div>
                            <ProgressUI value={progressData.overallProgress} className="h-4 rounded-full" />

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                <div className="text-center p-4 bg-mindboost-light-blue/50 rounded-xl border border-mindboost-blue/20">
                                    <div className="text-2xl font-bold text-mindboost-blue">{Math.round((progressData.overview?.totalStudyTime || 0) / 60)}h</div>
                                    <div className="text-sm text-gray-600">Study Time</div>
                                </div>
                                <div className="text-center p-4 bg-mindboost-light-green/50 rounded-xl border border-mindboost-green/20">
                                    <div className="text-2xl font-bold text-mindboost-green">{progressData.overview?.totalCourses || 0}</div>
                                    <div className="text-sm text-gray-600">Courses</div>
                                </div>
                                <div className="text-center p-4 bg-mindboost-cream/50 rounded-xl border border-mindboost-dark-green/20">
                                    <div className="text-2xl font-bold text-mindboost-dark-green">{progressData.overview?.completedCourses || 0}</div>
                                    <div className="text-sm text-gray-600">Completed</div>
                                </div>
                                <div className="text-center p-4 bg-mindboost-light-blue/50 rounded-xl border border-mindboost-blue/20">
                                    <div className="text-2xl font-bold text-mindboost-blue">{progressData.overview?.averageScore || 0}%</div>
                                    <div className="text-sm text-gray-600">Avg Score</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-xl bg-gradient-to-br from-mindboost-green to-mindboost-dark-green text-white">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold flex items-center">
                                <Award className="h-5 w-5 mr-2" />
                                Recent Achievements
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {progressData.achievements.map((achievement) => (
                                    <div key={achievement.id} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                                        <div>
                                            <div className="font-semibold">{achievement.name}</div>
                                            <div className="text-sm text-mindboost-light-green">
                                                {new Date(achievement.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <Award className="h-5 w-5 text-yellow-300" />
                                    </div>
                                ))}
                            </div>
                            <Button asChild variant="secondary" className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white rounded-full">
                                <Link to="/achievements">View All</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <Card className="lg:col-span-2 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                                <Activity className="h-5 w-5 mr-2 text-purple-500" />
                                Weekly Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <BarChart data={progressData.weeklyActivity} color="from-purple-500 to-purple-600" />
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                                <PieChart className="h-5 w-5 mr-2 text-green-500" />
                                Subject Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <PieChartComponent data={progressData.subjectDistribution} />
                        </CardContent>
                    </Card>
                </div>

                {/* Monthly Progress and Study Tips */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <Card className="lg:col-span-2 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                                <LineChart className="h-5 w-5 mr-2 text-orange-500" />
                                Monthly Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <LineChartComponent data={progressData.monthlyProgress} />
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                                <Brain className="h-5 w-5 mr-2 text-blue-500" />
                                Study Tips
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-4 bg-mindboost-light-green/50 rounded-lg border border-mindboost-green/20">
                                    <h4 className="font-semibold text-mindboost-dark-green">Consistency is Key</h4>
                                    <p className="text-sm text-gray-700 mt-1">
                                        Studying for 1-2 hours daily is more effective than cramming for 10 hours once a week.
                                    </p>
                                </div>
                                <div className="p-4 bg-mindboost-light-blue/50 rounded-lg border border-mindboost-blue/20">
                                    <h4 className="font-semibold text-mindboost-blue">Active Recall</h4>
                                    <p className="text-sm text-gray-700 mt-1">
                                        Test yourself regularly instead of just re-reading notes to improve retention.
                                    </p>
                                </div>
                                <div className="p-4 bg-mindboost-cream/50 rounded-lg border border-mindboost-dark-green/20">
                                    <h4 className="font-semibold text-mindboost-dark-green">Mix It Up</h4>
                                    <p className="text-sm text-gray-700 mt-1">
                                        Alternate between different subjects to prevent mental fatigue and improve focus.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Subject Progress */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-8">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                            <BookOpen className="h-5 w-5 mr-2 text-indigo-500" />
                            Subject Progress
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {progressData.subjects.map((subject) => (
                                <div key={subject.id}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center">
                                            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${subject.color} mr-3`}></div>
                                            <span className="font-semibold text-gray-900">{subject.name}</span>
                                        </div>
                                        <span className="font-bold text-gray-900">{subject.progress}%</span>
                                    </div>
                                    <ProgressUI value={subject.progress} className="h-3 mb-3 rounded-full" />
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="text-lg font-bold text-gray-900">{subject.timeSpent}h</div>
                                            <div className="text-xs text-gray-600">Study Time</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="text-lg font-bold text-gray-900">{subject.quizzesTaken}</div>
                                            <div className="text-xs text-gray-600">Quizzes</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="text-lg font-bold text-gray-900">{subject.averageScore}%</div>
                                            <div className="text-xs text-gray-600">Avg Score</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <Button asChild variant="outline" size="sm" className="border-mindboost-green text-mindboost-dark-green hover:bg-mindboost-green/10 rounded-full">
                                                <Link to={`/subject/${subject.id}`}>Review</Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}