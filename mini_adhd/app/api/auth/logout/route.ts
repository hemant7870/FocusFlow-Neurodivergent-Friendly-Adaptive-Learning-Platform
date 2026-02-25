export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  // Clear auth cookie
  console.log('Processing logout request')
  clearAuthCookie()
  
  return NextResponse.json({ success: true })
}
