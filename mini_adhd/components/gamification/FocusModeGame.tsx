"use client"
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useEyeTracker } from '@/components/tracking/EyeTracker'

export default function FocusModeGame() {
  const [isGrowing, setIsGrowing] = useState(false)
  const [treeStage, setTreeStage] = useState(0) // 0-5
  const [focusPoints, setFocusPoints] = useState(0)
  const [message, setMessage] = useState("Ready to focus?")
  
  const { metrics } = useEyeTracker()

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isGrowing) {
      interval = setInterval(() => {
        if (metrics.attentionScore > 0.6 && !metrics.isDistracted) {
          setFocusPoints(prev => {
            const newPoints = prev + 1
            // Grow tree every 100 points
            if (newPoints % 100 === 0 && treeStage < 5) {
              setTreeStage(s => s + 1)
              setMessage("Great focus! The tree is growing! 🌱")
            }
            return newPoints
          })
        } else {
          setMessage("Focus lost! Look at the screen! ⚠️")
        }
      }, 100) // 10Hz check
    }
    return () => clearInterval(interval)
  }, [isGrowing, metrics, treeStage])

  const toggleGame = () => {
    setIsGrowing(!isGrowing)
    if (!isGrowing) setMessage("Stay focused to grow the tree!")
  }

  const getTreeEmoji = (stage: number) => {
    const trees = ['🌱', '🌿', '🪴', '🌳', '🍎', '🏡']
    return trees[stage] || '🏡'
  }

  return (
    <div className="bg-gradient-to-b from-blue-50 to-green-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 shadow-lg text-center">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">🌳 Focus Garden</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{message}</p>

      <div className="relative h-48 flex items-center justify-center mb-6">
        <motion.div
          key={treeStage}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="text-9xl"
        >
          {getTreeEmoji(treeStage)}
        </motion.div>
        
        {/* Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
          <circle
            cx="50%"
            cy="50%"
            r="80"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="80"
            fill="none"
            stroke="#22c55e"
            strokeWidth="8"
            strokeDasharray="502"
            strokeDashoffset={502 - (502 * (focusPoints % 100)) / 100}
            transition={{ duration: 0.5 }}
          />
        </svg>
      </div>

      <div className="flex justify-between items-center px-8">
        <div className="text-left">
          <div className="text-sm text-gray-500">Points</div>
          <div className="text-2xl font-bold text-green-600">{focusPoints}</div>
        </div>
        
        <button
          onClick={toggleGame}
          className={`px-6 py-2 rounded-full font-bold shadow-lg transition-transform hover:scale-105 ${
            isGrowing 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isGrowing ? 'Stop' : 'Start Growing'}
        </button>
      </div>
    </div>
  )
}
