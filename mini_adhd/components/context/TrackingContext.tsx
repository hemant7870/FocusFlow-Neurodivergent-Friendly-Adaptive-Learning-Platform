"use client"
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useMouseTracker } from '@/components/tracking/MouseTracker'
import { useEyeTracker } from '@/components/tracking/EyeTracker'
import { attentionEngine, AttentionMetrics } from '@/lib/analysis/AttentionEngine'
import { adhdDetector, ADHDProfile } from '@/lib/analysis/ADHDDetector'

interface TrackingContextType {
  attentionMetrics: AttentionMetrics
  mouseMetrics: any
  eyeMetrics: any
  adhdProfile: ADHDProfile
  history: AttentionMetrics[]
  screeningResult: number | null
  refreshProfile: () => Promise<void>
}

const TrackingContext = createContext<TrackingContextType | undefined>(undefined)

export function TrackingProvider({ children }: { children: ReactNode }) {
  const mouseMetrics = useMouseTracker()
  const { metrics: eyeMetrics } = useEyeTracker()

  // Centralized State
  const [attentionMetrics, setAttentionMetrics] = useState<AttentionMetrics>({
    score: 0.8,
    state: 'focused',
    confidence: 0.8,
    factors: { mouse: 0.8, eye: 0.8, activity: 0.5 }
  })
  
  // Access static empty profile safely or default
  const emptyProfile: ADHDProfile = {
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
  
  const [adhdProfile, setAdhdProfile] = useState<ADHDProfile>(emptyProfile)
  const [history, setHistory] = useState<AttentionMetrics[]>([])
  const [screeningResult, setScreeningResult] = useState<number | null>(null)

  const refreshProfile = async () => {
    try {
      const res = await fetch('/api/user/profile')
      if (res.ok) {
         const data = await res.json()
         if (data.adhdScore !== undefined) {
           setScreeningResult(data.adhdScore)
         }
      }
    } catch (e) {
      console.error("Failed to fetch profile in context", e)
    }
  }

  useEffect(() => {
    refreshProfile()
  }, [])

  // Analysis Loop (Global)
  useEffect(() => {
    const interval = setInterval(() => {
      const newMetrics = attentionEngine.calculateAttention(mouseMetrics, eyeMetrics)
      setAttentionMetrics(newMetrics)
      
      setHistory(prev => {
        const newHistory = [...prev, newMetrics]
        // Analyze roughly every minute (60 samples)
        if (newHistory.length > 0 && newHistory.length % 60 === 0) {
           const profile = adhdDetector.analyzeSession(newHistory.slice(-60))
           setAdhdProfile(profile)
        }
        return newHistory.slice(-300) // Keep last 5 mins
      })

    }, 1000) // 1Hz sampling

    return () => clearInterval(interval)
  }, [mouseMetrics, eyeMetrics])

  return (
    <TrackingContext.Provider value={{ 
      attentionMetrics, 
      mouseMetrics, 
      eyeMetrics, 
      adhdProfile,
      history,
      screeningResult,
      refreshProfile
    }}>
      {children}
    </TrackingContext.Provider>
  )
}

export function useTracking() {
  const context = useContext(TrackingContext)
  if (context === undefined) {
    throw new Error('useTracking must be used within a TrackingProvider')
  }
  return context
}
