export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { getUserFromCookie } from '@/lib/auth'
import { achievementSystem } from '@/lib/gamification/achievements'

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()
    const claims = getUserFromCookie<{ userId: string }>()
    if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const progress = await achievementSystem.getUserProgress(claims.userId)
    const stats = await achievementSystem.getImprovementStats(claims.userId)

    return NextResponse.json({ progress, stats })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()
    const claims = getUserFromCookie<{ userId: string }>()
    if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { type, data } = body

    // Get current user
    const { User } = await import('@/models/User')
    const user = await User.findById(claims.userId)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let pointsEarned = 0
    let message = ''

    if (type === 'micro-goal') {
      // Micro-goal completion
      pointsEarned = data.reward || 50
      message = 'Micro-goal completed!'
      
      // Update user points directly for micro-goals
      user.gamification.points += pointsEarned
      
      // Check for achievements
      await achievementSystem.checkAchievements({
        userId: claims.userId,
        dataType: 'activity',
        value: 1,
        metadata: { type: 'micro-goal', goalId: data.id }
      })

    } else if (type === 'focus-session') {
      // Focus session update
      const { duration, attentionScore } = data
      
      // Calculate points using GameEngine
      const { gameEngine } = await import('@/lib/gamification/GameEngine')
      pointsEarned = gameEngine.calculateFocusPoints(attentionScore, duration)
      
      user.gamification.points += pointsEarned
      user.progress.totalStudyTime += (duration / 60) // Convert seconds to minutes

      // Check for focus streak achievements
      await achievementSystem.checkAchievements({
        userId: claims.userId,
        dataType: 'attention',
        value: attentionScore,
        metadata: { duration }
      })
      
      message = 'Focus session recorded'
    }

    await user.save()

    return NextResponse.json({ 
      success: true, 
      pointsEarned,
      newTotal: user.gamification.points,
      message 
    })

  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
