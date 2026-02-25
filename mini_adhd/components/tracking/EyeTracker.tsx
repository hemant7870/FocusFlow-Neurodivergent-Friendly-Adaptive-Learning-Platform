"use client"
import { useEffect, useRef, useState } from 'react'
import { useEyeTrackerContext } from './EyeTrackerContext'

// Re-export hook for backward compatibility (but now uses context)
export const useEyeTracker = () => {
  const context = useEyeTrackerContext()
  return {
    metrics: context.metrics,
    isInitialized: context.isInitialized,
    // Add other properties if needed by consumers
  }
}

export default function EyeTrackerDebug() {
  const { 
    metrics, 
    stream,
    isInitialized, 
    isCalibrating,
    calibrationPoints,
    currentCalibrationIndex,
    startCalibration,
    captureCalibrationPoint,
    faces
  } = useEyeTrackerContext()

  const [showCamera, setShowCamera] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Sync stream to local video element for visualization
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(e => console.error("Error playing debug video:", e))
    }
  }, [stream, showCamera])

  // Draw debug visuals (face mesh)
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current || faces.length === 0 || !showCamera) return
    
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    ctx.save()
    ctx.scale(-1, 1) // Mirror flip
    ctx.translate(-canvasRef.current.width, 0)
    
    // We don't need to draw the video here because the <video> element does it
    // Just draw the overlay
    
    ctx.fillStyle = '#00FF00'
    faces[0].keypoints.forEach(kp => {
        // Scale keypoints if video size differs from canvas size
        // Assuming 640x480 for both for now
        ctx.fillRect(kp.x, kp.y, 2, 2)
    })
    ctx.restore()

  }, [faces, showCamera])

  return (
    <>
      {/* Calibration Overlay */}
      {isCalibrating && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center">
          {calibrationPoints.map((point, idx) => (
            <div
              key={idx}
              className={`absolute w-8 h-8 rounded-full transition-all duration-300 cursor-pointer
                ${idx === currentCalibrationIndex ? 'bg-red-500 scale-125 animate-pulse' : 'bg-gray-600 scale-100'}
                ${point.captured ? 'bg-green-500' : ''}
              `}
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
              onClick={captureCalibrationPoint}
            />
          ))}
          <div className="absolute top-10 text-white text-xl font-bold">
            Look at the red dot and click it!
          </div>
        </div>
      )}

      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
        {/* Camera Feed */}
        <div className={`relative bg-black rounded-lg overflow-hidden shadow-lg transition-all duration-300 ${showCamera ? 'w-48 h-36' : 'w-0 h-0'}`}>
          <video 
            ref={videoRef} 
            className="absolute inset-0 w-full h-full object-cover opacity-50 scale-x-[-1]" 
            playsInline 
            muted 
          />
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full object-cover" 
            width={640} 
            height={480} 
          />
          <div className="absolute top-1 left-1 text-[10px] text-white bg-black/50 px-1 rounded">
            {metrics.isDistracted ? '❌ DISTRACTED' : '✅ FOCUSED'}
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-black/80 text-white p-4 rounded-lg text-xs font-mono w-48">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-blue-400">CNN Eye Tracker</span>
            <button 
              onClick={() => setShowCamera(!showCamera)}
              className="text-[10px] bg-gray-700 px-2 py-0.5 rounded hover:bg-gray-600"
            >
              {showCamera ? 'Hide Cam' : 'Show Cam'}
            </button>
          </div>
          <div>Status: {isInitialized ? 'Active' : 'Loading...'}</div>
          <div>Blink Rate: {metrics.blinkRate} bpm</div>
          <div>Attention: {(metrics.attentionScore * 100).toFixed(0)}%</div>
          <div className={metrics.isDistracted ? 'text-red-400' : 'text-green-400'}>
            State: {metrics.isDistracted ? 'DISTRACTED' : 'FOCUSED'}
          </div>
          
          <button
            onClick={startCalibration}
            className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded font-bold transition-colors"
          >
            Start Calibration
          </button>
        </div>
      </div>
    </>
  )
}
