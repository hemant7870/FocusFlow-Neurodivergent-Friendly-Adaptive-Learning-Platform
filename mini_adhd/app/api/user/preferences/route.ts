export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { User } from '@/models/User'
import { getUserFromCookie } from '@/lib/auth'

export async function GET() {
  await connectToDatabase()
  const claims = getUserFromCookie<{ userId: string }>()
  if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await User.findById(claims.userId).lean()
  return NextResponse.json({ preferences: user?.preferences || {} })
}

export async function PUT(req: NextRequest) {
  await connectToDatabase()
  const claims = getUserFromCookie<{ userId: string }>()
  if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await req.json()
  await User.findByIdAndUpdate(claims.userId, { $set: { preferences: payload } })
  return NextResponse.json({ ok: true })
}

