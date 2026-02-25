export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { getUserFromCookie } from '@/lib/auth'
import { dataCollector } from '@/lib/realtime/collector'

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()
    const claims = getUserFromCookie<{ userId: string }>()
    if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const hours = parseInt(searchParams.get('hours') || '24')

    const summary = await dataCollector.getDataSummary(claims.userId, hours)

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Error fetching data summary:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
