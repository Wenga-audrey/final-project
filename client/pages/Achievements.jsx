import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { api } from '@shared/api';
import { useAuth } from '@/hooks/use-auth';
import {
  Trophy,
  Target,
  BookOpen,
  Clock,
  Zap,
  Star,
  Award,
  CheckCircle,
  TrendingUp,
  Calendar,
  Users,
  Brain,
  ChevronLeft,
  Fire,
  Shield,
  Heart,
  Sparkles
} from '@/lib/icons';

export default function Achievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('progress');

  // Icon mapping for achievements
  const iconMap = {
    Target: Target,
    Zap: Zap,
    BookOpen: BookOpen,
    Clock: Clock,
    Star: Star,
    Trophy: Trophy,
    Users: Users,
    Brain: Brain,
    Fire: Fire,
    Medal: Award,
    Rocket: Zap,
    Gem: Star,
    Shield: Shield,
    Heart: Heart,
    Lightbulb: Sparkles
  };

  const categories = [
    { id: 'all', name: 'All Achievements', icon: Award },
    { id: 'quizzes', name: 'Quizzes', icon: Target },
    { id: 'learning', name: 'Learning', icon: BookOpen },
    { id: 'consistency', name: 'Consistency', icon: Zap },
    { id: 'time', name: 'Time', icon: Clock },
    { id: 'community', name: 'Community', icon: Users },
    { id: 'technology', name: 'Technology', icon: Brain }
  ];

  const sortOptions = [
    { id: 'progress', name: 'Progress' },
    { id: 'points', name: 'Points' },
    { id: 'earned', name: 'Earned Date' },
    { id: 'difficulty', name: 'Difficulty' }
  ];

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/learner/achievements');

      if (response.success) {
        // Transform the data to match the existing structure
        const unlockedAchievements = response.data.unlocked.map(ua => ({
          id: ua.achievement.id,
          title: ua.achievement.name,
          description: ua.achievement.description,
          icon: iconMap[ua.achievement.icon] || Trophy,
          earned: true,
          earnedDate: ua.unlockedAt,
          points: ua.achievement.points,
          category: ua.achievement.category,
          progress: 100,
          difficulty: ua.achievement.difficulty || 'medium',
          streak: ua.achievement.streak || 0
        }));

        const availableAchievements = response.data.available.map(a => ({
          id: a.id,
          title: a.name,
          description: a.description,
          icon: iconMap[a.icon] || Trophy,
          earned: false,
          points: a.points,
          category: a.category,
          progress: a.progress || 0,
          difficulty: a.difficulty || 'medium',
          streak: a.streak || 0
        }));

        setAchievements([...unlockedAchievements, ...availableAchievements]);
      }
    } catch (err) {
      setError('Failed to fetch achievements');
      console.error('Error fetching achievements:', err);

      // Fallback to mock data
      const mockAchievements = [
        {
          id: '1',
          title: 'First Quiz Master',
          description: 'Complete your first quiz with 80% or higher',
          icon: Target,
          earned: true,
          earnedDate: '2024-01-15',
          points: 50,
          category: 'quizzes',
          progress: 100,
          difficulty: 'easy',
          streak: 0
        },
        {
          id: '2',
          title: 'Streak Starter',
          description: 'Study for 3 consecutive days',
          icon: Fire,
          earned: true,
          earnedDate: '2024-01-10',
          points: 100,
          category: 'consistency',
          progress: 100,
          difficulty: 'medium',
          streak: 3
        },
        {
          id: '3',
          title: 'Bookworm',
          description: 'Complete 5 lessons in one subject',
          icon: BookOpen,
          earned: true,
          earnedDate: '2024-01-12',
          points: 150,
          category: 'learning',
          progress: 100,
          difficulty: 'medium',
          streak: 0
        },
        {
          id: '4',
          title: 'Speed Demon',
          description: 'Complete a quiz in under 10 minutes',
          icon: Zap,
          earned: false,
          points: 200,
          category: 'quizzes',
          progress: 75,
          difficulty: 'hard',
          streak: 0
        },
        {
          id: '5',
          title: 'Community Builder',
          description: 'Join 3 study groups',
          icon: Users,
          earned: false,
          points: 125,
          category: 'community',
          progress: 60,
          difficulty: 'medium',
          streak: 0
        },
        {
          id: '6',
          title: 'Tech Explorer',
          description: 'Use the AI assistant 10 times',
          icon: Brain,
          earned: false,
          points: 75,
          category: 'technology',
          progress: 40,
          difficulty: 'easy',
          streak: 0
        },
        {
          id: '7',
          title: 'Perfectionist',
          description: 'Score 100% on 3 quizzes',
          icon: Trophy,
          earned: false,
          points: 300,
          category: 'quizzes',
          progress: 30,
          difficulty: 'expert',
          streak: 0
        },
        {
          id: '8',
          title: 'Marathon Learner',
          description: 'Study for 10 hours in one week',
          icon: Clock,
          earned: false,
          points: 250,
          category: 'time',
          progress: 80,
          difficulty: 'hard',
          streak: 0
        }
      ];

      setAchievements(mockAchievements);
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    const matchesCategory = activeCategory === 'all' || achievement.category === activeCategory;
    return matchesCategory;
  });

  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    if (sortBy === 'points') {
      return b.points - a.points;
    } else if (sortBy === 'earned') {
      if (a.earned && b.earned) {
        return new Date(b.earnedDate) - new Date(a.earnedDate);
      }
      return a.earned ? -1 : 1;
    } else if (sortBy === 'difficulty') {
      const difficultyOrder = { easy: 1, medium: 2, hard: 3, expert: 4 };
      return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty];
    } else {
      return b.progress - a.progress;
    }
  });

  const earnedAchievements = achievements.filter(a => a.earned);
  const totalPoints = achievements.reduce((sum, achievement) => {
    if (achievement.earned) {
      return sum + achievement.points;
    }
    return sum;
  }, 0);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'expert': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressColor = (progress) => {
    if (progress === 100) return 'bg-gradient-to-r from-yellow-400 to-orange-500';
    if (progress >= 75) return 'bg-gradient-to-r from-green-400 to-blue-500';
    if (progress >= 50) return 'bg-gradient-to-r from-blue-400 to-purple-500';
    if (progress >= 25) return 'bg-gradient-to-r from-purple-400 to-pink-500';
    return 'bg-gradient-to-r from-gray-300 to-gray-400';
  };

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>

          {/* Filters */}
          <div className="mb-8">
            <div className="h-10 w-64 bg-gray-200 rounded-full animate-pulse mb-4"></div>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Achievements</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={fetchAchievements}
            className="bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white hover:from-mindboost-green/90 hover:to-mindboost-dark-green/90 rounded-full"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Achievements</h1>
              <p className="text-gray-600">Track your progress and celebrate your learning milestones</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-mindboost-green">
              <div className="flex items-center">
                <Trophy className="h-10 w-10 text-yellow-500 mr-4" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalPoints}</div>
                  <div className="text-gray-600">Total Points</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-mindboost-green to-mindboost-dark-green text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{earnedAchievements.length}</div>
                  <div className="text-mindboost-light-green">Achievements Earned</div>
                </div>
                <Trophy className="h-10 w-10 text-mindboost-light-green" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-mindboost-green to-mindboost-dark-green text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{achievements.length - earnedAchievements.length}</div>
                  <div className="text-mindboost-light-green">In Progress</div>
                </div>
                <Target className="h-10 w-10 text-mindboost-light-green" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-mindboost-cream to-mindboost-light-green text-gray-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {achievements.length > 0 ? Math.round((earnedAchievements.length / achievements.length) * 100) : 0}%
                  </div>
                  <div className="text-mindboost-dark-green">Completion</div>
                </div>
                <TrendingUp className="h-10 w-10 text-mindboost-dark-green" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Sort */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? 'default' : 'outline'}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center rounded-full ${activeCategory === category.id
                      ? 'bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white hover:from-mindboost-green/90 hover:to-mindboost-dark-green/90'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {category.name}
                  </Button>
                );
              })}
            </div>

            <div className="flex items-center">
              <span className="text-gray-700 mr-2">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mindboost-green"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAchievements.map((achievement) => {
            const Icon = iconMap[achievement.icon] || Trophy;
            return (
              <Card
                key={achievement.id}
                className={`border-0 shadow-xl hover:shadow-2xl transition-all rounded-2xl overflow-hidden ${achievement.earned
                  ? 'bg-white/80 backdrop-blur-sm border border-mindboost-green/20'
                  : 'bg-gray-50 border border-gray-200'
                  }`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl ${achievement.earned
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                      }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col items-end">
                      {achievement.earned ? (
                        <Badge className="bg-mindboost-green text-white border border-mindboost-dark-green mb-2">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Earned
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-gray-300 text-gray-600 mb-2">
                          In Progress
                        </Badge>
                      )}
                      <Badge className={getDifficultyColor(achievement.difficulty)}>
                        {achievement.difficulty}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                    {achievement.title}
                  </CardTitle>
                  <p className="text-gray-600 mb-4">{achievement.description}</p>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold text-gray-900">{achievement.progress}%</span>
                    </div>
                    <Progress
                      value={achievement.progress}
                      className="h-2 rounded-full"
                      indicatorClassName={getProgressColor(achievement.progress)}
                    />
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="font-semibold text-gray-900">{achievement.points} pts</span>
                    </div>
                    {achievement.streak > 0 && (
                      <div className="flex items-center bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                        <Fire className="h-3 w-3 mr-1" />
                        {achievement.streak} day streak
                      </div>
                    )}
                  </div>

                  {achievement.earned && achievement.earnedDate && (
                    <div className="text-sm text-gray-500 border-t border-gray-100 pt-3">
                      Earned on {new Date(achievement.earnedDate).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {sortedAchievements.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No achievements found</h3>
            <p className="text-gray-600 mb-6">Try selecting a different category</p>
            <Button
              onClick={() => setActiveCategory('all')}
              className="bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white hover:from-mindboost-green/90 hover:to-mindboost-dark-green/90 rounded-full"
            >
              View All Achievements
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}