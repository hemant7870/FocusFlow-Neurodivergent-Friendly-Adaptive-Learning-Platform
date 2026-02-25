export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { getUserFromCookie } from '@/lib/auth'
import { User } from '@/models/User'
import { Progress } from '@/models/Progress'
import { Quiz } from '@/models/Quiz'

export async function GET() {
  await connectToDatabase()
  const claims = getUserFromCookie<{ userId: string }>()
  if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const user = await User.findById(claims.userId).select('name adhdScore').lean()
  const progress = await Progress.find({ userId: claims.userId }).lean()
  const quizzes = await Quiz.find({ userId: claims.userId }).lean()

  const totalTime = progress.reduce((sum, p) => sum + (p.totalTime || 0), 0)
  const averageAttention = progress.length > 0 ? 
    progress.reduce((sum, p) => sum + (p.attentionRate || 0), 0) / progress.length : 0
  const completedLessons = progress.reduce((sum, p) => sum + (p.completedLessons || 0), 0)
  const totalLessons = progress.reduce((sum, p) => sum + (p.totalLessons || 0), 0)
  const completionRate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  return NextResponse.json({
    user: {
      name: user?.name || 'User',
      adhdScore: user?.adhdScore || 0
    },
    progress,
    quizzes,
    totalTime,
    averageAttention,
    completionRate
  })
}

