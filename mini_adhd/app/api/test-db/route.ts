export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'

export async function GET() {
  try {
    const mongoUri = process.env.MONGODB_URI
    const jwtSecret = process.env.JWT_SECRET
    
    let dbStatus = 'disconnected'
    try {
      await connectToDatabase()
      dbStatus = 'connected'
    } catch (e: any) {
      dbStatus = `error: ${e.message}`
    }

    return NextResponse.json({
      ok: true,
      env: {
        MONGODB_URI: !!mongoUri,
        JWT_SECRET: !!jwtSecret,
      },
      dbConnection: dbStatus
    })
  } catch (error: any) {
    return NextResponse.json({ 
      ok: false, 
      error: error.message 
    }, { status: 500 })
  }
}
