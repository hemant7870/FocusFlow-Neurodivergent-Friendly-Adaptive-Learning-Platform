export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { getUserFromCookie } from '@/lib/auth'
import { achievementSystem } from '@/lib/gamification/achievements'

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()
    const claims = getUserFromCookie<{ userId: string }>()
    if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { dataType, value, metadata } = await req.json()

    const achievements = await achievementSystem.checkAchievements({
      userId: claims.userId,
      dataType,
      value,
      metadata
    })

    return NextResponse.json({ achievements })
  } catch (error) {
    console.error('Error checking achievements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
