import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { User } from '@/models/User'
import { getUserFromCookie } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()
    
    const user = await getUserFromCookie()
    if (!user || (user.role !== 'Educator' && user.role !== 'Admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now, return all students. In a real app, we'd filter by educator's linked students.
    const students = await User.find({ role: 'Student' })
      .select('name email progress adhdScore gamification updatedAt')
      .sort({ updatedAt: -1 })

    // Aggregate some stats for the educator
    const stats = {
      totalStudents: students.length,
      averageADHDScore: students.length > 0 
        ? students.reduce((acc, s) => acc + (s.adhdScore || 0), 0) / students.length 
        : 0,
      activeToday: students.filter(s => {
        const today = new Date().setHours(0,0,0,0)
        return new Date(s.updatedAt).setHours(0,0,0,0) === today
      }).length
    }

    return NextResponse.json({ students, stats })
  } catch (error: any) {
    console.error("Educator API Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
