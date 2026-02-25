"use client"
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function PatternGame() {
  const [sequence, setSequence] = useState<number[]>([])
  const [userSequence, setUserSequence] = useState<number[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isShowingSequence, setIsShowingSequence] = useState(false)
  const [level, setLevel] = useState(1)
  const [message, setMessage] = useState("Watch the pattern!")

  const gridSize = 4 // 2x2 grid

  const startGame = () => {
    setIsPlaying(true)
    setLevel(1)
    setSequence([])
    setUserSequence([])
    addToSequence()
  }

  const addToSequence = () => {
    const next = Math.floor(Math.random() * gridSize)
    setSequence(prev => [...prev, next])
    setUserSequence([])
    setIsShowingSequence(true)
    setMessage(`Level ${level}: Watch carefully...`)
  }

  useEffect(() => {
    if (isShowingSequence && sequence.length > 0) {
      let i = 0
      const interval = setInterval(() => {
        if (i >= sequence.length) {
          clearInterval(interval)
          setIsShowingSequence(false)
          setMessage("Your turn!")
          return
        }
        // Flash the tile logic handled in render by checking index and time
        // Actually, simpler to just use a 'activeTile' state
        setActiveTile(sequence[i])
        setTimeout(() => setActiveTile(null), 500)
        i++
      }, 800)
      return () => clearInterval(interval)
    }
  }, [sequence, isShowingSequence])

  const [activeTile, setActiveTile] = useState<number | null>(null)

  const handleTileClick = (index: number) => {
    if (!isPlaying || isShowingSequence) return

    const newSequence = [...userSequence, index]
    setUserSequence(newSequence)

    // Check if correct so far
    if (newSequence[newSequence.length - 1] !== sequence[newSequence.length - 1]) {
      setMessage("Game Over! Try again.")
      setIsPlaying(false)
      return
    }

    // Check if completed level
    if (newSequence.length === sequence.length) {
      setMessage("Correct! Next level...")
      setLevel(l => l + 1)
      setTimeout(addToSequence, 1000)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg flex flex-col items-center">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">🧩 Pattern Match</h3>
      <p className="text-sm text-gray-500 mb-6">{message}</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {[0, 1, 2, 3].map((i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleTileClick(i)}
            className={`
              w-24 h-24 rounded-2xl transition-colors duration-200 shadow-md
              ${activeTile === i 
                ? 'bg-blue-500 shadow-blue-500/50 scale-105' 
                : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600'}
            `}
          />
        ))}
      </div>

      {!isPlaying && (
        <button
          onClick={startGame}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold transition-colors"
        >
          {level > 1 ? 'Play Again' : 'Start Game'}
        </button>
      )}
    </div>
  )
}
