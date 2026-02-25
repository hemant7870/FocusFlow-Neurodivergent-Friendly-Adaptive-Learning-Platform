"use client"
import { useEffect, useRef } from 'react'

interface HeatmapOverlayProps {
  mousePosition: { x: number, y: number }
  gazePosition: { x: number, y: number }
  show: boolean
}

export default function HeatmapOverlay({ mousePosition, gazePosition, show }: HeatmapOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseHistory = useRef<{ x: number, y: number, time: number }[]>([])
  const gazeHistory = useRef<{ x: number, y: number, time: number }[]>([])

  useEffect(() => {
    if (!show) return

    const now = Date.now()
    mouseHistory.current.push({ ...mousePosition, time: now })
    gazeHistory.current.push({ ...gazePosition, time: now })

    // Keep last 5 seconds
    mouseHistory.current = mouseHistory.current.filter(p => now - p.time < 5000)
    gazeHistory.current = gazeHistory.current.filter(p => now - p.time < 5000)

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Resize canvas to match window
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw Mouse Path (Blue)
    if (mouseHistory.current.length > 1) {
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)' // Blue-500
      ctx.lineWidth = 3
      ctx.moveTo(mouseHistory.current[0].x, mouseHistory.current[0].y)
      for (const p of mouseHistory.current) {
        ctx.lineTo(p.x, p.y)
      }
      ctx.stroke()
    }

    // Draw Gaze Heatmap (Red/Orange blobs)
    for (const p of gazeHistory.current) {
      const age = now - p.time
      const opacity = 1 - (age / 5000)
      
      ctx.beginPath()
      ctx.fillStyle = `rgba(249, 115, 22, ${opacity * 0.1})` // Orange-500
      ctx.arc(p.x, p.y, 30, 0, Math.PI * 2)
      ctx.fill()
    }

  }, [mousePosition, gazePosition, show])

  if (!show) return null

  return (
    <canvas 
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40"
    />
  )
}
