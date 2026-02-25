export type LearningStyle = 'Visual' | 'Auditory' | 'Textual'

export function recommendLearningStyle(seed = Math.random()): LearningStyle {
  const weights = [0.4, 0.35, 0.25] // visual, auditory, textual
  const r = seed
  if (r < weights[0]) return 'Visual'
  if (r < weights[0] + weights[1]) return 'Auditory'
  return 'Textual'
}

export function simulateAttentionDecay(current: number): number {
  const decay = 0.05 + Math.random() * 0.15
  const next = Math.max(0, current - decay)
  return Number(next.toFixed(2))
}

export function adjustQuizDifficulty(prevScore: number, focus: number): number {
  const base = prevScore > 0.8 ? 0.7 : prevScore > 0.6 ? 0.5 : 0.3
  const focusBoost = focus > 0.6 ? 0.2 : focus > 0.4 ? 0.1 : -0.1
  const level = Math.min(1, Math.max(0.1, base + focusBoost))
  return Number(level.toFixed(2))
}

