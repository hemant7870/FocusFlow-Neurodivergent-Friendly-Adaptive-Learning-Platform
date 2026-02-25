export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { signJwt, setAuthCookie } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code');
    if (!code) {
      console.error('❌ No code provided in callback');
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }
    
    console.log('✅ Auth code received, exchanging for tokens...');

    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`
    );

    const { tokens } = await client.getToken(code);
    console.log('✅ Tokens received');
    client.setCredentials(tokens);

    console.log('🔄 Fetching user info from Google...');
    const userInfoRes = await client.request({
      url: 'https://www.googleapis.com/oauth2/v3/userinfo',
    });
    
    // Type assertion for the response data
    const userInfo = userInfoRes.data as {
        email: string;
        name: string;
        sub: string;
        picture?: string;
    };

    console.log(`✅ User info received for: ${userInfo.email}`);

    if (!userInfo.email) {
       return NextResponse.json({ error: 'Email not found in Google profile' }, { status: 400 });
    }

    console.log('🔄 Connecting to database...');
    await connectToDatabase();
    console.log('✅ Database connected');

    // Check if user exists
    let user = await User.findOne({ email: userInfo.email });

    if (!user) {
      console.log('🆕 User not found, creating new user...');
      // Create new user
      // Generate a random password since they are using Google
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      
      user = await User.create({
        name: userInfo.name,
        email: userInfo.email,
        password: randomPassword, // In a real app, you might flag this account as "social-only" or handle pw reset
        role: 'Student', // Default role
        preferences: {
            preferredMode: 'text', // Default
        },
        gamification: {
            points: 0,
            level: 1,
            badges: []
        },
        progress: {
            modulesCompleted: 0,
            totalStudyTime: 0,
            history: [],
            completedModules: []
        }
      });
      console.log('✅ New user created');
    } else {
        console.log('✅ Existing user found');
    }

    // Sign JWT and set cookie
    console.log('✍️ Signing JWT...');
    const token = signJwt({ userId: user._id, role: user.role, name: user.name });
    setAuthCookie(token);
    console.log('✅ Auth cookie set');

    // Redirect to dashboard (or adhd-test if score missing)
    if (user.adhdScore === undefined || user.adhdScore === null) {
        console.log('➡️ Redirecting to ADHD test');
        return NextResponse.redirect(new URL('/adhd-test', req.url));
    }

    console.log('➡️ Redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', req.url));

  } catch (error: any) {
    console.error('❌ Google Auth Error:', error);
    return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 500 });
  }
}
