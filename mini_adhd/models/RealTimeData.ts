import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IRealTimeData extends Document {
  userId: mongoose.Types.ObjectId
  timestamp: Date
  dataType: 'attention' | 'engagement' | 'performance' | 'mood' | 'activity'
  value: number
  metadata?: {
    source?: string
    confidence?: number
    context?: string
    deviceInfo?: any
  }
}

const RealTimeDataSchema = new Schema<IRealTimeData>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  dataType: { 
    type: String, 
    enum: ['attention', 'engagement', 'performance', 'mood', 'activity'], 
    required: true 
  },
  value: { type: Number, required: true, min: 0, max: 1 },
  metadata: {
    source: String,
    confidence: { type: Number, min: 0, max: 1 },
    context: String,
    deviceInfo: Schema.Types.Mixed
  }
}, { timestamps: true })

// Index for efficient queries
RealTimeDataSchema.index({ userId: 1, timestamp: -1 })
RealTimeDataSchema.index({ userId: 1, dataType: 1, timestamp: -1 })

export const RealTimeData: Model<IRealTimeData> = mongoose.models.RealTimeData || mongoose.model<IRealTimeData>('RealTimeData', RealTimeDataSchema)
