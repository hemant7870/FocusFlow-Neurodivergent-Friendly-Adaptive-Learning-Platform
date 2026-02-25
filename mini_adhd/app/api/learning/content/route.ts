export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { User } from '@/models/User'
import { getUserFromCookie } from '@/lib/auth'
import { recommendLearningStyle } from '@/lib/mlEngine'

export async function GET() {
  await connectToDatabase()
  const claims = getUserFromCookie<{ userId: string }>()
  if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await User.findById(claims.userId)
  const suggested = recommendLearningStyle()
  const preferred = user?.preferences?.preferredMode || suggested
  const content = {
    Visual: { title: 'Photosynthesis (Visual)', body: 'An infographic showing the process.', media: 'image' },
    Auditory: { title: 'Photosynthesis (Audio)', body: 'Narrated explanation of the process.', media: 'audio' },
    Textual: { title: 'Photosynthesis (Text)', body: 'A concise article with key terms.', media: 'text' },
  }
  return NextResponse.json({ mode: preferred, suggested, content: content[preferred as keyof typeof content] })
}

