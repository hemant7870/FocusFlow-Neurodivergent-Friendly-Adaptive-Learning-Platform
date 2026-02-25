"use client"
import { motion } from 'framer-motion'
import BadgeList from '@/components/gamification/BadgeList'
import RecommendedSteps from '@/components/learning/RecommendedSteps'
import { Recommendation } from '@/lib/learning/recommendations'

interface ProgressData {
  modulesCompleted: number
  totalStudyTime: number
  level: number
  points: number
  history: { date: string, activity: string, score: number }[]
  badges: any[]
  recommendations: Recommendation[]
}

export default function ProgressDashboard({ data }: { data: ProgressData }) {
  const getMasteryLabel = (level: number) => {
    if (level < 5) return 'Novice'
    if (level < 10) return 'Apprentice'
    if (level < 20) return 'Expert'
    return 'Master'
  }

  return (
    <div className="space-y-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Modules Progress */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <div className="text-sm text-blue-600 dark:text-blue-400 mb-1 font-medium">Modules Completed</div>
          <div className="flex items-end justify-between mb-2">
            <div className="text-3xl font-bold text-blue-800 dark:text-blue-200">
              {data.modulesCompleted} <span className="text-lg font-normal text-blue-500">/ 20</span>
            </div>
            <div className="text-xs text-blue-500 mb-1">{(data.modulesCompleted / 20 * 100).toFixed(0)}% Complete</div>
          </div>
          <div className="w-full bg-blue-100 dark:bg-blue-900/30 h-3 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(data.modulesCompleted / 20) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full" 
            />
          </div>
        </div>

        {/* Study Time */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <div className="text-sm text-purple-600 dark:text-purple-400 mb-1 font-medium">Total Study Time</div>
          <div className="text-3xl font-bold text-purple-800 dark:text-purple-200 mb-2">
            {Math.floor(data.totalStudyTime / 60)}h {data.totalStudyTime % 60}m
          </div>
          <div className="text-xs text-purple-500">
            Keep it up! Consistency is key 🚀
          </div>
        </div>

        {/* Mastery Level */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="text-6xl">👑</span>
          </div>
          <div className="text-sm text-amber-600 dark:text-amber-400 mb-1 font-medium">Mastery Level</div>
          <div className="text-3xl font-bold text-amber-800 dark:text-amber-200 mb-2">
            Lvl {data.level}
          </div>
          <div className="text-sm font-medium text-amber-600 dark:text-amber-300">
            {getMasteryLabel(data.level)}
          </div>
          <div className="mt-2 text-xs text-amber-500">
            {data.points} total points earned
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recommendations & History */}
        <div className="lg:col-span-2 space-y-8">
          <RecommendedSteps recommendations={data.recommendations} />
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <h4 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <span className="mr-2">📜</span> Recent Activity
            </h4>
            <div className="space-y-3">
              {data.history.slice(-5).reverse().map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-slate-700"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${item.score > 80 ? 'bg-green-500' : 'bg-blue-500'}`} />
                    <div>
                      <div className="text-sm font-medium text-gray-800 dark:text-white">{item.activity}</div>
                      <div className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded text-sm">
                    +{item.score} pts
                  </div>
                </motion.div>
              ))}
              {data.history.length === 0 && (
                <div className="text-center text-gray-500 py-8 bg-gray-50 dark:bg-slate-700/30 rounded-lg border border-dashed border-gray-200 dark:border-slate-700">
                  <div className="text-2xl mb-2">📝</div>
                  No activity yet. Start your first lesson!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Badges */}
        <div className="lg:col-span-1">
          <BadgeList badges={data.badges} />
        </div>
      </div>
    </div>
  )
}
