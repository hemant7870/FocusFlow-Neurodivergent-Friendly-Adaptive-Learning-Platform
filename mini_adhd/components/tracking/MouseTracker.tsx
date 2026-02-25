"use client"
import { useEffect, useRef, useState } from 'react'
import { throttle } from 'lodash'

interface MouseMetrics {
  position: { x: number; y: number }
  velocity: number
  acceleration: number
  jerk: number
  isMoving: boolean
  isIdle: boolean
  idleDuration: number
  erraticScore: number
  hesitationCount: number
}

export const useMouseTracker = (onMetricsUpdate?: (metrics: MouseMetrics) => void) => {
  const [metrics, setMetrics] = useState<MouseMetrics>({
    position: { x: 0, y: 0 },
    velocity: 0,
    acceleration: 0,
    jerk: 0,
    isMoving: false,
    isIdle: true,
    idleDuration: 0,
    erraticScore: 0,
    hesitationCount: 0
  })

  const lastPosition = useRef({ x: 0, y: 0 })
  const lastTime = useRef(Date.now())
  const lastVelocity = useRef(0)
  const lastAcceleration = useRef(0)
  const idleStart = useRef(Date.now())
  const history = useRef<any[]>([])

  useEffect(() => {
    const handleMouseMove = throttle((e: MouseEvent) => {
      const now = Date.now()
      const dt = (now - lastTime.current) / 1000 // seconds
      if (dt === 0) return

      const dx = e.clientX - lastPosition.current.x
      const dy = e.clientY - lastPosition.current.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      const velocity = distance / dt // pixels per second
      const acceleration = (velocity - lastVelocity.current) / dt
      const jerk = (acceleration - lastAcceleration.current) / dt

      // Erratic movement detection (high jerk + frequent direction changes)
      const isErratic = Math.abs(jerk) > 1000 && Math.abs(acceleration) > 500
      
      // Hesitation detection (micro-pauses during movement)
      const isHesitating = velocity < 10 && lastVelocity.current > 100

      // Update history for smoothing/analysis
      history.current.push({ velocity, acceleration, jerk, time: now })
      if (history.current.length > 50) history.current.shift()

      const newMetrics = {
        position: { x: e.clientX, y: e.clientY },
        velocity,
        acceleration,
        jerk,
        isMoving: true,
        isIdle: false,
        idleDuration: 0,
        erraticScore: isErratic ? Math.min(1, metrics.erraticScore + 0.1) : Math.max(0, metrics.erraticScore - 0.05),
        hesitationCount: isHesitating ? metrics.hesitationCount + 1 : metrics.hesitationCount
      }

      setMetrics(newMetrics)
      if (onMetricsUpdate) onMetricsUpdate(newMetrics)

      lastPosition.current = { x: e.clientX, y: e.clientY }
      lastTime.current = now
      lastVelocity.current = velocity
      lastAcceleration.current = acceleration
      idleStart.current = now
    }, 50) // 20Hz sampling

    const checkIdle = setInterval(() => {
      const now = Date.now()
      const idleTime = (now - idleStart.current) / 1000
      if (idleTime > 1 && !metrics.isIdle) {
        setMetrics(prev => ({ ...prev, isIdle: true, isMoving: false, idleDuration: idleTime }))
      } else if (metrics.isIdle) {
        setMetrics(prev => ({ ...prev, idleDuration: idleTime }))
      }
    }, 1000)

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearInterval(checkIdle)
    }
  }, [metrics.isIdle, metrics.erraticScore, metrics.hesitationCount, onMetricsUpdate])

  return metrics
}

export default function MouseTrackerDebug() {
  const metrics = useMouseTracker()

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 pointer-events-none">
      <div>Pos: {metrics.position.x}, {metrics.position.y}</div>
      <div>Vel: {Math.round(metrics.velocity)} px/s</div>
      <div>Acc: {Math.round(metrics.acceleration)} px/s²</div>
      <div>Erratic: {(metrics.erraticScore * 100).toFixed(0)}%</div>
      <div>Hesitations: {metrics.hesitationCount}</div>
      <div>Idle: {metrics.idleDuration.toFixed(1)}s</div>
    </div>
  )
}
