import { motion } from 'framer-motion'
import Link from 'next/link'

interface Recommendation {
  id: string
  title: string
  description: string
  type: 'video' | 'quiz' | 'reading' | 'interactive'
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedTime: number // minutes
  reason: string
}

interface RecommendedStepsProps {
  recommendations: Recommendation[]
}

export default function RecommendedSteps({ recommendations }: RecommendedStepsProps) {
  const getTypeIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'video': return '🎥'
      case 'quiz': return '❓'
      case 'reading': return '📖'
      case 'interactive': return '🎮'
    }
  }

  const getDifficultyColor = (difficulty: Recommendation['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500 bg-green-100 dark:bg-green-900/30'
      case 'medium': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30'
      case 'hard': return 'text-red-500 bg-red-100 dark:bg-red-900/30'
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">🚀 Recommended Next Steps</h3>
      
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-gray-100 dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-xl">
                  {getTypeIcon(rec.type)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-white">{rec.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{rec.description}</p>
                  
                  <div className="flex items-center space-x-3 mt-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(rec.difficulty)}`}>
                      {rec.difficulty.charAt(0).toUpperCase() + rec.difficulty.slice(1)}
                    </span>
                    <span className="text-xs text-gray-400">
                      ⏱️ {rec.estimatedTime} mins
                    </span>
                  </div>
                </div>
              </div>
              
              <Link 
                href={`/learn/${rec.id}`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Start
              </Link>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
              <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center">
                💡 Why: {rec.reason}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
