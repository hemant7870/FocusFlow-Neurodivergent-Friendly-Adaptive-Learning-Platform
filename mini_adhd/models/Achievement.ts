import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAchievement extends Document {
  userId: mongoose.Types.ObjectId
  achievementType: 'focus_streak' | 'learning_streak' | 'high_score' | 'completion' | 'engagement' | 'improvement'
  title: string
  description: string
  icon: string
  points: number
  unlockedAt: Date
  metadata?: {
    streakCount?: number
    score?: number
    contentId?: string
    category?: string
  }
}

const AchievementSchema = new Schema<IAchievement>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  achievementType: { 
    type: String, 
    enum: ['focus_streak', 'learning_streak', 'high_score', 'completion', 'engagement', 'improvement'],
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  points: { type: Number, required: true, default: 10 },
  unlockedAt: { type: Date, default: Date.now },
  metadata: {
    streakCount: Number,
    score: Number,
    contentId: String,
    category: String
  }
}, { timestamps: true })

// Index for efficient queries
AchievementSchema.index({ userId: 1, unlockedAt: -1 })
AchievementSchema.index({ userId: 1, achievementType: 1 })

export const Achievement: Model<IAchievement> = mongoose.models.Achievement || mongoose.model<IAchievement>('Achievement', AchievementSchema)
