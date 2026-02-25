export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { getUserFromCookie } from '@/lib/auth'
import { RealTimeData } from '@/models/RealTimeData'
import { dataCollector } from '@/lib/realtime/collector'

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()
    const claims = getUserFromCookie<{ userId: string }>()
    if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { dataType, value, metadata } = await req.json()

    if (!dataType || typeof value !== 'number' || value < 0 || value > 1) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    await dataCollector.collectData({
      userId: claims.userId,
      dataType,
      value,
      metadata
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error collecting real-time data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()
    const claims = getUserFromCookie<{ userId: string }>()
    if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const dataType = searchParams.get('type')
    const minutes = parseInt(searchParams.get('minutes') || '30')

    let query: any = { userId: claims.userId }
    if (dataType) {
      query.dataType = dataType
    }

    const since = new Date(Date.now() - minutes * 60 * 1000)
    query.timestamp = { $gte: since }

    const data = await RealTimeData.find(query)
      .sort({ timestamp: -1 })
      .limit(100)

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching real-time data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
