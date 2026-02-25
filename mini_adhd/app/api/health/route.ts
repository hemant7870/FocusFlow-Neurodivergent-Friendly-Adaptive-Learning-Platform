export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'

export async function GET() {
  try {
    await connectToDatabase()
    return NextResponse.json({ ok: true, db: process.env.MONGODB_DB || 'focusflow' })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'DB connection failed' }, { status: 500 })
  }
}

