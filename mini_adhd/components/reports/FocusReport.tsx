"use client"
import { AttentionMetrics } from '@/lib/analysis/AttentionEngine'
import { ADHDProfile } from '@/lib/analysis/ADHDDetector'
import { motion } from 'framer-motion'

interface FocusReportProps {
  currentMetrics: AttentionMetrics
  adhdProfile: ADHDProfile
  onExport: () => void
}

export default function FocusReport({ currentMetrics, adhdProfile, onExport }: FocusReportProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          🧠 Focus Analysis Report
        </h2>
        <button 
          onClick={onExport}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Export PDF
        </button>
      </div>

      {/* Real-time Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
          <div className="text-sm text-gray-500 dark:text-gray-400">Current State</div>
          <div className={`text-2xl font-bold capitalize ${
            currentMetrics.state === 'focused' || currentMetrics.state === 'hyperfocus' 
              ? 'text-green-600' 
              : 'text-orange-600'
          }`}>
            {currentMetrics.state}
          </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
          <div className="text-sm text-gray-500 dark:text-gray-400">Attention Score</div>
          <div className="text-2xl font-bold text-blue-600">
            {Math.round(currentMetrics.score * 100)}%
          </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
          <div className="text-sm text-gray-500 dark:text-gray-400">Confidence</div>
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(currentMetrics.confidence * 100)}%
          </div>
        </div>
      </div>

      {/* ADHD Pattern Analysis */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold mb-4">Pattern Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-300">Risk Level</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                adhdProfile.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                adhdProfile.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {adhdProfile.riskLevel.toUpperCase()}
              </span>
            </div>
            
            <div className="space-y-2 mt-4">
              {Object.entries(adhdProfile.indicators).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-gray-600 dark:text-gray-400">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className={value ? 'text-red-500' : 'text-green-500'}>
                    {value ? 'Detected' : 'Normal'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Recommendations</h4>
            <ul className="space-y-2">
              {adhdProfile.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                  <span className="mr-2 text-blue-500">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
