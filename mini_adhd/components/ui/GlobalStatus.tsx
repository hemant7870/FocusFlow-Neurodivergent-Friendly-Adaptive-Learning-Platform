"use client"
import React, { useEffect, useState } from 'react'
import { useTracking } from '@/components/context/TrackingContext'
import { getADHDLevel } from '@/lib/adaptiveEngine'
import { usePathname } from 'next/navigation'

export default function GlobalStatus() {
  const { attentionMetrics, screeningResult } = useTracking()
  const pathname = usePathname()

  // Hide on public pages and screening test
  if (['/', '/login', '/signup', '/register', '/adhd-test', '/educator-login', '/admin-login'].includes(pathname)) return null

  const screeningLevel = screeningResult !== null ? getADHDLevel(screeningResult) : 'Pend.'
  
  // Map Real-time Score to High/Medium/Low
  let focusLevel = 'Low'
  let focusColor = 'text-red-400'
  let focusBg = 'bg-red-500/20'
  
  if (attentionMetrics.score > 0.7) {
      focusLevel = 'High'
      focusColor = 'text-green-400'
      focusBg = 'bg-green-500/20'
  } else if (attentionMetrics.score > 0.4) {
      focusLevel = 'Med'
      focusColor = 'text-yellow-400'
      focusBg = 'bg-yellow-500/20'
  }

  // Screening Color
  let screeningColor = 'text-green-400'
  if (screeningLevel === 'High') screeningColor = 'text-red-400'
  if (screeningLevel === 'Moderate') screeningColor = 'text-yellow-400'

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none select-none">
       {/* Glassmorphic Container */}
       <div className="glass-card px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md bg-black/40 shadow-xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
          
          {/* Screening Stat */}
          <div className="flex flex-col items-end border-r border-white/10 pr-4">
             <span className="text-[10px] uppercase tracking-wider text-white/50 font-bold">Screening</span>
             <span className={`text-sm font-bold ${screeningColor}`}>
                {screeningLevel}
             </span>
          </div>

          {/* Real-time Stat */}
          <div className="flex flex-col items-start pl-1">
             <span className="text-[10px] uppercase tracking-wider text-white/50 font-bold">Live Focus</span>
             <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${focusLevel === 'High' ? 'bg-green-500' : focusLevel === 'Med' ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`} />
                <span className={`text-sm font-bold ${focusColor}`}>
                   {focusLevel}
                </span>
             </div>
          </div>

       </div>
    </div>
  )
}
