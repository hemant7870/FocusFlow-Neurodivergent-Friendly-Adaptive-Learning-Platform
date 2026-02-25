export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { User } from '@/models/User'
import { getUserFromCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  await connectToDatabase()
  const claims = getUserFromCookie<{ userId: string }>()
  if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { adhdScore } = await req.json()
  if (typeof adhdScore !== 'number' || adhdScore < 0 || adhdScore > 100) {
    return NextResponse.json({ error: 'Invalid ADHD score' }, { status: 400 })
  }
  
  await User.findByIdAndUpdate(claims.userId, { adhdScore })
  return NextResponse.json({ ok: true, adhdScore })
}
