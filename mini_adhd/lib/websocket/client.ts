import { io, Socket } from 'socket.io-client'
import { useEffect, useState } from 'react'

export interface WebSocketEvents {
  'initial_data': (data: any) => void
  'realtime_update': (data: {
    attention: number
    engagement: number
    performance: number
    mood: number
    timestamp: string
  }) => void
  'prediction_update': (prediction: any) => void
  'data_collected': (data: any) => void
  'engagement_update': (data: any) => void
  'error': (error: { message: string }) => void
}

export class WebSocketClient {
  private socket: Socket | null = null
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor(private userId: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000', {
          transports: ['websocket'],
          timeout: 10000
        })

        this.socket.on('connect', () => {
          console.log('WebSocket connected')
          this.isConnected = true
          this.reconnectAttempts = 0
          
          // Authenticate with user ID
          this.socket?.emit('authenticate', { userId: this.userId })
          resolve()
        })

        this.socket.on('disconnect', () => {
          console.log('WebSocket disconnected')
          this.isConnected = false
          this.handleReconnect()
        })

        this.socket.on('connect_error', (error: any) => {
          console.error('WebSocket connection error:', error)
          this.isConnected = false
          this.handleReconnect()
          reject(error)
        })

        // Set up event listeners
        this.setupEventListeners()
      } catch (error) {
        reject(error)
      }
    })
  }

  private setupEventListeners() {
    if (!this.socket) return

    this.socket.on('initial_data', (data: any) => {
      console.log('Received initial data:', data)
    })

    this.socket.on('realtime_update', (data: any) => {
      console.log('Real-time update:', data)
    })

    this.socket.on('prediction_update', (prediction: any) => {
      console.log('Prediction update:', prediction)
    })

    this.socket.on('data_collected', (data: any) => {
      console.log('Data collected:', data)
    })

    this.socket.on('engagement_update', (data: any) => {
      console.log('Engagement update:', data)
    })

    this.socket.on('error', (error: any) => {
      console.error('WebSocket error:', error)
    })
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)
    
    setTimeout(() => {
      this.connect().catch(console.error)
    }, delay)
  }

  // Event emission methods
  collectData(dataType: string, value: number, metadata?: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit('collect_data', { dataType, value, metadata })
    }
  }

  requestPrediction(predictionType: string, timeHorizon?: number) {
    if (this.socket && this.isConnected) {
      this.socket.emit('request_prediction', { predictionType, timeHorizon })
    }
  }

  trackContentInteraction(contentId: string, action: string, metadata?: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit('content_interaction', { contentId, action, metadata })
    }
  }

  // Event listener methods
  on<K extends keyof WebSocketEvents>(event: K, callback: WebSocketEvents[K]) {
    if (this.socket) {
      this.socket.on(event, callback as any)
    }
  }

  off<K extends keyof WebSocketEvents>(event: K, callback?: WebSocketEvents[K]) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback as any)
      } else {
        this.socket.removeAllListeners(event)
      }
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected
  }
}

// React hook for WebSocket
export function useWebSocket(userId: string) {
  const [wsClient, setWsClient] = useState<WebSocketClient | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const client = new WebSocketClient(userId)
    
    client.connect()
      .then(() => {
        setWsClient(client)
        setIsConnected(true)
        setError(null)
      })
      .catch((err) => {
        setError(err.message)
        setIsConnected(false)
      })

    // Set up event listeners
    client.on('realtime_update', (data) => {
      // Handle real-time updates
      console.log('Real-time data received:', data)
    })

    client.on('prediction_update', (prediction) => {
      // Handle prediction updates
      console.log('Prediction received:', prediction)
    })

    client.on('error', (error) => {
      setError(error.message)
    })

    return () => {
      client.disconnect()
    }
  }, [userId])

  return {
    wsClient,
    isConnected,
    error,
    collectData: (dataType: string, value: number, metadata?: any) => {
      wsClient?.collectData(dataType, value, metadata)
    },
    requestPrediction: (predictionType: string, timeHorizon?: number) => {
      wsClient?.requestPrediction(predictionType, timeHorizon)
    },
    trackContentInteraction: (contentId: string, action: string, metadata?: any) => {
      wsClient?.trackContentInteraction(contentId, action, metadata)
    }
  }
}

// Import React hooks
