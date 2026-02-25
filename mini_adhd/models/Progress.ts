import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IProgress extends Document {
  userId: mongoose.Types.ObjectId
  lessonId: string
  completedLessons: number
  totalLessons: number
  attentionRate: number
  totalTime: number
  modeUsed: 'text' | 'visual' | 'audio'
  lastUpdated: Date
}

const ProgressSchema = new Schema<IProgress>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lessonId: { type: String, required: true },
  completedLessons: { type: Number, default: 0 },
  totalLessons: { type: Number, default: 0 },
  attentionRate: { type: Number, min: 0, max: 1, default: 0.8 },
  totalTime: { type: Number, default: 0 }, // in minutes
  modeUsed: { type: String, enum: ['text', 'visual', 'audio'], default: 'text' },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true })

export const Progress: Model<IProgress> = mongoose.models.Progress || mongoose.model<IProgress>('Progress', ProgressSchema)
