export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { getUserFromCookie } from '@/lib/auth'
import { Session } from '@/models/Session'

export async function POST(req: NextRequest) {
  await connectToDatabase()
  const claims = getUserFromCookie<{ userId: string }>()
  if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { level } = await req.json()
  if (typeof level !== 'number') return NextResponse.json({ error: 'Invalid' }, { status: 400 })
  let session = await Session.findOne({ userId: claims.userId }).sort({ createdAt: -1 })
  if (!session) session = await Session.create({ userId: claims.userId, attentionData: [] })
  session.attentionData.push({ t: new Date(), level })
  await session.save()
  return NextResponse.json({ ok: true })
}

