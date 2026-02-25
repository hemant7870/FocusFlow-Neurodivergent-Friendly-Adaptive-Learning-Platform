import { AttentionMetrics } from './AttentionEngine'

export interface ADHDProfile {
  riskLevel: 'low' | 'moderate' | 'high'
  indicators: {
    inconsistentFocus: boolean
    rapidShifts: boolean
    impulsivity: boolean
    sustainedAttentionDeficit: boolean
  }
  metrics: {
    focusVariance: number
    shiftCount: number
    impulsivityScore: number
  }
  recommendations: string[]
}

export class ADHDDetector {
  private static instance: ADHDDetector
  
  private constructor() {}

  static getInstance(): ADHDDetector {
    if (!ADHDDetector.instance) {
      ADHDDetector.instance = new ADHDDetector()
    }
    return ADHDDetector.instance
  }

  analyzeSession(history: AttentionMetrics[]): ADHDProfile {
    if (history.length < 60) {
      return this.getEmptyProfile() // Need more data
    }

    // 1. Inconsistent Focus (Variance of attention score)
    const scores = history.map(h => h.score)
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length
    const inconsistentFocus = variance > 0.15 // Threshold

    // 2. Rapid Attention Shifts (State changes per minute)
    let shifts = 0
    for (let i = 1; i < history.length; i++) {
      if (history[i].state !== history[i-1].state) {
        shifts++
      }
    }
    const shiftsPerMinute = (shifts / history.length) * 60 // Assuming 1Hz sampling roughly
    const rapidShifts = shiftsPerMinute > 5

    // 3. Impulsivity (Erratic mouse movement spikes)
    // We don't have raw mouse data here, but we can infer from 'wandering' state
    const wanderingCount = history.filter(h => h.state === 'wandering').length
    const impulsivity = (wanderingCount / history.length) > 0.2

    // 4. Sustained Attention Deficit (Unable to hold 'focused' or 'hyperfocus' for > 5 mins)
    // Simplified check: max consecutive focused samples
    let maxFocused = 0
    let currentFocused = 0
    for (const h of history) {
      if (h.state === 'focused' || h.state === 'hyperfocus') {
        currentFocused++
      } else {
        maxFocused = Math.max(maxFocused, currentFocused)
        currentFocused = 0
      }
    }
    const sustainedAttentionDeficit = maxFocused < 300 // Less than 5 mins (assuming 1Hz)

    // Risk Level Calculation
    let riskScore = 0
    if (inconsistentFocus) riskScore++
    if (rapidShifts) riskScore++
    if (impulsivity) riskScore++
    if (sustainedAttentionDeficit) riskScore++

    let riskLevel: ADHDProfile['riskLevel'] = 'low'
    if (riskScore >= 3) riskLevel = 'high'
    else if (riskScore >= 1) riskLevel = 'moderate'

    // Recommendations
    const recommendations = []
    if (inconsistentFocus) recommendations.push("Try using the Pomodoro technique to structure focus time.")
    if (rapidShifts) recommendations.push("Minimize external distractions and clear your workspace.")
    if (impulsivity) recommendations.push("Take a deep breath before clicking or switching tasks.")
    if (sustainedAttentionDeficit) recommendations.push("Break tasks into smaller, micro-goals (5-10 mins).")

    return {
      riskLevel,
      indicators: {
        inconsistentFocus,
        rapidShifts,
        impulsivity,
        sustainedAttentionDeficit
      },
      metrics: {
        focusVariance: variance,
        shiftCount: shifts,
        impulsivityScore: wanderingCount / history.length
      },
      recommendations
    }
  }

  private getEmptyProfile(): ADHDProfile {
    return {
      riskLevel: 'low',
      indicators: {
        inconsistentFocus: false,
        rapidShifts: false,
        impulsivity: false,
        sustainedAttentionDeficit: false
      },
      metrics: {
        focusVariance: 0,
        shiftCount: 0,
        impulsivityScore: 0
      },
      recommendations: ["Keep using the app to generate a profile."]
    }
  }
}

export const adhdDetector = ADHDDetector.getInstance()
