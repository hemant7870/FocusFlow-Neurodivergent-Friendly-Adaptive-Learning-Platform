export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { getUserFromCookie } from '@/lib/auth'
import { User } from '@/models/User'
import { modules } from '@/lib/content/modules'
import { progressEngine } from '@/lib/gamification/ProgressEngine'

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()
    const claims = getUserFromCookie<{ userId: string }>()
    if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { moduleId } = await req.json()
    
    // Find module to get XP reward
    const module = modules.find(m => m.id === moduleId)
    if (!module) {
        return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    const user = await User.findById(claims.userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Initialize if missing (for legacy users)
    if (!user.progress.completedModules) {
        user.progress.completedModules = []
    }

    // Check if already completed
    if (user.progress.completedModules.includes(moduleId)) {
        return NextResponse.json({ 
            message: 'Module already completed',
            points: user.gamification.points,
            level: user.gamification.level,
            completedModules: user.progress.completedModules
        })
    }

    // Award XP and Mark Complete
    user.progress.completedModules.push(moduleId)
    
    // Increment modules completed count
    user.progress.modulesCompleted = (user.progress.modulesCompleted || 0) + 1

    // Use Progress engine to update points and level
    // We mock an "activity" here to reuse the logic, or just manually update if simple
    // Let's manually update since ProgressEngine logic is a bit tied to 'duration/score'
    // But we should use the calculateLevel logic from it to be consistent.
    
    user.gamification.points += module.xpReward
    user.gamification.level = progressEngine.calculateLevel(user.gamification.points)
    
    // Create a history entry
    user.progress.history.push({
        date: new Date(),
        activity: `Completed Module: ${module.title}`,
        score: 100 // 100% completion
    })

    await user.save()

    return NextResponse.json({ 
      success: true, 
      pointsEarned: module.xpReward,
      newTotal: user.gamification.points,
      newLevel: user.gamification.level,
      message: `Module Completed! +${module.xpReward} XP`
    })

  } catch (error) {
    console.error('Error completing module:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
