import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPrediction extends Document {
  userId: mongoose.Types.ObjectId
  predictionType: 'attention_trend' | 'performance_forecast' | 'engagement_level' | 'optimal_break_time' | 'learning_style'
  predictedValue: number
  confidence: number
  timeHorizon: number // minutes into the future
  inputFeatures: {
    recentAttention: number[]
    recentPerformance: number[]
    timeOfDay: number
    dayOfWeek: number
    sessionDuration: number
    breakCount: number
  }
  actualValue?: number // for validation
  accuracy?: number // calculated accuracy
  createdAt: Date
}

const PredictionSchema = new Schema<IPrediction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  predictionType: { 
    type: String, 
    enum: ['attention_trend', 'performance_forecast', 'engagement_level', 'optimal_break_time', 'learning_style'],
    required: true 
  },
  predictedValue: { type: Number, required: true },
  confidence: { type: Number, required: true, min: 0, max: 1 },
  timeHorizon: { type: Number, required: true }, // in minutes
  inputFeatures: {
    recentAttention: [Number],
    recentPerformance: [Number],
    timeOfDay: Number,
    dayOfWeek: Number,
    sessionDuration: Number,
    breakCount: Number
  },
  actualValue: Number,
  accuracy: Number,
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true })

// Index for efficient queries
PredictionSchema.index({ userId: 1, predictionType: 1, createdAt: -1 })
PredictionSchema.index({ userId: 1, createdAt: -1 })

export const Prediction: Model<IPrediction> = mongoose.models.Prediction || mongoose.model<IPrediction>('Prediction', PredictionSchema)
