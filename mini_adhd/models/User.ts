import mongoose, { Schema, Document, Model } from 'mongoose'

export type UserRole = 'Student' | 'Parent' | 'Educator' | 'Admin'

export interface UserPreferences {
  fontSize?: string
  backgroundColor?: string
  contrast?: string
  spacing?: string
  preferredMode?: 'text' | 'visual' | 'audio'
  speechSpeed?: number
  animationEnabled?: boolean
}

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: UserRole
  adhdScore?: number
  linkedUsers?: string[]
  preferences: UserPreferences
  gamification: {
    points: number
    level: number
    streak: number
    badges: string[]
  }
  progress: {
    modulesCompleted: number
    totalStudyTime: number // in minutes
    history: {
      date: Date
      activity: string
      score: number
    }[]
    completedModules: string[]
  }
  createdAt: Date
  updatedAt: Date
}

const PreferencesSchema = new Schema<UserPreferences>({
  fontSize: { type: String, default: 'medium' },
  backgroundColor: { type: String, default: '#f8fafc' },
  contrast: { type: String, default: 'normal' },
  spacing: { type: String, default: 'normal' },
  preferredMode: { type: String, enum: ['text', 'visual', 'audio'], default: 'text' },
  speechSpeed: { type: Number, default: 1.0 },
  animationEnabled: { type: Boolean, default: true },
}, { _id: false })

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Student', 'Parent', 'Educator', 'Admin'], required: true },
  adhdScore: { type: Number, min: 0, max: 100 },
  linkedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  preferences: { type: PreferencesSchema, default: {} },
  gamification: {
    points: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    badges: [{ type: String }]
  },
  progress: {
    modulesCompleted: { type: Number, default: 0 },
    totalStudyTime: { type: Number, default: 0 },
    history: [{
      date: { type: Date, default: Date.now },
      activity: String,
      score: Number
    }],
    completedModules: [{ type: String }]
  }
}, { timestamps: true })

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

