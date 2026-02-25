import { motion } from 'framer-motion'

interface Badge {
  id: string
  icon: string
  title: string
  description: string
  unlockedAt?: string
}

interface BadgeListProps {
  badges: Badge[]
}

export default function BadgeList({ badges }: BadgeListProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">🏆 Your Badges</h3>
      
      {badges.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <div className="text-4xl mb-2">🔒</div>
          <p>No badges yet. Keep learning to unlock them!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="group relative flex flex-col items-center p-4 bg-gray-50 dark:bg-slate-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
            >
              <div className="text-4xl mb-2">{badge.icon}</div>
              <div className="text-center">
                <div className="font-bold text-gray-800 dark:text-white text-sm">{badge.title}</div>
                {badge.unlockedAt && (
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(badge.unlockedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10 text-center">
                {badge.description}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
