import './globals.css'
import type { Metadata } from 'next'
import { ReactNode } from 'react'
import { ThemeProvider } from '@/lib/theme/ThemeProvider'

export const metadata: Metadata = {
  title: 'FocusFlow – AI Tutor for Neurodivergent Learners',
  description: 'Personalized, adaptive learning with attention-aware support.',
}

import GlobalStatus from '@/components/ui/GlobalStatus'
import { TrackingProvider } from '@/components/context/TrackingContext'
import { EyeTrackerProvider } from '@/components/tracking/EyeTrackerContext'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen mesh-bg text-slate-200 transition-colors">
        <ThemeProvider>
          <EyeTrackerProvider>
            <TrackingProvider>
               <GlobalStatus />
               {children}
            </TrackingProvider>
          </EyeTrackerProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

