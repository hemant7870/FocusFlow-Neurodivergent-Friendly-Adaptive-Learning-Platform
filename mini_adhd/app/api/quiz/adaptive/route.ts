export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { getUserFromCookie } from '@/lib/auth'
import { Quiz } from '@/models/Quiz'
import { adjustQuizDifficulty } from '@/lib/mlEngine'

export async function POST(req: NextRequest) {
  await connectToDatabase()
  const claims = getUserFromCookie<{ userId: string }>()
  if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { topic, prevScore = 0.5, focus = 0.5 } = await req.json()
  if (!topic) return NextResponse.json({ error: 'Missing topic' }, { status: 400 })
  const difficulty = adjustQuizDifficulty(prevScore, focus)
  const question = `On ${topic}, explain the main concept in one sentence.`
  const quiz = await Quiz.create({ userId: claims.userId, topic, question, difficulty })
  return NextResponse.json({ id: (quiz._id as any).toString(), question, difficulty })
}

