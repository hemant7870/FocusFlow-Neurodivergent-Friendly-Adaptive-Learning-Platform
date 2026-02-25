import { IUser } from '@/models/User'

export class ProgressEngine {
  private static instance: ProgressEngine
  
  private constructor() {}

  static getInstance(): ProgressEngine {
    if (!ProgressEngine.instance) {
      ProgressEngine.instance = new ProgressEngine()
    }
    return ProgressEngine.instance
  }

  calculateLevel(points: number): number {
    // Level = 1 + sqrt(points / 100)
    return Math.floor(1 + Math.sqrt(points / 100))
  }

  checkBadges(user: IUser): string[] {
    const newBadges: string[] = []
    const currentBadges = new Set(user.gamification.badges)

    // Badge: First Steps
    if (user.gamification.points >= 100 && !currentBadges.has('First Steps')) {
      newBadges.push('First Steps')
    }

    // Badge: Focus Master
    if (user.progress.totalStudyTime >= 60 && !currentBadges.has('Focus Master')) {
      newBadges.push('Focus Master')
    }

    // Badge: Streak Keeper
    if (user.gamification.streak >= 7 && !currentBadges.has('Streak Keeper')) {
      newBadges.push('Streak Keeper')
    }

    return newBadges
  }

  updateProgress(user: IUser, activity: { type: string, duration: number, score: number }): Partial<IUser> {
    const pointsEarned = Math.floor(activity.duration * 1 + activity.score * 2)
    const newTotalPoints = user.gamification.points + pointsEarned
    const newLevel = this.calculateLevel(newTotalPoints)
    
    const newHistory = {
      date: new Date(),
      activity: activity.type,
      score: activity.score
    }

    // Check for new badges
    const tempUser = { ...user, gamification: { ...user.gamification, points: newTotalPoints }, progress: { ...user.progress, totalStudyTime: user.progress.totalStudyTime + activity.duration } } as IUser
    const newBadges = this.checkBadges(tempUser)

    return {
      gamification: {
        ...user.gamification,
        points: newTotalPoints,
        level: newLevel,
        badges: [...user.gamification.badges, ...newBadges]
      },
      progress: {
        ...user.progress,
        totalStudyTime: user.progress.totalStudyTime + activity.duration,
        history: [...user.progress.history, newHistory]
      }
    }
  }
}

export const progressEngine = ProgressEngine.getInstance()
