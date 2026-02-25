import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId
  totalPoints: number
  level: number
  currentStreak: number
  longestStreak: number
  focusStreak: number
  learningStreak: number
  totalLearningTime: number // in minutes
  completedActivities: number
  highScores: {
    attention: number
    engagement: number
    performance: number
  }
  badges: string[]
  lastActiveDate: Date
  weeklyGoal: number
  dailyGoal: number
  achievements: mongoose.Types.ObjectId[]
}

const UserProgressSchema = new Schema<IUserProgress>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  totalPoints: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  focusStreak: { type: Number, default: 0 },
  learningStreak: { type: Number, default: 0 },
  totalLearningTime: { type: Number, default: 0 },
  completedActivities: { type: Number, default: 0 },
  highScores: {
    attention: { type: Number, default: 0 },
    engagement: { type: Number, default: 0 },
    performance: { type: Number, default: 0 }
  },
  badges: [String],
  lastActiveDate: { type: Date, default: Date.now },
  weeklyGoal: { type: Number, default: 300 }, // 5 hours per week
  dailyGoal: { type: Number, default: 60 }, // 1 hour per day
  achievements: [{ type: Schema.Types.ObjectId, ref: 'Achievement' }]
}, { timestamps: true })

// Index for efficient queries
UserProgressSchema.index({ userId: 1 })
UserProgressSchema.index({ totalPoints: -1 }) // For leaderboards

export const UserProgress: Model<IUserProgress> = mongoose.models.UserProgress || mongoose.model<IUserProgress>('UserProgress', UserProgressSchema)
