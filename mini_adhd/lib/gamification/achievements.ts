import { connectToDatabase } from '@/lib/db'
import { Achievement } from '@/models/Achievement'
import { UserProgress } from '@/models/UserProgress'
import mongoose from 'mongoose'

export interface AchievementCheck {
  userId: string
  dataType: 'attention' | 'engagement' | 'performance' | 'activity'
  value: number
  metadata?: any
}

export class AchievementSystem {
  private static instance: AchievementSystem

  static getInstance(): AchievementSystem {
    if (!AchievementSystem.instance) {
      AchievementSystem.instance = new AchievementSystem()
    }
    return AchievementSystem.instance
  }

  async checkAchievements(check: AchievementCheck): Promise<any[]> {
    await connectToDatabase()
    
    const newAchievements: any[] = []
    const userId = check.userId

    // Get user progress
    let userProgress = await UserProgress.findOne({ userId })
    if (!userProgress) {
      userProgress = await UserProgress.create({ userId })
    }

    // Check for various achievements
    const achievements = await Promise.all([
      this.checkFocusStreak(userId, check, userProgress),
      this.checkLearningStreak(userId, check, userProgress),
      this.checkHighScore(userId, check, userProgress),
      this.checkCompletion(userId, check, userProgress),
      this.checkEngagement(userId, check, userProgress),
      this.checkImprovement(userId, check, userProgress)
    ])

    // Filter out null achievements and add to array
    achievements.forEach(achievement => {
      if (achievement) {
        newAchievements.push(achievement)
      }
    })

    return newAchievements
  }

  private async checkFocusStreak(userId: string, check: AchievementCheck, userProgress: any): Promise<any> {
    if (check.dataType !== 'attention' || check.value < 0.7) return null

    // Check if user already has this achievement
    const existingAchievement = await Achievement.findOne({
      userId,
      achievementType: 'focus_streak',
      'metadata.streakCount': userProgress.focusStreak + 1
    })

    if (existingAchievement) return null

    userProgress.focusStreak += 1
    await userProgress.save()

    const streakCount = userProgress.focusStreak
    let achievement = null

    if (streakCount === 3) {
      achievement = await Achievement.create({
        userId,
        achievementType: 'focus_streak',
        title: '🎯 Focus Starter',
        description: '3 days of high focus! You\'re building great habits!',
        icon: '🎯',
        points: 50,
        metadata: { streakCount }
      })
    } else if (streakCount === 7) {
      achievement = await Achievement.create({
        userId,
        achievementType: 'focus_streak',
        title: '🔥 Focus Master',
        description: '7 days of high focus! You\'re on fire!',
        icon: '🔥',
        points: 100,
        metadata: { streakCount }
      })
    } else if (streakCount === 30) {
      achievement = await Achievement.create({
        userId,
        achievementType: 'focus_streak',
        title: '👑 Focus Legend',
        description: '30 days of high focus! You\'re a legend!',
        icon: '👑',
        points: 500,
        metadata: { streakCount }
      })
    }

    if (achievement) {
      userProgress.totalPoints += achievement.points
      userProgress.achievements.push(achievement._id)
      await userProgress.save()
    }

    return achievement
  }

  private async checkLearningStreak(userId: string, check: AchievementCheck, userProgress: any): Promise<any> {
    if (check.dataType !== 'activity') return null

    // Check if user already has this achievement
    const existingAchievement = await Achievement.findOne({
      userId,
      achievementType: 'learning_streak',
      'metadata.streakCount': userProgress.learningStreak + 1
    })

    if (existingAchievement) return null

    userProgress.learningStreak += 1
    await userProgress.save()

    const streakCount = userProgress.learningStreak
    let achievement = null

    if (streakCount === 5) {
      achievement = await Achievement.create({
        userId,
        achievementType: 'learning_streak',
        title: '📚 Learning Enthusiast',
        description: '5 days of learning! You\'re building momentum!',
        icon: '📚',
        points: 75,
        metadata: { streakCount }
      })
    } else if (streakCount === 14) {
      achievement = await Achievement.create({
        userId,
        achievementType: 'learning_streak',
        title: '🌟 Learning Champion',
        description: '2 weeks of learning! You\'re unstoppable!',
        icon: '🌟',
        points: 200,
        metadata: { streakCount }
      })
    } else if (streakCount === 30) {
      achievement = await Achievement.create({
        userId,
        achievementType: 'learning_streak',
        title: '🏆 Learning Legend',
        description: '30 days of learning! You\'re a true champion!',
        icon: '🏆',
        points: 1000,
        metadata: { streakCount }
      })
    }

    if (achievement) {
      userProgress.totalPoints += achievement.points
      userProgress.achievements.push(achievement._id)
      await userProgress.save()
    }

    return achievement
  }

  private async checkHighScore(userId: string, check: AchievementCheck, userProgress: any): Promise<any> {
    if (check.value < 0.9) return null

    const dataType = check.dataType
    const currentHigh = userProgress.highScores[dataType] || 0

    if (check.value <= currentHigh) return null

    userProgress.highScores[dataType] = check.value
    await userProgress.save()

    const achievement = await Achievement.create({
      userId,
      achievementType: 'high_score',
      title: `⭐ ${dataType.charAt(0).toUpperCase() + dataType.slice(1)} Master`,
      description: `New personal best in ${dataType}! You scored ${Math.round(check.value * 100)}%!`,
      icon: '⭐',
      points: 100,
      metadata: { score: check.value, category: dataType }
    })

    userProgress.totalPoints += achievement.points
    userProgress.achievements.push(achievement._id)
    await userProgress.save()

    return achievement
  }

  private async checkCompletion(userId: string, check: AchievementCheck, userProgress: any): Promise<any> {
    if (check.dataType !== 'activity' || !check.metadata?.contentId) return null

    userProgress.completedActivities += 1
    await userProgress.save()

    const completedCount = userProgress.completedActivities
    let achievement = null

    if (completedCount === 10) {
      achievement = await Achievement.create({
        userId,
        achievementType: 'completion',
        title: '🎮 Activity Explorer',
        description: 'Completed 10 activities! You\'re exploring and learning!',
        icon: '🎮',
        points: 100,
        metadata: { contentId: check.metadata.contentId }
      })
    } else if (completedCount === 50) {
      achievement = await Achievement.create({
        userId,
        achievementType: 'completion',
        title: '🚀 Activity Master',
        description: 'Completed 50 activities! You\'re a learning machine!',
        icon: '🚀',
        points: 300,
        metadata: { contentId: check.metadata.contentId }
      })
    } else if (completedCount === 100) {
      achievement = await Achievement.create({
        userId,
        achievementType: 'completion',
        title: '🏅 Activity Legend',
        description: 'Completed 100 activities! You\'re a true legend!',
        icon: '🏅',
        points: 1000,
        metadata: { contentId: check.metadata.contentId }
      })
    }

    if (achievement) {
      userProgress.totalPoints += achievement.points
      userProgress.achievements.push(achievement._id)
      await userProgress.save()
    }

    return achievement
  }

  private async checkEngagement(userId: string, check: AchievementCheck, userProgress: any): Promise<any> {
    if (check.dataType !== 'engagement' || check.value < 0.8) return null

    const achievement = await Achievement.create({
      userId,
      achievementType: 'engagement',
      title: '🔥 Engagement Fire',
      description: 'Super high engagement! You\'re totally into this!',
      icon: '🔥',
      points: 50,
      metadata: { score: check.value }
    })

    userProgress.totalPoints += achievement.points
    userProgress.achievements.push(achievement._id)
    await userProgress.save()

    return achievement
  }

  private async checkImprovement(userId: string, check: AchievementCheck, userProgress: any): Promise<any> {
    // This would check for improvement over time
    // For now, we'll create a simple improvement check
    if (check.value > 0.8) {
      const achievement = await Achievement.create({
        userId,
        achievementType: 'improvement',
        title: '📈 Improvement Star',
        description: 'Great improvement! You\'re getting better every day!',
        icon: '📈',
        points: 75,
        metadata: { score: check.value }
      })

      userProgress.totalPoints += achievement.points
      userProgress.achievements.push(achievement._id)
      await userProgress.save()

      return achievement
    }

    return null
  }

  async getUserProgress(userId: string): Promise<any> {
    await connectToDatabase()
    
    let userProgress = await UserProgress.findOne({ userId })
    if (!userProgress) {
      userProgress = await UserProgress.create({ userId })
    }

    const achievements = await Achievement.find({ userId })
      .sort({ unlockedAt: -1 })
      .limit(10)

    return {
      ...userProgress.toObject(),
      recentAchievements: achievements
    }
  }

  async getImprovementStats(userId: string): Promise<any> {
    await connectToDatabase()
    
    // Get last 7 days of progress
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { Progress } = await import('@/models/Progress')

    const dailyStats = await Progress.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          lastUpdated: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$lastUpdated" } },
          avgAttention: { $avg: "$attentionRate" },
          totalTime: { $sum: "$totalTime" },
          completedCount: { $sum: "$completedLessons" }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // Fill in missing days
    const labels = []
    const attention = []
    const focus = [] 
    const quiz = [] 

    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }))

      const stat = dailyStats.find((s: any) => s._id === dateStr)
      if (stat) {
        attention.push(Math.round(stat.avgAttention * 100))
        focus.push(Math.min(100, stat.totalTime * 2)) 
        quiz.push(Math.min(100, stat.completedCount * 20)) 
      } else {
        attention.push(0)
        focus.push(0)
        quiz.push(0)
      }
    }

    return { labels, attention, focus, quiz }
  }

  async getLeaderboard(limit: number = 10): Promise<any[]> {
    await connectToDatabase()
    
    return await UserProgress.find()
      .populate('userId', 'name')
      .sort({ totalPoints: -1 })
      .limit(limit)
  }
}

export const achievementSystem = AchievementSystem.getInstance()
