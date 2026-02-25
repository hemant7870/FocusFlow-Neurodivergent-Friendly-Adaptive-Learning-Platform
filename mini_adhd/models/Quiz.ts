import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IQuiz extends Document {
  userId: mongoose.Types.ObjectId
  lessonId: string
  topic: string
  question: string
  difficulty: string // 'easy' | 'medium' | 'hard'
  correct?: boolean
  score?: number // 0..1
  timeSpent: number // in seconds
  attentionData: number // 0..1
  adhdLevel: 'Low' | 'Moderate' | 'High'
}

const QuizSchema = new Schema<IQuiz>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lessonId: { type: String, required: true },
  topic: { type: String, required: true },
  question: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  correct: { type: Boolean },
  score: { type: Number, min: 0, max: 1 },
  timeSpent: { type: Number, default: 0 },
  attentionData: { type: Number, min: 0, max: 1, default: 0.8 },
  adhdLevel: { type: String, enum: ['Low', 'Moderate', 'High'], required: true },
}, { timestamps: true })

export const Quiz: Model<IQuiz> = mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema)

