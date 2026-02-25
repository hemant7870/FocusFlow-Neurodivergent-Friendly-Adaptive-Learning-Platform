export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { User } from '@/models/User'
import { getUserFromCookie } from '@/lib/auth'

export async function GET() {
  await connectToDatabase()
  const claims = getUserFromCookie<{ userId: string }>()
  if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const user = await User.findById(claims.userId).select('-password').lean()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  
  return NextResponse.json(user)
}
