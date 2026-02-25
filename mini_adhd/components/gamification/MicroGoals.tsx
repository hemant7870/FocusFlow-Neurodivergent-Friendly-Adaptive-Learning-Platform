"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Goal {
  id: string
  text: string
  reward: number
  completed: boolean
}

export default function MicroGoals() {
  const [goals, setGoals] = useState<Goal[]>([
    { id: '1', text: 'Focus for 5 minutes', reward: 50, completed: false },
    { id: '2', text: 'Complete 1 quiz', reward: 100, completed: false },
    { id: '3', text: 'Take a deep breath', reward: 20, completed: false },
  ])

  const [coins, setCoins] = useState(0)

  // Fetch initial progress
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch('/api/gamification/progress')
        const data = await res.json()
        if (data.progress) {
          setCoins(data.progress.totalPoints || 0)
        }
      } catch (error) {
        console.error('Error fetching progress:', error)
      }
    }
    fetchProgress()
  }, [])

  const toggleGoal = async (id: string) => {
    const goal = goals.find(g => g.id === id)
    if (!goal || goal.completed) return

    // Optimistic update
    setGoals(goals.map(g => 
      g.id === id ? { ...g, completed: true } : g
    ))

    try {
      const res = await fetch('/api/gamification/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'micro-goal',
          data: { id: goal.id, reward: goal.reward }
        })
      })

      const data = await res.json()
      if (data.success) {
        setCoins(data.newTotal)
      } else {
        // Revert on failure
        setGoals(goals.map(g => 
          g.id === id ? { ...g, completed: false } : g
        ))
      }
    } catch (error) {
      console.error('Error updating goal:', error)
      // Revert on error
      setGoals(goals.map(g => 
        g.id === id ? { ...g, completed: false } : g
      ))
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
          <span className="mr-2">🎯</span> Micro Goals
        </h3>
        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full font-bold text-sm flex items-center">
          <span className="mr-1">🪙</span> {coins}
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {goals.map((goal) => (
            <motion.div
              key={goal.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`
                relative overflow-hidden p-4 rounded-xl border-2 transition-all cursor-pointer
                ${goal.completed 
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900/50' 
                  : 'bg-white border-gray-100 hover:border-blue-200 dark:bg-slate-700 dark:border-slate-600 dark:hover:border-blue-500/50'}
              `}
              onClick={() => toggleGoal(goal.id)}
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-3">
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors
                    ${goal.completed 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-gray-300 dark:border-gray-500'}
                  `}>
                    {goal.completed && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>✓</motion.span>}
                  </div>
                  <span className={`font-medium ${goal.completed ? 'text-gray-500 line-through' : 'text-gray-800 dark:text-white'}`}>
                    {goal.text}
                  </span>
                </div>
                <span className="text-xs font-bold text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                  +{goal.reward}
                </span>
              </div>
              
              {goal.completed && (
                <motion.div
                  layoutId={`highlight-${goal.id}`}
                  className="absolute inset-0 bg-green-500/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <button 
        className="w-full mt-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        onClick={() => {
            // Reset for demo
            setGoals(goals.map(g => ({...g, completed: false})))
        }}
      >
        Reset Goals (Demo)
      </button>
    </div>
  )
}
