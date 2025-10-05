import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export class GamificationService {
    /**
     * Award achievement badges and rewards
     */
    async awardAchievement(userId, achievementId) {
        // Check if user already has this achievement
        const existingAchievement = await prisma.userAchievement.findFirst({
            where: {
                userId,
                achievementId
            }
        });

        if (existingAchievement) {
            throw new Error('User already has this achievement');
        }

        // Get achievement details
        const achievement = await prisma.achievement.findUnique({
            where: { id: achievementId }
        });

        if (!achievement) {
            throw new Error('Achievement not found');
        }

        // Award achievement to user
        const userAchievement = await prisma.userAchievement.create({
            data: {
                userId,
                achievementId,
                progress: 100 // Assuming completion
            }
        });

        return userAchievement;
    }

    /**
     * Get user's achievements
     */
    async getUserAchievements(userId) {
        const userAchievements = await prisma.userAchievement.findMany({
            where: { userId },
            include: {
                achievement: true
            },
            orderBy: { unlockedAt: 'desc' }
        });

        const allAchievements = await prisma.achievement.findMany({
            orderBy: { points: 'desc' }
        });

        const achievedIds = userAchievements.map(ua => ua.achievementId);
        const availableAchievements = allAchievements.filter(a => !achievedIds.includes(a.id));

        return {
            unlocked: userAchievements,
            available: availableAchievements,
            totalPoints: userAchievements.reduce((sum, ua) => sum + ua.achievement.points, 0)
        };
    }

    /**
     * Update user progress for an achievement
     */
    async updateUserAchievementProgress(userId, achievementId, progress) {
        // Check if user has this achievement
        let userAchievement = await prisma.userAchievement.findFirst({
            where: {
                userId,
                achievementId
            }
        });

        if (!userAchievement) {
            // Create new user achievement
            userAchievement = await prisma.userAchievement.create({
                data: {
                    userId,
                    achievementId,
                    progress: 0
                }
            });
        }

        // Update progress
        const updatedAchievement = await prisma.userAchievement.update({
            where: { id: userAchievement.id },
            data: {
                progress: Math.min(100, Math.max(0, progress)) // Clamp between 0 and 100
            }
        });

        // Check if achievement should be unlocked
        if (updatedAchievement.progress >= 100) {
            const fullyUnlocked = await prisma.userAchievement.update({
                where: { id: updatedAchievement.id },
                data: {
                    unlockedAt: new Date()
                }
            });

            // Send notification
            await this.sendAchievementNotification(userId, achievementId);

            return { ...fullyUnlocked, unlocked: true };
        }

        return { ...updatedAchievement, unlocked: false };
    }

    /**
     * Send achievement notification
     */
    async sendAchievementNotification(userId, achievementId) {
        try {
            const achievement = await prisma.achievement.findUnique({
                where: { id: achievementId }
            });

            if (achievement) {
                await prisma.notification.create({
                    data: {
                        userId,
                        title: 'New Achievement Unlocked!',
                        message: `Congratulations! You've earned the "${achievement.name}" achievement.`,
                        type: 'achievement'
                    }
                });
            }
        } catch (error) {
            console.error('Failed to send achievement notification:', error);
        }
    }

    /**
     * Get leaderboard
     */
    async getLeaderboard(limit = 10) {
        const topUsers = await prisma.userAchievement.groupBy({
            by: ['userId'],
            _sum: {
                achievement: {
                    points: true,
                },
            },
            orderBy: {
                _sum: {
                    achievement: {
                        points: 'desc',
                    },
                },
            },
            take: parseInt(limit),
        });

        const leaderboard = await Promise.all(
            topUsers.map(async (entry) => {
                const user = await prisma.user.findUnique({
                    where: { id: entry.userId },
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true
                    },
                });
                return {
                    userId: entry.userId,
                    name: `${user?.firstName} ${user?.lastName}`,
                    avatar: user?.avatar,
                    totalPoints: entry._sum.achievement?.points || 0,
                };
            })
        );

        return leaderboard;
    }

    /**
     * Update learning streak
     */
    async updateLearningStreak(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Check if user already has a streak record
        let streak = await prisma.learningStreak.findUnique({
            where: { userId }
        });

        if (!streak) {
            // Create new streak record
            streak = await prisma.learningStreak.create({
                data: {
                    userId,
                    currentStreak: 1,
                    longestStreak: 1,
                    lastActivityDate: today
                }
            });
        } else {
            // Check if user already logged activity today
            const lastActivity = new Date(streak.lastActivityDate);
            lastActivity.setHours(0, 0, 0, 0);

            if (lastActivity.getTime() === today.getTime()) {
                // Already logged today, no update needed
                return streak;
            }

            // Check if activity was yesterday (continuing streak)
            if (lastActivity.getTime() === yesterday.getTime()) {
                // Continue streak
                const newStreak = streak.currentStreak + 1;
                const longestStreak = Math.max(streak.longestStreak, newStreak);

                streak = await prisma.learningStreak.update({
                    where: { id: streak.id },
                    data: {
                        currentStreak: newStreak,
                        longestStreak,
                        lastActivityDate: today
                    }
                });
            } else if (lastActivity.getTime() < yesterday.getTime()) {
                // Streak broken, reset to 1
                streak = await prisma.learningStreak.update({
                    where: { id: streak.id },
                    data: {
                        currentStreak: 1,
                        lastActivityDate: today
                    }
                });
            }
        }

        // Check for streak achievements
        await this.checkStreakAchievements(userId, streak.currentStreak);

        return streak;
    }

    /**
     * Check for streak achievements
     */
    async checkStreakAchievements(userId, currentStreak) {
        // Define streak achievements
        const streakAchievements = [
            { days: 7, name: '7-Day Streak' },
            { days: 14, name: '14-Day Streak' },
            { days: 30, name: '30-Day Streak' },
            { days: 60, name: '60-Day Streak' },
            { days: 100, name: '100-Day Streak' }
        ];

        // Find matching achievement
        const matchingAchievement = streakAchievements.find(a => a.days === currentStreak);

        if (matchingAchievement) {
            // Find achievement in database
            const achievement = await prisma.achievement.findFirst({
                where: { name: matchingAchievement.name }
            });

            if (achievement) {
                try {
                    await this.awardAchievement(userId, achievement.id);
                } catch (error) {
                    // Achievement already awarded, ignore
                }
            }
        }
    }

    /**
     * Get user's learning streak
     */
    async getUserStreak(userId) {
        const streak = await prisma.learningStreak.findUnique({
            where: { userId }
        });

        if (!streak) {
            return {
                currentStreak: 0,
                longestStreak: 0,
                lastActivityDate: null
            };
        }

        return streak;
    }

    /**
     * Update daily goals progress
     */
    async updateDailyGoals(userId, goalType, progress) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if user already has a daily goal record for today
        let dailyGoal = await prisma.dailyGoal.findFirst({
            where: {
                userId,
                goalType,
                date: today
            }
        });

        if (!dailyGoal) {
            // Create new daily goal record
            dailyGoal = await prisma.dailyGoal.create({
                data: {
                    userId,
                    goalType,
                    target: this.getDefaultGoalTarget(goalType),
                    progress: 0,
                    date: today
                }
            });
        }

        // Update progress
        const newProgress = Math.min(dailyGoal.target, dailyGoal.progress + progress);
        const completed = newProgress >= dailyGoal.target;

        const updatedGoal = await prisma.dailyGoal.update({
            where: { id: dailyGoal.id },
            data: {
                progress: newProgress,
                completed,
                completedAt: completed ? new Date() : null
            }
        });

        // If goal is completed, award achievement points
        if (completed) {
            await this.awardDailyGoalAchievement(userId, goalType);
        }

        return updatedGoal;
    }

    /**
     * Get default goal target based on goal type
     */
    getDefaultGoalTarget(goalType) {
        const targets = {
            'QUIZ_QUESTIONS': 20,
            'STUDY_MINUTES': 30,
            'FLASHCARDS_REVIEWED': 10,
            'LESSONS_COMPLETED': 1,
            'PRACTICE_QUIZZES': 1
        };

        return targets[goalType] || 10;
    }

    /**
     * Award achievement points for completing daily goals
     */
    async awardDailyGoalAchievement(userId, goalType) {
        // Award virtual currency or points
        const pointsAwarded = {
            'QUIZ_QUESTIONS': 10,
            'STUDY_MINUTES': 5,
            'FLASHCARDS_REVIEWED': 15,
            'LESSONS_COMPLETED': 25,
            'PRACTICE_QUIZZES': 20
        };

        const points = pointsAwarded[goalType] || 10;

        // Update user's total points (you might want to store this in a separate table)
        // For now, we'll just log it and send a notification

        try {
            await prisma.notification.create({
                data: {
                    userId,
                    title: 'Daily Goal Completed!',
                    message: `Great job! You've completed your daily ${goalType.toLowerCase().replace('_', ' ')} goal and earned ${points} points.`,
                    type: 'achievement'
                }
            });
        } catch (error) {
            console.error('Failed to send daily goal notification:', error);
        }
    }

    /**
     * Get user's daily goals for today
     */
    async getUserDailyGoals(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const goals = await prisma.dailyGoal.findMany({
            where: {
                userId,
                date: today
            }
        });

        // Add any missing default goals
        const defaultGoals = [
            'QUIZ_QUESTIONS',
            'STUDY_MINUTES',
            'FLASHCARDS_REVIEWED',
            'LESSONS_COMPLETED',
            'PRACTICE_QUIZZES'
        ];

        const existingGoalTypes = goals.map(g => g.goalType);
        const missingGoals = defaultGoals.filter(type => !existingGoalTypes.includes(type));

        // Create missing goals
        for (const goalType of missingGoals) {
            const newGoal = await prisma.dailyGoal.create({
                data: {
                    userId,
                    goalType,
                    target: this.getDefaultGoalTarget(goalType),
                    progress: 0,
                    date: today
                }
            });
            goals.push(newGoal);
        }

        return goals;
    }

    /**
     * Get virtual currency balance
     */
    async getVirtualCurrencyBalance(userId) {
        // This would typically query a virtual currency table
        // For now, we'll return a placeholder value
        return {
            balance: 1000, // Placeholder
            currencyName: 'MindCoins'
        };
    }

    /**
     * Award virtual currency
     */
    async awardVirtualCurrency(userId, amount, reason) {
        // This would typically update a virtual currency table
        // For now, we'll just send a notification

        try {
            await prisma.notification.create({
                data: {
                    userId,
                    title: 'Currency Awarded!',
                    message: `You've been awarded ${amount} MindCoins for ${reason}.`,
                    type: 'currency'
                }
            });
        } catch (error) {
            console.error('Failed to send currency notification:', error);
        }

        return {
            success: true,
            amount,
            reason
        };
    }
}