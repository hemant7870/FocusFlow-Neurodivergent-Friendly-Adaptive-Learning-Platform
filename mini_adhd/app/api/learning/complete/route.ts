export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { Progress } from '@/models/Progress'
import { getUserFromCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  await connectToDatabase()
  const claims = getUserFromCookie<{ userId: string }>()
  if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { lessonId, timeSpent, attention, mode } = await req.json()
  
  if (!lessonId || typeof timeSpent !== 'number' || typeof attention !== 'number' || !mode) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }
  
  try {
    // Update or create progress record
    await Progress.findOneAndUpdate(
      { userId: claims.userId, lessonId },
      {
        $inc: { 
          completedLessons: 1,
          totalTime: Math.round(timeSpent / 60) // Convert to minutes
        },
        $set: {
          attentionRate: attention,
          modeUsed: mode,
          lastUpdated: new Date()
        }
      },
      { upsert: true, new: true }
    )
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }
}
