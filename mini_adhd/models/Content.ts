import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IContent extends Document {
  title: string
  description: string
  type: 'lesson' | 'exercise' | 'game' | 'assessment' | 'break_activity'
  category: 'math' | 'reading' | 'science' | 'social' | 'attention' | 'memory'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedDuration: number // in minutes
  content: {
    text?: string
    images?: string[] // URLs to images
    videos?: string[] // URLs to videos
    audio?: string[] // URLs to audio files
    interactive?: any // JSON for interactive elements
  }
  metadata: {
    tags: string[]
    ageRange: { min: number; max: number }
    adhdFriendly: boolean
    attentionLevel: number // 0-1, how much attention this content requires
    engagementScore: number // 0-1, predicted engagement
    accessibility: {
      visual: boolean
      auditory: boolean
      kinesthetic: boolean
    }
  }
  analytics: {
    totalViews: number
    averageRating: number
    completionRate: number
    averageTimeSpent: number
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const ContentSchema = new Schema<IContent>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['lesson', 'exercise', 'game', 'assessment', 'break_activity'],
    required: true 
  },
  category: { 
    type: String, 
    enum: ['math', 'reading', 'science', 'social', 'attention', 'memory'],
    required: true 
  },
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true 
  },
  estimatedDuration: { type: Number, required: true },
  content: {
    text: String,
    images: [String],
    videos: [String],
    audio: [String],
    interactive: Schema.Types.Mixed
  },
  metadata: {
    tags: [String],
    ageRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true }
    },
    adhdFriendly: { type: Boolean, default: true },
    attentionLevel: { type: Number, min: 0, max: 1, default: 0.5 },
    engagementScore: { type: Number, min: 0, max: 1, default: 0.5 },
    accessibility: {
      visual: { type: Boolean, default: true },
      auditory: { type: Boolean, default: true },
      kinesthetic: { type: Boolean, default: true }
    }
  },
  analytics: {
    totalViews: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    averageTimeSpent: { type: Number, default: 0 }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

// Indexes for efficient queries
ContentSchema.index({ type: 1, category: 1, difficulty: 1 })
ContentSchema.index({ 'metadata.tags': 1 })
ContentSchema.index({ isActive: 1 })

export const Content: Model<IContent> = mongoose.models.Content || mongoose.model<IContent>('Content', ContentSchema)
