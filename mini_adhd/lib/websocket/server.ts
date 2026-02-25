import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { connectToDatabase } from '@/lib/db'
import { RealTimeData } from '@/models/RealTimeData'
import { Prediction } from '@/models/Prediction'
import { dataCollector } from '@/lib/realtime/collector'
import { mlPredictor } from '@/lib/ml/predictor'

export class WebSocketManager {
  private io: SocketIOServer
  private connectedUsers: Map<string, string> = new Map() // socketId -> userId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000'],
        methods: ['GET', 'POST']
      }
    })

    this.setupEventHandlers()
    this.startDataBroadcasting()
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`)

      // Handle user authentication
      socket.on('authenticate', (data: { userId: string }) => {
        this.connectedUsers.set(socket.id, data.userId)
        console.log(`User ${data.userId} authenticated with socket ${socket.id}`)
        
        // Join user to their personal room
        socket.join(`user:${data.userId}`)
        
        // Send initial data
        this.sendInitialData(data.userId, socket)
      })

      // Handle real-time data collection
      socket.on('collect_data', async (data: { dataType: string; value: number; metadata?: any }) => {
        const userId = this.connectedUsers.get(socket.id)
        if (!userId) {
          socket.emit('error', { message: 'Not authenticated' })
          return
        }

        try {
          await dataCollector.collectData({
            userId,
            dataType: data.dataType as any,
            value: data.value,
            metadata: data.metadata
          })

          // Broadcast to user's room
          this.io.to(`user:${userId}`).emit('data_collected', {
            dataType: data.dataType,
            value: data.value,
            timestamp: new Date().toISOString()
          })
        } catch (error) {
          socket.emit('error', { message: 'Failed to collect data' })
        }
      })

      // Handle prediction requests
      socket.on('request_prediction', async (data: { predictionType: string; timeHorizon?: number }) => {
        const userId = this.connectedUsers.get(socket.id)
        if (!userId) {
          socket.emit('error', { message: 'Not authenticated' })
          return
        }

        try {
          const prediction = await this.makePrediction(userId, data.predictionType, data.timeHorizon || 15)
          socket.emit('prediction_result', prediction)
        } catch (error) {
          socket.emit('error', { message: 'Failed to make prediction' })
        }
      })

      // Handle content interaction
      socket.on('content_interaction', async (data: { contentId: string; action: string; metadata?: any }) => {
        const userId = this.connectedUsers.get(socket.id)
        if (!userId) {
          socket.emit('error', { message: 'Not authenticated' })
          return
        }

        try {
          await dataCollector.collectData({
            userId,
            dataType: 'activity',
            value: 1,
            metadata: {
              source: 'content_interaction',
              context: `Content: ${data.contentId}, Action: ${data.action}`,
              ...data.metadata
            }
          })

          // Broadcast engagement update
          this.io.to(`user:${userId}`).emit('engagement_update', {
            contentId: data.contentId,
            action: data.action,
            timestamp: new Date().toISOString()
          })
        } catch (error) {
          socket.emit('error', { message: 'Failed to track interaction' })
        }
      })

      // Handle disconnect
      socket.on('disconnect', () => {
        const userId = this.connectedUsers.get(socket.id)
        if (userId) {
          console.log(`User ${userId} disconnected`)
          this.connectedUsers.delete(socket.id)
        }
      })
    })
  }

  private async sendInitialData(userId: string, socket: any) {
    try {
      await connectToDatabase()

      // Get recent data
      const recentData = await RealTimeData.find({ userId })
        .sort({ timestamp: -1 })
        .limit(50)

      // Get recent predictions
      const recentPredictions = await Prediction.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10)

      // Get data summary
      const summary = await dataCollector.getDataSummary(userId, 24)

      socket.emit('initial_data', {
        recentData,
        recentPredictions,
        summary
      })
    } catch (error) {
      console.error('Error sending initial data:', error)
      socket.emit('error', { message: 'Failed to load initial data' })
    }
  }

  private async makePrediction(userId: string, predictionType: string, timeHorizon: number) {
    try {
      await connectToDatabase()

      // Get recent data for predictions
      const recentAttention = await dataCollector.getRecentData(userId, 'attention', 30)
      const recentPerformance = await dataCollector.getRecentData(userId, 'performance', 30)

      const now = new Date()
      const input = {
        recentAttention: recentAttention.map(d => d.value),
        recentPerformance: recentPerformance.map(d => d.value),
        timeOfDay: now.getHours(),
        dayOfWeek: now.getDay(),
        sessionDuration: 30,
        breakCount: 2
      }

      let prediction: any
      switch (predictionType) {
        case 'attention_trend':
          prediction = await mlPredictor.predictAttentionTrend(input)
          break
        case 'performance_forecast':
          prediction = await mlPredictor.predictPerformance(input)
          break
        case 'engagement_level':
          prediction = await mlPredictor.predictEngagement(input)
          break
        default:
          throw new Error('Invalid prediction type')
      }

      // Save prediction to database
      const predictionRecord = await Prediction.create({
        userId,
        predictionType,
        predictedValue: prediction.predictedValue,
        confidence: prediction.confidence,
        timeHorizon,
        inputFeatures: {
          recentAttention: input.recentAttention,
          recentPerformance: input.recentPerformance,
          timeOfDay: input.timeOfDay,
          dayOfWeek: input.dayOfWeek,
          sessionDuration: input.sessionDuration,
          breakCount: input.breakCount
        }
      })

      return {
        id: predictionRecord._id,
        type: predictionType,
        predictedValue: prediction.predictedValue,
        confidence: prediction.confidence,
        explanation: prediction.explanation,
        timeHorizon,
        createdAt: predictionRecord.createdAt
      }
    } catch (error) {
      console.error('Error making prediction:', error)
      throw error
    }
  }

  private startDataBroadcasting() {
    // Broadcast simulated real-time data every 5 seconds
    setInterval(async () => {
      try {
        await connectToDatabase()
        
        // Get all connected users
        const userIds = Array.from(this.connectedUsers.values())
        
        for (const userId of userIds) {
          // Simulate data collection
          const attention = await dataCollector.simulateAttentionData(userId)
          const engagement = await dataCollector.simulateEngagementData(userId, 'interactive')
          const performance = await dataCollector.simulatePerformanceData(userId, 0.6)
          const mood = await dataCollector.simulateMoodData(userId)

          // Broadcast to user's room
          this.io.to(`user:${userId}`).emit('realtime_update', {
            attention,
            engagement,
            performance,
            mood,
            timestamp: new Date().toISOString()
          })
        }
      } catch (error) {
        console.error('Error broadcasting real-time data:', error)
      }
    }, 5000)

    // Make periodic predictions every 30 seconds
    setInterval(async () => {
      try {
        await connectToDatabase()
        
        const userIds = Array.from(this.connectedUsers.values())
        
        for (const userId of userIds) {
          const predictionTypes = ['attention_trend', 'performance_forecast', 'engagement_level']
          const randomType = predictionTypes[Math.floor(Math.random() * predictionTypes.length)]
          
          const prediction = await this.makePrediction(userId, randomType, 15)
          
          this.io.to(`user:${userId}`).emit('prediction_update', prediction)
        }
      } catch (error) {
        console.error('Error broadcasting predictions:', error)
      }
    }, 30000)
  }

  public broadcastToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data)
  }

  public broadcastToAll(event: string, data: any) {
    this.io.emit(event, data)
  }

  public getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.values())
  }
}

let wsManager: WebSocketManager | null = null

export function initializeWebSocket(server: HTTPServer): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager(server)
  }
  return wsManager
}

export function getWebSocketManager(): WebSocketManager | null {
  return wsManager
}
