export interface GameState {
  isPlaying: boolean
  score: number
  timeLeft: number
  difficulty: 'easy' | 'medium' | 'hard'
}

export class GameEngine {
  private static instance: GameEngine
  
  private constructor() {}

  static getInstance(): GameEngine {
    if (!GameEngine.instance) {
      GameEngine.instance = new GameEngine()
    }
    return GameEngine.instance
  }

  calculateFocusPoints(attentionScore: number, durationSeconds: number): number {
    // Base points: 1 point per second of focus
    // Multiplier: up to 2x for high attention
    const multiplier = 1 + attentionScore
    return Math.floor(durationSeconds * multiplier)
  }

  getDifficulty(userLevel: number): GameState['difficulty'] {
    if (userLevel < 5) return 'easy'
    if (userLevel < 10) return 'medium'
    return 'hard'
  }
}

export const gameEngine = GameEngine.getInstance()
