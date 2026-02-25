export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { getUserFromCookie } from '@/lib/auth'
import { mlPredictor, PredictionInput } from '@/lib/ml/predictor'
import { dataCollector } from '@/lib/realtime/collector'
import { Prediction } from '@/models/Prediction'

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()
    const claims = getUserFromCookie<{ userId: string }>()
    if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { predictionType, timeHorizon = 15 } = await req.json()

    if (!predictionType) {
      return NextResponse.json({ error: 'Prediction type required' }, { status: 400 })
    }

    // Get recent data for predictions
    const recentAttention = await dataCollector.getRecentData(claims.userId, 'attention', 30)
    const recentPerformance = await dataCollector.getRecentData(claims.userId, 'performance', 30)

    const now = new Date()
    const input: PredictionInput = {
      recentAttention: recentAttention.map(d => d.value),
      recentPerformance: recentPerformance.map(d => d.value),
      timeOfDay: now.getHours(),
      dayOfWeek: now.getDay(),
      sessionDuration: 30, // This could be calculated from session data
      breakCount: 2 // This could be calculated from activity data
    }

    let prediction: any
    let predictedValue: number
    let confidence: number
    let explanation: string

    switch (predictionType) {
      case 'attention_trend':
        prediction = await mlPredictor.predictAttentionTrend(input)
        break
      case 'performance_forecast':
        prediction = await mlPredictor.predictPerformance(input)
        break
      case 'engagement_level':
        prediction = await mlPredictor.predictEngagement(input)
        break
      default:
        return NextResponse.json({ error: 'Invalid prediction type' }, { status: 400 })
    }

    predictedValue = prediction.predictedValue
    confidence = prediction.confidence
    explanation = prediction.explanation

    // Save prediction to database
    const predictionRecord = await Prediction.create({
      userId: claims.userId,
      predictionType,
      predictedValue,
      confidence,
      timeHorizon,
      inputFeatures: {
        recentAttention: input.recentAttention,
        recentPerformance: input.recentPerformance,
        timeOfDay: input.timeOfDay,
        dayOfWeek: input.dayOfWeek,
        sessionDuration: input.sessionDuration,
        breakCount: input.breakCount
      }
    })

    return NextResponse.json({
      prediction: {
        id: predictionRecord._id,
        type: predictionType,
        predictedValue,
        confidence,
        explanation,
        timeHorizon,
        createdAt: predictionRecord.createdAt
      }
    })
  } catch (error) {
    console.error('Error making prediction:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()
    const claims = getUserFromCookie<{ userId: string }>()
    if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const predictionType = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '10')

    let query: any = { userId: claims.userId }
    if (predictionType) {
      query.predictionType = predictionType
    }

    const predictions = await Prediction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)

    return NextResponse.json({ predictions })
  } catch (error) {
    console.error('Error fetching predictions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
