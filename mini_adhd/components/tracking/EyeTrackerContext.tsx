"use client"
import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react'
import * as tf from '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-webgl'
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection'

// Types
interface EyeMetrics {
  gazeX: number
  gazeY: number
  isBlinking: boolean
  blinkRate: number
  attentionScore: number
  isOffScreen: boolean
  isDistracted: boolean
}

interface CalibrationPoint {
  x: number
  y: number
  captured: boolean
}

interface EyeTrackerContextType {
  metrics: EyeMetrics
  stream: MediaStream | null
  isInitialized: boolean
  isCalibrating: boolean
  calibrationPoints: CalibrationPoint[]
  currentCalibrationIndex: number
  startCalibration: () => void
  captureCalibrationPoint: () => void
  faces: faceLandmarksDetection.Face[] // Expose faces for debug drawing
}

const EyeTrackerContext = createContext<EyeTrackerContextType | undefined>(undefined)

export const useEyeTrackerContext = () => {
  const context = useContext(EyeTrackerContext)
  if (!context) {
    throw new Error('useEyeTrackerContext must be used within an EyeTrackerProvider')
  }
  return context
}

export const EyeTrackerProvider = ({ children }: { children: ReactNode }) => {
  // State
  const [metrics, setMetrics] = useState<EyeMetrics>({
    gazeX: 0,
    gazeY: 0,
    isBlinking: false,
    blinkRate: 0,
    attentionScore: 1,
    isOffScreen: false,
    isDistracted: false
  })
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [faces, setFaces] = useState<faceLandmarksDetection.Face[]>([])

  // Calibration State
  const [isCalibrating, setIsCalibrating] = useState(false)
  const [calibrationPoints, setCalibrationPoints] = useState<CalibrationPoint[]>([
    { x: 10, y: 10, captured: false },
    { x: 50, y: 10, captured: false },
    { x: 90, y: 10, captured: false },
    { x: 10, y: 50, captured: false },
    { x: 50, y: 50, captured: false },
    { x: 90, y: 50, captured: false },
    { x: 10, y: 90, captured: false },
    { x: 50, y: 90, captured: false },
    { x: 90, y: 90, captured: false },
  ])
  const [currentCalibrationIndex, setCurrentCalibrationIndex] = useState(0)
  const [calibrationData, setCalibrationData] = useState<{x: number[], y: number[]}>({ x: [], y: [] })
  const [calibrationOffset, setCalibrationOffset] = useState({ x: 0, y: 0, scaleX: 1, scaleY: 1 })

  // Refs
  const processingVideoRef = useRef<HTMLVideoElement>(null)
  const modelRef = useRef<faceLandmarksDetection.FaceLandmarksDetector | null>(null)
  const requestRef = useRef<number>()
  const blinkHistory = useRef<number[]>([])
  const gazeHistory = useRef<{x: number, y: number}[]>([])
  
  const SMOOTHING_WINDOW = 5
  const BLINK_THRESHOLD = 0.25

  // Initialization
  useEffect(() => {
    const initTF = async () => {
      await tf.setBackend('webgl')
      const model = await faceLandmarksDetection.createDetector(
        faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
        {
          runtime: 'tfjs',
          refineLandmarks: true,
          maxFaces: 1
        }
      )
      modelRef.current = model
      setIsInitialized(true)
      startCamera()
    }
    initTF()

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
      if (stream) stream.getTracks().forEach(track => track.stop())
    }
  }, [])

  const startCamera = async () => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: 'user' } 
      })
      setStream(newStream)
      if (processingVideoRef.current) {
        processingVideoRef.current.srcObject = newStream
        processingVideoRef.current.onloadedmetadata = () => {
          processingVideoRef.current!.play()
          detectFace()
        }
      }
    } catch (err) {
      console.error("Error accessing webcam:", err)
    }
  }

  // Calibration Logic
  const startCalibration = () => {
    setIsCalibrating(true)
    setCurrentCalibrationIndex(0)
    setCalibrationPoints(prev => prev.map(p => ({ ...p, captured: false })))
    setCalibrationData({ x: [], y: [] })
  }

  const captureCalibrationPoint = () => {
    setCalibrationPoints(prev => {
      const newPoints = [...prev]
      newPoints[currentCalibrationIndex].captured = true
      return newPoints
    })

    if (currentCalibrationIndex < calibrationPoints.length - 1) {
      setCurrentCalibrationIndex(prev => prev + 1)
    } else {
      finishCalibration()
    }
  }

  const finishCalibration = () => {
    setIsCalibrating(false)
    if (calibrationData.x.length > 0) {
        const xMin = Math.min(...calibrationData.x)
        const xMax = Math.max(...calibrationData.x)
        const yMin = Math.min(...calibrationData.y)
        const yMax = Math.max(...calibrationData.y)
        
        setCalibrationOffset({
            x: xMin,
            y: yMin,
            scaleX: window.innerWidth / (xMax - xMin || 1),
            scaleY: window.innerHeight / (yMax - yMin || 1)
        })
    }
  }

  // Detection Loop
  const lastDetectionTime = useRef<number>(0)
  const lastStateUpdateTime = useRef<number>(0)
  const STATE_UPDATE_INTERVAL = 333 // Update state max 3 times per second
  const DETECTION_INTERVAL = 100 // Run detection every 100ms (10 FPS) as requested
  
  const detectFace = async () => {
    if (!processingVideoRef.current || !modelRef.current) return

    const video = processingVideoRef.current
    if (video.readyState !== 4) {
      requestRef.current = requestAnimationFrame(detectFace)
      return
    }

    const now = Date.now()
    if (now - lastDetectionTime.current < DETECTION_INTERVAL) {
      requestRef.current = requestAnimationFrame(detectFace)
      return
    }
    lastDetectionTime.current = now

    // Pause detection check removed per user request
    // if (document.hidden) { ... }

    try {
      const detectedFaces = await modelRef.current.estimateFaces(video)
      
      if (detectedFaces.length > 0) {
        const face = detectedFaces[0]
        const keypoints = face.keypoints
        
        // 1. Blink Detection
        const leftEAR = calculateEAR(keypoints, [33, 160, 158, 133, 153, 144])
        const rightEAR = calculateEAR(keypoints, [362, 385, 387, 263, 373, 380])
        const avgEAR = (leftEAR + rightEAR) / 2
        const isBlinking = avgEAR < BLINK_THRESHOLD
        
        if (isBlinking) {
          const now = Date.now()
          if (blinkHistory.current.length === 0 || now - blinkHistory.current[blinkHistory.current.length - 1] > 200) {
            blinkHistory.current.push(now)
          }
        }
        
        const oneMinuteAgo = Date.now() - 60000
        blinkHistory.current = blinkHistory.current.filter(t => t > oneMinuteAgo)
        const blinkRate = blinkHistory.current.length

        // 2. Gaze & Calibration
        const leftIris = keypoints[468]
        const rawGazeX = (1 - (leftIris.x / video.videoWidth)) * window.innerWidth
        const rawGazeY = (leftIris.y / video.videoHeight) * window.innerHeight

        let calibratedGazeX = (rawGazeX - calibrationOffset.x) * calibrationOffset.scaleX
        let calibratedGazeY = (rawGazeY - calibrationOffset.y) * calibrationOffset.scaleY
        calibratedGazeX = Math.max(0, Math.min(window.innerWidth, calibratedGazeX))
        calibratedGazeY = Math.max(0, Math.min(window.innerHeight, calibratedGazeY))

        if (isCalibrating) {
            setCalibrationData(prev => ({
                x: [...prev.x, rawGazeX],
                y: [...prev.y, rawGazeY]
            }))
        }

        // Smoothing Gaze
        gazeHistory.current.push({ x: calibratedGazeX, y: calibratedGazeY })
        if (gazeHistory.current.length > SMOOTHING_WINDOW) gazeHistory.current.shift()

        const smoothedGaze = gazeHistory.current.reduce<{ x: number, y: number, weightSum: number }>((acc, curr, idx) => {
            const weight = (idx + 1) / gazeHistory.current.length
            return {
                x: acc.x + curr.x * weight,
                y: acc.y + curr.y * weight,
                weightSum: acc.weightSum + weight
            }
        }, { x: 0, y: 0, weightSum: 0 })

        const finalGazeX = smoothedGaze.x / smoothedGaze.weightSum
        const finalGazeY = smoothedGaze.y / smoothedGaze.weightSum

        // 3. Distraction (Head Pose)
        const nose = keypoints[1]
        const isHeadAway = nose.x < video.videoWidth * 0.2 || nose.x > video.videoWidth * 0.8 ||
                           nose.y < video.videoHeight * 0.2 || nose.y > video.videoHeight * 0.8
        
        const isDistractedRaw = isHeadAway

        // Only update state if enough time passed OR important state change (blink)
        if (now - lastStateUpdateTime.current > STATE_UPDATE_INTERVAL || isBlinking) {
            lastStateUpdateTime.current = now
            
            // Only update faces state here too to prevent re-renders
            setFaces(detectedFaces)
            
            setMetrics(prev => {
                const targetScore = isDistractedRaw ? 0 : 1
                // Increased alpha from 0.05 to 0.1 since we update less frequently now
                const alpha = 0.1 
                const newScore = prev.attentionScore * (1 - alpha) + targetScore * alpha
                const isDistracted = newScore < 0.4 
                
                return {
                  gazeX: finalGazeX,
                  gazeY: finalGazeY,
                  isBlinking,
                  blinkRate,
                  attentionScore: newScore,
                  isOffScreen: isHeadAway,
                  isDistracted
                }
            })
        }

      } else {
        // No face - update state less frequently
        if (now - lastStateUpdateTime.current > STATE_UPDATE_INTERVAL) {
             lastStateUpdateTime.current = now
             setFaces([]) // Clear faces
             setMetrics(prev => {
                const newScore = prev.attentionScore * 0.9 
                return {
                  ...prev,
                  isOffScreen: true,
                  isDistracted: true,
                  attentionScore: newScore
                }
            })
        }
      }
    } catch (err) {
      console.error("Detection error:", err)
    }
    requestRef.current = requestAnimationFrame(detectFace)
  }

  const calculateEAR = (keypoints: any[], indices: number[]) => {
    const dist = (i1: number, i2: number) => {
      const p1 = keypoints[indices[i1]]
      const p2 = keypoints[indices[i2]]
      return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
    }
    const vertical1 = dist(1, 5)
    const vertical2 = dist(2, 4)
    const horizontal = dist(0, 3)
    return (vertical1 + vertical2) / (2 * horizontal)
  }

  const contextValue = React.useMemo(() => ({
      metrics,
      stream,
      isInitialized,
      isCalibrating,
      calibrationPoints,
      currentCalibrationIndex,
      startCalibration,
      captureCalibrationPoint,
      faces
  }), [metrics, stream, isInitialized, isCalibrating, calibrationPoints, currentCalibrationIndex, faces])

  return (
    <EyeTrackerContext.Provider value={contextValue}>
      {children}
      {/* Hidden video for processing */}
      <video 
        ref={processingVideoRef} 
        style={{ display: 'none' }} 
        width={640} 
        height={480} 
        playsInline 
        muted 
      />
    </EyeTrackerContext.Provider>
  )
}
