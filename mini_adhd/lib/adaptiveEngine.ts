export type ADHDLevel = 'Low' | 'Moderate' | 'High'
export type LearningMode = 'text' | 'visual' | 'audio'
export type Difficulty = 'easy' | 'medium' | 'hard'

export function getADHDLevel(score: number): ADHDLevel {
  if (score <= 30) return 'Low'
  if (score <= 60) return 'Moderate'
  return 'High'
}

export function getLearningMode(adhdScore: number, attention: number = 0.8): LearningMode {
  const level = getADHDLevel(adhdScore)
  
  // If attention is very low, switch to more engaging mode
  if (attention < 0.3) {
    return 'visual' // Most engaging
  }
  
  switch (level) {
    case 'Low':
      return 'text'
    case 'Moderate':
      return attention < 0.5 ? 'visual' : 'text'
    case 'High':
      return attention < 0.6 ? 'visual' : 'audio'
    default:
      return 'text'
  }
}

export function adjustContentDifficulty(adhdScore: number, pastAccuracy: number, attention: number): Difficulty {
  const level = getADHDLevel(adhdScore)
  
  // Base difficulty on ADHD level
  let baseDifficulty: Difficulty = 'easy'
  if (level === 'Moderate') baseDifficulty = 'medium'
  if (level === 'High') baseDifficulty = 'hard'
  
  // Adjust based on performance
  if (pastAccuracy > 0.8) {
    if (baseDifficulty === 'easy') baseDifficulty = 'medium'
    else if (baseDifficulty === 'medium') baseDifficulty = 'hard'
  } else if (pastAccuracy < 0.4) {
    if (baseDifficulty === 'hard') baseDifficulty = 'medium'
    else if (baseDifficulty === 'medium') baseDifficulty = 'easy'
  }
  
  // Adjust based on attention
  if (attention < 0.4) {
    if (baseDifficulty === 'hard') baseDifficulty = 'medium'
    else if (baseDifficulty === 'medium') baseDifficulty = 'easy'
  }
  
  return baseDifficulty
}

export function simulateAttentionDecay(currentAttention: number, adhdLevel: ADHDLevel): number {
  const decayRates = {
    Low: 0.02,
    Moderate: 0.05,
    High: 0.08
  }
  
  const decay = decayRates[adhdLevel] + (Math.random() - 0.5) * 0.02
  return Math.max(0, Math.min(1, currentAttention - decay))
}

export function getContentForMode(mode: LearningMode, topic: string) {
  const content = {
    text: {
      title: `${topic} - Text Lesson`,
      body: `Learn about ${topic} through detailed text explanations and key concepts.`,
      media: 'text',
      interactive: false
    },
    visual: {
      title: `${topic} - Visual Lesson`,
      body: `Explore ${topic} through interactive diagrams, charts, and visual representations.`,
      media: 'image',
      interactive: true
    },
    audio: {
      title: `${topic} - Audio Lesson`,
      body: `Listen to ${topic} explained through engaging audio narration and sound effects.`,
      media: 'audio',
      interactive: true
    }
  }
  
  return content[mode]
}

export function shouldTriggerAttentionAlert(attention: number, adhdLevel: ADHDLevel): boolean {
  const thresholds = {
    Low: 0.3,
    Moderate: 0.4,
    High: 0.5
  }
  
  return attention < thresholds[adhdLevel]
}

export function getAttentionMessage(adhdLevel: ADHDLevel): string {
  const messages = {
    Low: "Let's try a quick interactive task to refocus!",
    Moderate: "Time for a visual break! Let's switch to something more engaging.",
    High: "Let's take a movement break and try some interactive content!"
  }
  
  return messages[adhdLevel]
}
