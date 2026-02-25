"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getADHDLevel, getLearningMode, getContentForMode, shouldTriggerAttentionAlert, getAttentionMessage } from '@/lib/adaptiveEngine'
import Toast, { useToast } from '@/components/Toast'

interface UserProfile {
  adhdScore?: number
  preferences: {
    preferredMode?: 'text' | 'visual' | 'audio'
  }
}

const LESSONS = [
  { id: 'math-basics', title: 'Basic Mathematics', topic: 'Addition and Subtraction' },
  { id: 'science-intro', title: 'Science Introduction', topic: 'States of Matter' },
  { id: 'reading-skills', title: 'Reading Comprehension', topic: 'Main Ideas and Details' },
  { id: 'history-basics', title: 'World History', topic: 'Ancient Civilizations' },
  { id: 'writing-skills', title: 'Writing Skills', topic: 'Paragraph Structure' }
]

export default function LearnPage() {
  const router = useRouter()
  const { msg, show } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [currentLesson, setCurrentLesson] = useState(LESSONS[0])
  const [attention, setAttention] = useState(0.8)
  const [mode, setMode] = useState<'text' | 'visual' | 'audio'>('text')
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeSpent, setTimeSpent] = useState(0)

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (profile?.adhdScore) {
      const adhdLevel = getADHDLevel(profile.adhdScore)
      const recommendedMode = getLearningMode(profile.adhdScore, attention)
      setMode(recommendedMode)
      updateContent(recommendedMode)
    }
  }, [profile, attention])

  useEffect(() => {
    // Attention tracking simulation
    const interval = setInterval(() => {
      setAttention(prev => {
        const newAttention = Math.max(0.1, Math.min(1, prev + (Math.random() - 0.5) * 0.1))
        
        if (profile?.adhdScore && shouldTriggerAttentionAlert(newAttention, getADHDLevel(profile.adhdScore))) {
          show(getAttentionMessage(getADHDLevel(profile.adhdScore)))
          // Switch to more engaging mode
          const newMode = newAttention < 0.3 ? 'visual' : 'audio'
          setMode(newMode)
          updateContent(newMode)
        }
        
        return newAttention
      })
    }, 5000)

    // Time tracking
    const timeInterval = setInterval(() => {
      setTimeSpent(prev => prev + 1)
    }, 1000)

    return () => {
      clearInterval(interval)
      clearInterval(timeInterval)
    }
  }, [profile, show])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile')
      const data = await res.json()
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateContent = (newMode: 'text' | 'visual' | 'audio') => {
    const lessonContent = getContentForMode(newMode, currentLesson.topic)
    setContent(lessonContent)
  }

  const handleModeChange = (newMode: 'text' | 'visual' | 'audio') => {
    setMode(newMode)
    updateContent(newMode)
  }

  const handleTextToSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(content.body)
      utterance.rate = (profile?.preferences as any)?.speechSpeed || 1.0
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleVoiceCommand = () => {
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (!SR) {
      show('Speech Recognition not supported')
      return
    }

    const recognition = new SR()
    recognition.lang = 'en-US'
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase()
      if (transcript.includes('visual')) handleModeChange('visual')
      else if (transcript.includes('audio')) handleModeChange('audio')
      else if (transcript.includes('text')) handleModeChange('text')
      show(`Voice command: ${transcript}`)
    }
    recognition.start()
  }

  const handleLessonComplete = async () => {
    try {
      await fetch('/api/learning/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: currentLesson.id,
          timeSpent,
          attention,
          mode
        })
      })
      show('Lesson completed! Great job!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error completing lesson:', error)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  const adhdLevel = profile?.adhdScore ? getADHDLevel(profile.adhdScore) : 'Low'
  const attentionPercent = Math.round(attention * 100)

  return (
    <main className="min-h-screen mesh-gradient text-white p-4 md:p-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-primary/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-purple-500/10 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="mb-12 text-center">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-white/50 hover:text-white mb-6 transition-colors">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Learning <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">Hub</span>
          </h1>
          <div className="flex justify-center gap-4 text-sm text-white/60">
             <span>Focus: <strong className="text-primary-300">{attentionPercent}%</strong></span>
             <span>•</span>
             <span>Level: <strong className="text-purple-300">{adhdLevel}</strong></span>
          </div>
        </header>

        {/* Mode Selection */}
        <div className="flex justify-center gap-3 mb-12">
          {(['text', 'visual', 'audio'] as const).map(modeOption => (
             <button
                key={modeOption}
                onClick={() => handleModeChange(modeOption)}
                className={`px-6 py-3 rounded-xl border transition-all duration-300 font-medium ${
                   mode === modeOption
                      ? 'bg-primary-500 text-white border-primary-400 shadow-[0_0_20px_rgba(59,130,246,0.5)]'
                      : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
             >
                {modeOption.charAt(0).toUpperCase() + modeOption.slice(1)} Mode
             </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
             <div className="glass-card rounded-3xl p-8 min-h-[500px] border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                   <span className="text-9xl">📚</span>
                </div>

                <div className="relative z-10">
                   <div className="inline-block px-3 py-1 rounded-lg bg-white/10 text-xs font-bold text-white/50 mb-4 uppercase tracking-wider">
                      {currentLesson.topic}
                   </div>
                   <h2 className="text-3xl font-bold mb-8">{currentLesson.title}</h2>
                   
                   {content ? (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                         <h4 className="text-xl font-semibold text-primary-200">{content.title}</h4>
                         <p className="text-lg leading-relaxed text-white/80">{content.body}</p>
                         
                         {mode === 'visual' && (
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-8 text-center mt-8">
                               <div className="text-5xl mb-4">📊</div>
                               <div className="text-primary-300 font-medium">Interactive Visual Content</div>
                               <div className="text-sm text-white/40 mt-2">Charts and diagrams adapt to your focus level</div>
                            </div>
                         )}
                         
                         {mode === 'audio' && (
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-8 flex items-center gap-6 mt-8">
                               <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-300">
                                  ▶️
                               </div>
                               <div>
                                  <div className="font-medium text-primary-300">Audio Lesson Playing</div>
                                  <div className="h-1 w-32 bg-white/10 rounded-full mt-2 overflow-hidden">
                                     <div className="h-full bg-primary-500 w-2/3 animate-pulse" />
                                  </div>
                               </div>
                            </div>
                         )}
                      </div>
                   ) : (
                      <div className="flex items-center justify-center h-64 text-white/30">Select a lesson to begin</div>
                   )}
                </div>
             </div>

             {/* Controls */}
             <div className="grid grid-cols-3 gap-4">
                <button onClick={handleTextToSpeech} className="glass-card p-4 rounded-xl hover:bg-white/10 transition-colors flex flex-col items-center gap-2 text-center group">
                   <span className="text-2xl group-hover:scale-110 transition-transform">🔊</span>
                   <span className="text-sm font-medium text-white/70">Read Aloud</span>
                </button>
                <button onClick={handleVoiceCommand} className="glass-card p-4 rounded-xl hover:bg-white/10 transition-colors flex flex-col items-center gap-2 text-center group">
                   <span className="text-2xl group-hover:scale-110 transition-transform">🎤</span>
                   <span className="text-sm font-medium text-white/70">Voice Control</span>
                </button>
                <button onClick={handleLessonComplete} className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-xl hover:from-green-400 hover:to-emerald-500 transition-all flex flex-col items-center gap-2 text-center shadow-lg shadow-green-500/20">
                   <span className="text-2xl">✅</span>
                   <span className="text-sm font-bold text-white">Complete</span>
                </button>
             </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
             {/* Stats Card */}
             <div className="glass-card rounded-3xl p-6">
                <h3 className="font-semibold text-white/50 uppercase tracking-widest text-xs mb-6">Session Stats</h3>
                <div className="space-y-4">
                   <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <span className="text-sm text-white/70">Time Focused</span>
                      <span className="font-mono text-primary-300">{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
                   </div>
                   <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <span className="text-sm text-white/70">Current Mode</span>
                      <span className="font-mono text-purple-300 capitalize">{mode}</span>
                   </div>
                </div>
             </div>

             {/* Lesson List */}
             <div className="glass-card rounded-3xl p-6">
                <h3 className="font-semibold text-white/50 uppercase tracking-widest text-xs mb-6">Curriculum</h3>
                <div className="space-y-2">
                   {LESSONS.map(lesson => (
                      <button
                         key={lesson.id}
                         onClick={() => setCurrentLesson(lesson)}
                         className={`w-full text-left p-4 rounded-xl transition-all duration-300 border ${
                            currentLesson.id === lesson.id
                               ? 'bg-primary-500/20 border-primary-500/50 text-primary-100'
                               : 'bg-transparent border-transparent hover:bg-white/5 text-white/60'
                         }`}
                      >
                         <div className="font-medium">{lesson.title}</div>
                         <div className="text-xs opacity-60 mt-1">{lesson.topic}</div>
                      </button>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
      <Toast message={msg} />
    </main>
  )
}
