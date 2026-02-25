"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactionGame from '@/components/gamification/ReactionGame'
import FocusModeGame from '@/components/gamification/FocusModeGame'
import ProgressDashboard from '@/components/progress/ProgressDashboard'
import MicroGoals from '@/components/gamification/MicroGoals'
import PatternGame from '@/components/gamification/PatternGame'
import ImprovementChart from '@/components/progress/ImprovementChart'

export default function GamifiedDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'arcade' | 'progress'>('dashboard')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  const fetchData = async () => {
    try {
      const res = await fetch('/api/gamification/progress')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
           <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 animate-pulse"></div>
           <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400"></div>
        </div>
      </div>
    )
  }

  const progressData = data?.progress ? {
    modulesCompleted: data.progress.completedActivities || 0,
    totalStudyTime: data.progress.totalLearningTime || 0,
    level: data.progress.level || 1,
    points: data.progress.totalPoints || 0,
    history: data.progress.history || [],
    badges: data.progress.recentAchievements || [],
    recommendations: []
  } : null

  return (
    <div className="space-y-8 pb-12 font-sans text-slate-200">
      
      {/* Hero Section */}
      <motion.div 
         initial={{ opacity: 0, y: -20 }}
         animate={{ opacity: 1, y: 0 }}
         className="relative overflow-hidden rounded-3xl p-8 glass-card border-none ring-1 ring-white/10"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
             <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-[2px]">
                   <div className="w-full h-full rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center">
                      <span className="text-3xl">👾</span>
                   </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full border border-black">
                   Lvl {data?.progress?.level || 1}
                </div>
             </div>
             
             <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-cyan-400 neon-text">
                   Player One Ready!
                </h1>
                <div className="flex items-center gap-4 mt-2 text-cyan-200/80">
                   <span className="flex items-center gap-1">
                      <span className="text-yellow-400">⚡</span> {data?.progress?.totalPoints || 0} XP
                   </span>
                   <span className="w-1 h-1 rounded-full bg-white/30" />
                   <span className="flex items-center gap-1">
                      <span className="text-orange-400">🔥</span> {data?.progress?.currentStreak || 0} Day Streak
                   </span>
                </div>
             </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-black/30 backdrop-blur-md rounded-full p-1 border border-white/5">
            {['dashboard', 'arcade', 'progress'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === tab 
                    ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] border border-cyan-500/30' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Mission Log (Micro Goals) */}
                <div className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:neon-border transition-all duration-300">
                   <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <span className="text-6xl">🎯</span>
                   </div>
                   <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-cyan-100">
                      <span className="text-cyan-400">◈</span> Active Missions
                   </h2>
                   <MicroGoals />
                </div>

                {/* Focus Garden */}
                <div className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:neon-border transition-all duration-300">
                    <div className="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition-colors" />
                    <FocusModeGame />
                </div>
              </div>

              <div className="space-y-8">
                {/* Trophy Room */}
                <div className="glass-card rounded-2xl p-6 relative overflow-hidden hover:neon-border transition-all duration-300">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-100">
                     <span className="text-purple-400">🏆</span> Trophy Room
                  </h2>
                  <div className="grid grid-cols-3 gap-3">
                    {['🥇', '🥈', '🥉', '🎖️', '🚀', '⭐'].map((emoji, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="aspect-square bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-3xl hover:bg-white/10 hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer transition-all"
                      >
                        {emoji}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats Mini */}
                <div className="glass-card rounded-2xl p-6 hover:neon-border transition-all duration-300">
                    <h3 className="text-lg font-bold text-slate-300 mb-4">Neural Sync Rate</h3>
                    <div className="h-32 flex items-end gap-2 justify-between px-2">
                        {[40, 60, 45, 70, 50, 80, 65].map((h, i) => (
                           <div key={i} className="w-full bg-cyan-500/20 rounded-t-sm relative group">
                              <div 
                                style={{ height: `${h}%` }} 
                                className="absolute bottom-0 w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-sm group-hover:to-cyan-200 transition-all"
                              />
                           </div>
                        ))}
                    </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'arcade' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-card rounded-2xl p-1 overflow-hidden hover:neon-border transition-all">
                 <ReactionGame onComplete={(score) => alert(`Game Over! Score: ${score}`)} />
              </div>
              <div className="glass-card rounded-2xl p-1 overflow-hidden hover:neon-border transition-all">
                 <PatternGame />
              </div>
            </div>
          )}

          {activeTab === 'progress' && progressData && (
            <div className="space-y-8">
              <div className="glass-card rounded-2xl p-6">
                 <ProgressDashboard data={progressData} />
              </div>
              {data?.stats && (
                 <div className="glass-card rounded-2xl p-6">
                    <ImprovementChart data={data.stats} />
                 </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
