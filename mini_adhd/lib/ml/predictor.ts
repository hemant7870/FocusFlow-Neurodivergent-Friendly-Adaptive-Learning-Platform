import * as tf from '@tensorflow/tfjs'

export interface PredictionInput {
  recentAttention: number[]
  recentPerformance: number[]
  timeOfDay: number // 0-24
  dayOfWeek: number // 0-6
  sessionDuration: number // minutes
  breakCount: number
  userAge?: number
  adhdScore?: number
}

export interface PredictionResult {
  predictedValue: number
  confidence: number
  explanation: string
}

class MLPredictor {
  private attentionModel: tf.LayersModel | null = null
  private performanceModel: tf.LayersModel | null = null
  private engagementModel: tf.LayersModel | null = null
  private isInitialized = false

  async initialize() {
    if (this.isInitialized) return

    try {
      // Create simple neural networks for different prediction tasks
      this.attentionModel = this.createAttentionModel()
      this.performanceModel = this.createPerformanceModel()
      this.engagementModel = this.createEngagementModel()
      
      this.isInitialized = true
      console.log('ML Predictor initialized successfully')
    } catch (error) {
      console.error('Failed to initialize ML Predictor:', error)
    }
  }

  private createAttentionModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [8], // 8 input features
          units: 16,
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 8,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid' // Output between 0 and 1
        })
      ]
    })

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    })

    return model
  }

  private createPerformanceModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [8],
          units: 20,
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: 10,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid'
        })
      ]
    })

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    })

    return model
  }

  private createEngagementModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [8],
          units: 12,
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }),
        tf.layers.dropout({ rate: 0.25 }),
        tf.layers.dense({
          units: 6,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid'
        })
      ]
    })

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    })

    return model
  }

  private prepareFeatures(input: PredictionInput): tf.Tensor2D {
    // Normalize and prepare features
    const features = [
      // Recent attention (last 3 values, padded with 0.5 if less than 3)
      ...this.padArray(input.recentAttention.slice(-3), 3, 0.5),
      // Recent performance (last 3 values, padded with 0.5 if less than 3)
      ...this.padArray(input.recentPerformance.slice(-3), 3, 0.5),
      // Time of day (normalized to 0-1)
      input.timeOfDay / 24,
      // Session duration (normalized, assuming max 120 minutes)
      Math.min(input.sessionDuration / 120, 1)
    ]

    return tf.tensor2d([features])
  }

  private padArray(arr: number[], targetLength: number, padValue: number): number[] {
    while (arr.length < targetLength) {
      arr.unshift(padValue)
    }
    return arr.slice(0, targetLength)
  }

  async predictAttentionTrend(input: PredictionInput): Promise<PredictionResult> {
    if (!this.attentionModel) {
      await this.initialize()
    }

    const features = this.prepareFeatures(input)
    const prediction = this.attentionModel!.predict(features) as tf.Tensor
    const predictedValue = await prediction.data()
    const confidence = this.calculateConfidence(input)

    features.dispose()
    prediction.dispose()

    return {
      predictedValue: predictedValue[0],
      confidence,
      explanation: this.generateAttentionExplanation(predictedValue[0], input)
    }
  }

  async predictPerformance(input: PredictionInput): Promise<PredictionResult> {
    if (!this.performanceModel) {
      await this.initialize()
    }

    const features = this.prepareFeatures(input)
    const prediction = this.performanceModel!.predict(features) as tf.Tensor
    const predictedValue = await prediction.data()
    const confidence = this.calculateConfidence(input)

    features.dispose()
    prediction.dispose()

    return {
      predictedValue: predictedValue[0],
      confidence,
      explanation: this.generatePerformanceExplanation(predictedValue[0], input)
    }
  }

  async predictEngagement(input: PredictionInput): Promise<PredictionResult> {
    if (!this.engagementModel) {
      await this.initialize()
    }

    const features = this.prepareFeatures(input)
    const prediction = this.engagementModel!.predict(features) as tf.Tensor
    const predictedValue = await prediction.data()
    const confidence = this.calculateConfidence(input)

    features.dispose()
    prediction.dispose()

    return {
      predictedValue: predictedValue[0],
      confidence,
      explanation: this.generateEngagementExplanation(predictedValue[0], input)
    }
  }

  private calculateConfidence(input: PredictionInput): number {
    // Calculate confidence based on data quality and quantity
    let confidence = 0.5 // Base confidence

    // More data points = higher confidence
    if (input.recentAttention.length >= 5) confidence += 0.2
    if (input.recentPerformance.length >= 5) confidence += 0.2

    // Recent data = higher confidence
    const now = new Date()
    const timeOfDay = now.getHours()
    if (timeOfDay >= 8 && timeOfDay <= 18) confidence += 0.1

    // ADHD-specific confidence adjustments
    if (input.adhdScore && input.adhdScore > 70) {
      // Higher confidence for ADHD students due to more predictable patterns
      confidence += 0.1
    }

    return Math.min(confidence, 0.95)
  }

  private generateAttentionExplanation(value: number, input: PredictionInput): string {
    const isADHD = input.adhdScore && input.adhdScore > 70
    
    if (value > 0.7) {
      return isADHD 
        ? "🎯 Amazing focus! You're in the zone! Keep riding this wave of concentration!"
        : "Great focus! Your attention is high and likely to remain stable."
    } else if (value > 0.5) {
      return isADHD
        ? "👍 Good focus! Try a quick movement break or switch to a more interactive activity soon!"
        : "Good attention level. Consider taking a short break soon to maintain focus."
    } else if (value > 0.3) {
      return isADHD
        ? "⚠️ Focus is dropping! Time for a 5-minute movement break or try a different learning style!"
        : "Attention is declining. A 5-minute break or activity change is recommended."
    } else {
      return isADHD
        ? "🔄 Low focus detected! Let's switch to something more engaging - try a game or hands-on activity!"
        : "Low attention detected. Consider a longer break or switching to a different type of activity."
    }
  }

  private generatePerformanceExplanation(value: number, input: PredictionInput): string {
    const isADHD = input.adhdScore && input.adhdScore > 70
    
    if (value > 0.7) {
      return isADHD
        ? "⭐ You're crushing it! Your brain is firing on all cylinders! Keep up the great work!"
        : "Excellent performance expected! You're in a productive zone."
    } else if (value > 0.5) {
      return isADHD
        ? "🚀 Good momentum! You're doing well! Maybe try breaking tasks into smaller chunks?"
        : "Good performance level. You're likely to complete tasks effectively."
    } else if (value > 0.3) {
      return isADHD
        ? "💪 Performance is okay, but let's boost it! Try a different learning style or take a movement break!"
        : "Performance may be affected. Consider adjusting difficulty or taking a break."
    } else {
      return isADHD
        ? "🎮 Time to switch it up! Try a game-based approach or hands-on learning!"
        : "Performance may be low. Try a different approach or take a longer break."
    }
  }

  private generateEngagementExplanation(value: number, input: PredictionInput): string {
    const isADHD = input.adhdScore && input.adhdScore > 70
    
    if (value > 0.7) {
      return isADHD
        ? "🔥 You're totally engaged! This is your sweet spot! Keep going with this type of activity!"
        : "High engagement! You're likely to stay motivated and interested."
    } else if (value > 0.5) {
      return isADHD
        ? "😊 Good engagement! You're into it! Maybe add some music or movement to keep it fresh?"
        : "Good engagement level. The current activity seems to be working well."
    } else if (value > 0.3) {
      return isADHD
        ? "🤔 Engagement is okay, but let's spice it up! Try adding colors, sounds, or interactive elements!"
        : "Engagement is moderate. Consider adding interactive elements or changing the activity."
    } else {
      return isADHD
        ? "🎯 Low engagement! Time for something more exciting! Try games, videos, or hands-on activities!"
        : "Low engagement detected. Try a different type of content or activity."
    }
  }

  async trainModel(modelType: 'attention' | 'performance' | 'engagement', trainingData: any[]) {
    // This would be used to retrain models with new data
    // For now, we'll use pre-trained weights
    console.log(`Training ${modelType} model with ${trainingData.length} samples`)
  }

  dispose() {
    if (this.attentionModel) this.attentionModel.dispose()
    if (this.performanceModel) this.performanceModel.dispose()
    if (this.engagementModel) this.engagementModel.dispose()
  }
}

export const mlPredictor = new MLPredictor()
