"use client"
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function ReactionGame({ onComplete }: { onComplete: (score: number) => void }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
      return () => clearInterval(timer)
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false)
      onComplete(score)
    }
  }, [isPlaying, timeLeft, score, onComplete])

  const startGame = () => {
    setIsPlaying(true)
    setScore(0)
    setTimeLeft(30)
    moveTarget()
  }

  const moveTarget = () => {
    if (!containerRef.current) return
    const { width, height } = containerRef.current.getBoundingClientRect()
    const x = Math.random() * (width - 60)
    const y = Math.random() * (height - 60)
    setTargetPos({ x, y })
  }

  const handleClick = () => {
    if (!isPlaying) return
    setScore(prev => prev + 10)
    moveTarget()
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg h-96 flex flex-col relative overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">⚡ Reaction Blitz</h3>
        <div className="flex space-x-4">
          <span className="font-mono text-lg">Score: {score}</span>
          <span className="font-mono text-lg text-red-500">{timeLeft}s</span>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-lg relative cursor-crosshair"
      >
        {!isPlaying ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <button 
              onClick={startGame}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-transform hover:scale-105"
            >
              Start Game
            </button>
          </div>
        ) : (
          <motion.button
            className="absolute w-12 h-12 rounded-full bg-yellow-400 border-4 border-orange-500 shadow-lg flex items-center justify-center text-2xl"
            style={{ left: targetPos.x, top: targetPos.y }}
            whileTap={{ scale: 0.8 }}
            onClick={handleClick}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            🐹
          </motion.button>
        )}
      </div>
    </div>
  )
}
