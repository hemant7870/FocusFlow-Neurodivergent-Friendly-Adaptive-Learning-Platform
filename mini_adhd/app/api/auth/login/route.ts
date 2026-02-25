export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '@/lib/db'
import { User } from '@/models/User'
import { signJwt, setAuthCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()
    const body = await req.json()
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
    }
    
    console.log(`🔐 Attempting login for: ${email}`);
    
    const user = await User.findOne({ email })
    if (!user) {
        console.log(`❌ User not found: ${email}`);
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
        console.log(`❌ Password mismatch for: ${email}`);
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    console.log(`✅ Password verified for: ${email}. Generating token...`);
    const token = signJwt({ userId: user._id, role: user.role, name: user.name })
    setAuthCookie(token)
    
    // Set role cookie for middleware routing (UI/Routing hint)
    const { cookies } = require('next/headers')
    cookies().set('focusflow_role', user.role, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
    
    
    console.log(`✅ Login successful for: ${email}`);
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("❌ Login error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

