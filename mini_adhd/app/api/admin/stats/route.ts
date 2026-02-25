import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { User } from '@/models/User'
import { getUserFromCookie } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()
    
    const user = await getUserFromCookie()
    if (!user || user.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const totalUsers = await User.countDocuments()
    const roleDistribution = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ])

    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(10)

    // Calculate usage trends (simulated for now based on createdAt)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0,0,0,0)
      return date
    }).reverse()

    const trends = await Promise.all(last7Days.map(async (date) => {
      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)
      const count = await User.countDocuments({
        createdAt: { $gte: date, $lt: nextDay }
      })
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        newUsers: count
      }
    }))

    return NextResponse.json({
      stats: {
        totalUsers,
        roleDistribution: roleDistribution.reduce((acc, curr) => {
          acc[curr._id] = curr.count
          return acc
        }, {} as Record<string, number>),
        trends
      },
      recentUsers
    })
  } catch (error: any) {
    console.error("Admin API Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
