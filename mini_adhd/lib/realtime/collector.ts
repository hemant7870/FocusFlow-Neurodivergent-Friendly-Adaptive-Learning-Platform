import { RealTimeData } from '@/models/RealTimeData'
import { connectToDatabase } from '@/lib/db'

export interface DataPoint {
  userId: string
  dataType: 'attention' | 'engagement' | 'performance' | 'mood' | 'activity'
  value: number
  metadata?: {
    source?: string
    confidence?: number
    context?: string
    deviceInfo?: any
  }
}

export class RealTimeDataCollector {
  private static instance: RealTimeDataCollector
  private dataBuffer: DataPoint[] = []
  private flushInterval: NodeJS.Timeout | null = null
  private readonly BUFFER_SIZE = 50
  private readonly FLUSH_INTERVAL = 5000 // 5 seconds

  private constructor() {
    this.startFlushTimer()
  }

  static getInstance(): RealTimeDataCollector {
    if (!RealTimeDataCollector.instance) {
      RealTimeDataCollector.instance = new RealTimeDataCollector()
    }
    return RealTimeDataCollector.instance
  }

  async collectData(dataPoint: DataPoint): Promise<void> {
    this.dataBuffer.push(dataPoint)

    // Flush if buffer is full
    if (this.dataBuffer.length >= this.BUFFER_SIZE) {
      await this.flushBuffer()
    }
  }

  private startFlushTimer(): void {
    this.flushInterval = setInterval(async () => {
      if (this.dataBuffer.length > 0) {
        await this.flushBuffer()
      }
    }, this.FLUSH_INTERVAL)
  }

  private async flushBuffer(): Promise<void> {
    if (this.dataBuffer.length === 0) return

    try {
      await connectToDatabase()
      
      const dataToSave = this.dataBuffer.map(point => ({
        userId: point.userId,
        timestamp: new Date(),
        dataType: point.dataType,
        value: point.value,
        metadata: point.metadata
      }))

      await RealTimeData.insertMany(dataToSave)
      this.dataBuffer = []
      
      console.log(`Flushed ${dataToSave.length} data points to database`)
    } catch (error) {
      console.error('Failed to flush data buffer:', error)
      // Keep data in buffer for retry
    }
  }

  // Simulate real-time data collection from various sources
  async simulateAttentionData(userId: string, adhdScore?: number): Promise<number> {
    // Simulate attention based on time of day, user patterns, and ADHD characteristics
    const now = new Date()
    const hour = now.getHours()
    const minute = now.getMinutes()
    
    // Base attention varies by time of day
    let baseAttention = 0.5
    if (hour >= 9 && hour <= 11) baseAttention = 0.8 // Morning peak
    else if (hour >= 14 && hour <= 16) baseAttention = 0.7 // Afternoon
    else if (hour >= 19 && hour <= 21) baseAttention = 0.6 // Evening
    else baseAttention = 0.4 // Other times

    // ADHD-specific adjustments
    if (adhdScore && adhdScore > 70) {
      // ADHD students often have more variable attention patterns
      const adhdVariation = (Math.random() - 0.5) * 0.4 // More variation
      
      // Hyperfocus periods (random but more likely during preferred times)
      if (Math.random() < 0.15) { // 15% chance of hyperfocus
        baseAttention = Math.min(0.95, baseAttention + 0.3)
      }
      
      // Attention drops more frequently
      if (Math.random() < 0.2) { // 20% chance of attention drop
        baseAttention = Math.max(0.2, baseAttention - 0.4)
      }
      
      baseAttention += adhdVariation
    } else {
      // Standard variation for non-ADHD students
      const variation = (Math.random() - 0.5) * 0.3
      baseAttention += variation
    }

    const attention = Math.max(0, Math.min(1, baseAttention))

    await this.collectData({
      userId,
      dataType: 'attention',
      value: attention,
      metadata: {
        source: 'simulated',
        confidence: adhdScore && adhdScore > 70 ? 0.9 : 0.8, // Higher confidence for ADHD patterns
        context: `Time: ${hour}:${minute.toString().padStart(2, '0')}, ADHD: ${adhdScore || 'unknown'}`
      }
    })

    return attention
  }

  async simulateEngagementData(userId: string, activityType: string, adhdScore?: number): Promise<number> {
    // Simulate engagement based on activity type and ADHD preferences
    const engagementMap: { [key: string]: number } = {
      'math': 0.6,
      'reading': 0.7,
      'game': 0.9,
      'video': 0.8,
      'quiz': 0.5,
      'break': 0.3,
      'interactive': 0.95, // ADHD students often prefer interactive content
      'visual': 0.85,
      'kinesthetic': 0.9,
      'auditory': 0.7
    }

    let baseEngagement = engagementMap[activityType] || 0.5

    // ADHD-specific engagement patterns
    if (adhdScore && adhdScore > 70) {
      // ADHD students often have higher engagement with interactive, visual, and kinesthetic activities
      if (['interactive', 'visual', 'kinesthetic', 'game'].includes(activityType)) {
        baseEngagement += 0.1 // Boost for preferred activity types
      }
      
      // More variable engagement patterns
      const variation = (Math.random() - 0.5) * 0.3
      baseEngagement += variation
      
      // Occasional hyperfocus on preferred activities
      if (['interactive', 'game', 'visual'].includes(activityType) && Math.random() < 0.2) {
        baseEngagement = Math.min(0.98, baseEngagement + 0.2)
      }
    } else {
      const variation = (Math.random() - 0.5) * 0.2
      baseEngagement += variation
    }

    const engagement = Math.max(0, Math.min(1, baseEngagement))

    await this.collectData({
      userId,
      dataType: 'engagement',
      value: engagement,
      metadata: {
        source: 'simulated',
        confidence: adhdScore && adhdScore > 70 ? 0.85 : 0.7,
        context: `Activity: ${activityType}, ADHD: ${adhdScore || 'unknown'}`
      }
    })

    return engagement
  }

  async simulatePerformanceData(userId: string, taskDifficulty: number): Promise<number> {
    // Simulate performance based on task difficulty and user ability
    const userAbility = 0.6 // This could be learned from historical data
    const difficulty = taskDifficulty
    
    // Performance decreases as difficulty increases beyond user ability
    let performance = userAbility - (difficulty - userAbility) * 0.5
    performance = Math.max(0, Math.min(1, performance))
    
    // Add some realistic variation
    const variation = (Math.random() - 0.5) * 0.15
    performance = Math.max(0, Math.min(1, performance + variation))

    await this.collectData({
      userId,
      dataType: 'performance',
      value: performance,
      metadata: {
        source: 'simulated',
        confidence: 0.75,
        context: `Difficulty: ${difficulty}`
      }
    })

    return performance
  }

  async simulateMoodData(userId: string): Promise<number> {
    // Simulate mood based on recent performance and engagement
    const now = new Date()
    const dayOfWeek = now.getDay()
    
    // Mood tends to be better on weekdays and worse on Mondays
    let baseMood = 0.6
    if (dayOfWeek === 1) baseMood = 0.4 // Monday
    else if (dayOfWeek >= 1 && dayOfWeek <= 5) baseMood = 0.7 // Weekdays
    else baseMood = 0.8 // Weekend

    const variation = (Math.random() - 0.5) * 0.3
    const mood = Math.max(0, Math.min(1, baseMood + variation))

    await this.collectData({
      userId,
      dataType: 'mood',
      value: mood,
      metadata: {
        source: 'simulated',
        confidence: 0.6,
        context: `Day: ${dayOfWeek}`
      }
    })

    return mood
  }

  async getRecentData(userId: string, dataType: string, minutes: number = 30): Promise<any[]> {
    try {
      await connectToDatabase()
      
      const since = new Date(Date.now() - minutes * 60 * 1000)
      const data = await RealTimeData.find({
        userId,
        dataType,
        timestamp: { $gte: since }
      }).sort({ timestamp: -1 }).limit(100)

      return data
    } catch (error) {
      console.error('Failed to get recent data:', error)
      return []
    }
  }

  async getDataSummary(userId: string, hours: number = 24): Promise<any> {
    try {
      await connectToDatabase()
      
      const since = new Date(Date.now() - hours * 60 * 60 * 1000)
      const data = await RealTimeData.find({
        userId,
        timestamp: { $gte: since }
      }).sort({ timestamp: -1 })

      // Group by data type and calculate averages
      const summary: { [key: string]: any } = {}
      
      const dataTypes = ['attention', 'engagement', 'performance', 'mood', 'activity']
      
      dataTypes.forEach(type => {
        const typeData = data.filter(d => d.dataType === type)
        if (typeData.length > 0) {
          const values = typeData.map(d => d.value)
          summary[type] = {
            average: values.reduce((a, b) => a + b, 0) / values.length,
            min: Math.min(...values),
            max: Math.max(...values),
            count: values.length,
            trend: this.calculateTrend(values)
          }
        }
      })

      return summary
    } catch (error) {
      console.error('Failed to get data summary:', error)
      return {}
    }
  }

  private calculateTrend(values: number[]): 'up' | 'down' | 'stable' {
    if (values.length < 2) return 'stable'
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2))
    const secondHalf = values.slice(Math.floor(values.length / 2))
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
    
    const diff = secondAvg - firstAvg
    
    if (diff > 0.1) return 'up'
    if (diff < -0.1) return 'down'
    return 'stable'
  }

  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }
    this.flushBuffer() // Final flush
  }
}

export const dataCollector = RealTimeDataCollector.getInstance()
