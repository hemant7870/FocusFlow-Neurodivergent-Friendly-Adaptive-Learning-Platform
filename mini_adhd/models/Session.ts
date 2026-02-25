import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId
  attentionData: Array<{ t: Date; level: number }>
}

const SessionSchema = new Schema<ISession>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  attentionData: [{
    t: { type: Date, default: Date.now },
    level: { type: Number, min: 0, max: 1, required: true },
  }],
}, { timestamps: true })

export const Session: Model<ISession> = mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema)

