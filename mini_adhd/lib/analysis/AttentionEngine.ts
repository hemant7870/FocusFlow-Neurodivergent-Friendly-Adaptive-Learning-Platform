export interface AttentionMetrics {
  score: number // 0-1
  state: 'focused' | 'distracted' | 'wandering' | 'hyperfocus'
  confidence: number
  factors: {
    mouse: number
    eye: number
    activity: number
  }
}

export class AttentionEngine {
  private static instance: AttentionEngine
  private history: AttentionMetrics[] = []
  
  private constructor() {}

  static getInstance(): AttentionEngine {
    if (!AttentionEngine.instance) {
      AttentionEngine.instance = new AttentionEngine()
    }
    return AttentionEngine.instance
  }

  calculateAttention(mouseMetrics: any, eyeMetrics: any): AttentionMetrics {
    // Weight factors
    const W_MOUSE = 0.4
    const W_EYE = 0.6

    // Mouse Attention Factor
    // High erratic score = low attention
    // Idle for too long = low attention (unless watching video)
    // Purposeful movement = high attention
    let mouseScore = 0.5
    if (mouseMetrics.isMoving) {
      mouseScore = 1.0 - (mouseMetrics.erraticScore * 0.8)
    } else if (mouseMetrics.isIdle) {
      // Decay attention over idle time, but clamp at 0.3 (could be reading/watching)
      mouseScore = Math.max(0.3, 1.0 - (mouseMetrics.idleDuration / 60))
    }

    // Eye Attention Factor
    // On screen = high
    // Off screen = low
    // Blink rate normal (10-20/min) = high, too low/high = lower
    let eyeScore = eyeMetrics.attentionScore
    if (eyeMetrics.isOffScreen) {
      eyeScore = 0
    }

    // Combined Score
    let score = (mouseScore * W_MOUSE) + (eyeScore * W_EYE)
    
    // Determine State
    let state: AttentionMetrics['state'] = 'focused'
    if (score < 0.3) state = 'distracted'
    else if (mouseMetrics.erraticScore > 0.7) state = 'wandering'
    else if (score > 0.9 && mouseMetrics.idleDuration < 5) state = 'hyperfocus'

    const metrics: AttentionMetrics = {
      score,
      state,
      confidence: 0.8, // Placeholder
      factors: {
        mouse: mouseScore,
        eye: eyeScore,
        activity: 0.5 // Placeholder for app activity
      }
    }

    this.history.push(metrics)
    if (this.history.length > 100) this.history.shift()

    return metrics
  }

  getAverageAttention(seconds: number = 60): number {
    // Assuming 1 sample per second roughly (depends on call rate)
    // Ideally use timestamps
    const samples = this.history.slice(-seconds)
    if (samples.length === 0) return 0
    return samples.reduce((acc, m) => acc + m.score, 0) / samples.length
  }
}

export const attentionEngine = AttentionEngine.getInstance()
