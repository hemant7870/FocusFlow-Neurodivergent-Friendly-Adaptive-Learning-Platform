export interface Recommendation {
  id: string
  title: string
  description: string
  type: 'video' | 'quiz' | 'reading' | 'interactive'
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedTime: number // minutes
  reason: string
}

export function getRecommendations(userProgress: any): Recommendation[] {
  // In a real app, this would use a more sophisticated algorithm or AI
  // For now, we'll return static recommendations based on simple logic
  
  const recommendations: Recommendation[] = []
  
  // If user is new (low level)
  if (userProgress.level < 3) {
    recommendations.push({
      id: 'intro-101',
      title: 'Introduction to Focus',
      description: 'Learn the basics of attention management and how to use this platform.',
      type: 'video',
      difficulty: 'easy',
      estimatedTime: 5,
      reason: 'Perfect starting point for new learners'
    })
    
    recommendations.push({
      id: 'quiz-basics',
      title: 'Focus Basics Quiz',
      description: 'Test your knowledge on the fundamental concepts.',
      type: 'quiz',
      difficulty: 'easy',
      estimatedTime: 3,
      reason: 'Reinforce what you learned in the intro'
    })
  } else {
    // Advanced recommendations
    recommendations.push({
      id: 'adv-tech-1',
      title: 'Pomodoro Mastery',
      description: 'Advanced techniques for using the Pomodoro method effectively.',
      type: 'interactive',
      difficulty: 'medium',
      estimatedTime: 15,
      reason: 'Based on your recent high focus scores'
    })
  }
  
  // Always include a challenge if streak is high
  if (userProgress.currentStreak > 3) {
    recommendations.push({
      id: 'challenge-week-1',
      title: 'Weekly Focus Challenge',
      description: 'Push your limits with this extended focus session.',
      type: 'interactive',
      difficulty: 'hard',
      estimatedTime: 25,
      reason: 'You are on a roll! Challenge yourself.'
    })
  }
  
  return recommendations
}
