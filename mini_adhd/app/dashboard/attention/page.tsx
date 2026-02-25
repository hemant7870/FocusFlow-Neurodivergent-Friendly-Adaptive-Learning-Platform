"use client"
import { useEffect, useRef, useState } from 'react'
import Toast, { useToast } from '@/components/Toast'

export default function AttentionTracker() {
  const [level, setLevel] = useState(0.8)
  const timer = useRef<any>(null)
  const { msg, show } = useToast()

  useEffect(() => {
    timer.current = setInterval(async () => {
      // mock attention level changes
      const next = Math.max(0, Math.min(1, level + (Math.random()-0.5)*0.1))
      setLevel(Number(next.toFixed(2)))
      await fetch('/api/learning/attention', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ level: next }) })
      if (next < 0.4) {
        show("Let's try a quick interactive task!")
      }
    }, 3000)
    return () => clearInterval(timer.current)
  }, [level])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Attention Tracker</h2>
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="text-slate-500 mb-2">Estimated Attention</div>
        <div className="text-3xl font-bold">{Math.round(level*100)}%</div>
      </div>
      <Toast message={msg} />
    </div>
  )
}

