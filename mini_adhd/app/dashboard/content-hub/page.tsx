"use client"
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface Content {
  _id: string
  title: string
  description: string
  type: 'lesson' | 'exercise' | 'game' | 'assessment' | 'break_activity'
  category: 'math' | 'reading' | 'science' | 'social' | 'attention' | 'memory'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedDuration: number
  content: {
    text?: string
    images?: string[]
    videos?: string[]
    audio?: string[]
    interactive?: any
  }
  metadata: {
    tags: string[]
    ageRange: { min: number; max: number }
    adhdFriendly: boolean
    attentionLevel: number
    engagementScore: number
    accessibility: {
      visual: boolean
      auditory: boolean
      kinesthetic: boolean
    }
  }
  analytics: {
    totalViews: number
    averageRating: number
    completionRate: number
    averageTimeSpent: number
  }
}

export default function ContentHub() {
  const [content, setContent] = useState<Content[]>([])
  const [filteredContent, setFilteredContent] = useState<Content[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)

  useEffect(() => {
    fetchContent()
  }, [])

  useEffect(() => {
    filterContent()
  }, [content, selectedCategory, selectedDifficulty, selectedType])

  const fetchContent = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/content')
      if (response.ok) {
        const data = await response.json()
        setContent(data.content || [])
      }
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterContent = () => {
    let filtered = content

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(item => item.difficulty === selectedDifficulty)
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType)
    }

    setFilteredContent(filtered)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'advanced': return 'bg-rose-500/20 text-rose-300 border-rose-500/30'
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson': return '📚'
      case 'exercise': return '💪'
      case 'game': return '🎮'
      case 'assessment': return '📝'
      case 'break_activity': return '🧘'
      default: return '📄'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'math': return '🔢'
      case 'reading': return '📖'
      case 'science': return '🔬'
      case 'social': return '👥'
      case 'attention': return '🎯'
      case 'memory': return '🧠'
      default: return '📚'
    }
  }

  const startContent = async (contentItem: Content) => {
    try {
      await fetch('/api/realtime/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataType: 'activity',
          value: 1,
          metadata: { 
            source: 'content_start',
            context: `Started: ${contentItem.title}`,
            contentId: contentItem._id
          }
        })
      })

      setSelectedContent(contentItem)
    } catch (error) {
      console.error('Error starting content:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative w-20 h-20">
             <div className="absolute inset-0 rounded-full border-4 border-cyan-500/30 border-t-cyan-500 animate-spin" />
             <div className="absolute inset-2 rounded-full border-4 border-purple-500/30 border-b-purple-500 animate-spin-reverse" />
        </div>
      </div>
    )
  }

  if (selectedContent) {
    return (
      <ContentViewer 
        content={selectedContent} 
        onClose={() => setSelectedContent(null)} 
      />
    )
  }

  return (
    <div className="space-y-8 min-h-screen pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 neon-text">
              Content Hub
           </h1>
           <p className="text-cyan-200/60 mt-2 font-light tracking-wide">
              Access the neural database for enhanced learning modules.
           </p>
        </div>
        <button
          onClick={fetchContent}
          className="px-6 py-2 glass-card hover:bg-white/10 text-cyan-300 rounded-full transition-all border border-cyan-500/30 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] flex items-center gap-2"
        >
          <span>🔄</span> Refresh Database
        </button>
      </div>

      {/* Glassmorphic Filters */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-cyan-200/50">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all appearance-none"
            >
              <option value="all">All Categories</option>
              <option value="math">Math</option>
              <option value="reading">Reading</option>
              <option value="science">Science</option>
              <option value="social">Social</option>
              <option value="attention">Attention</option>
              <option value="memory">Memory</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-cyan-200/50">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all appearance-none"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-cyan-200/50">Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all appearance-none"
            >
              <option value="all">All Types</option>
              <option value="lesson">Lessons</option>
              <option value="exercise">Exercises</option>
              <option value="game">Games</option>
              <option value="assessment">Assessments</option>
              <option value="break_activity">Break Activities</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {filteredContent.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card rounded-2xl overflow-hidden group hover:bg-white/5 transition-all duration-300 border border-white/5 hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col"
              onClick={() => startContent(item)}
            >
              {/* Content Image with Overlay */}
              <div className="relative h-48 w-full overflow-hidden">
                {item.content.images && item.content.images.length > 0 ? (
                  <Image
                    src={item.content.images[0]}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                   <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                      <span className="text-4xl opacity-20">🚀</span>
                   </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute top-4 left-4 flex gap-2">
                   <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${getDifficultyColor(item.difficulty)}`}>
                      {item.difficulty}
                   </span>
                </div>
                
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                   <div>
                      <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1 block">
                         {item.category}
                      </span>
                      <h3 className="text-xl font-bold text-white leading-tight group-hover:text-cyan-300 transition-colors">
                         {item.title}
                      </h3>
                   </div>
                   <div className="bg-black/40 backdrop-blur-md rounded-full p-2 border border-white/10 text-xl">
                      {getTypeIcon(item.type)}
                   </div>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <p className="text-slate-400 text-sm mb-6 line-clamp-2 font-light leading-relaxed">
                   {item.description}
                </p>
                
                <div className="mt-auto space-y-4">
                   <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-4">
                         <span className="flex items-center gap-1">
                            ⏱️ <span className="text-slate-300">{item.estimatedDuration}m</span>
                         </span>
                         <span className="flex items-center gap-1">
                            🔥 <span className="text-slate-300">{Math.round(item.metadata.engagementScore * 100)}%</span>
                         </span>
                      </div>
                      <span className="flex items-center gap-1">
                         👁️ {item.analytics.totalViews}
                      </span>
                   </div>

                   <button className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-cyan-900/20 group-hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-2">
                      <span>START ACTIVITY</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                   </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredContent.length === 0 && (
        <div className="text-center py-20 glass-panel rounded-3xl">
          <div className="text-6xl mb-4 opacity-50">🔭</div>
          <h3 className="text-2xl font-bold text-white mb-2">No Signals Found</h3>
          <p className="text-slate-400 mb-6">Adjust your scanners to find matching content.</p>
          <button
            onClick={() => {
              setSelectedCategory('all')
              setSelectedDifficulty('all')
              setSelectedType('all')
            }}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/10"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  )
}

function ContentViewer({ content, onClose }: { content: Content; onClose: () => void }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [interactiveState, setInteractiveState] = useState<any>(null)

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[200]">
      <motion.div 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         className="glass-card w-full max-w-5xl h-[90vh] rounded-3xl overflow-hidden flex flex-col border border-white/10 shadow-2xl relative"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
          <div>
             <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">{content.type === 'game' ? '🎮' : '📚'}</span>
                {content.title}
             </h2>
             <p className="text-slate-400 text-sm mt-1 flex items-center gap-4">
                <span>⏱️ {content.estimatedDuration}min</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="uppercase tracking-wider">{content.category}</span>
             </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
           {/* Content Layout */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Media & Text */}
              <div className="lg:col-span-2 space-y-6">
                 {content.content.images && content.content.images.length > 0 && (
                    <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg relative aspect-video bg-black/50">
                       <Image
                          src={content.content.images[currentImageIndex]}
                          alt={content.title}
                          fill
                          className="object-cover"
                       />
                       
                       {content.content.images.length > 1 && (
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
                             {content.content.images.map((_, index) => (
                                <button
                                   key={index}
                                   onClick={() => setCurrentImageIndex(index)}
                                   className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex ? 'bg-cyan-400 w-4' : 'bg-white/30'}`}
                                />
                             ))}
                          </div>
                       )}
                    </div>
                 )}

                {content.content.text && (
                  <div className="glass-panel p-6 rounded-2xl">
                    <h3 className="text-lg font-bold text-cyan-200 mb-4">Briefing</h3>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                       {content.content.text}
                    </p>
                  </div>
                )}

                {/* Interactive Area */}
                {content.content.interactive && (
                   <div className="glass-panel p-6 rounded-2xl border-t-4 border-cyan-500">
                      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                         <span className="animate-pulse text-cyan-400">⚡</span> Interactive Module
                      </h3>
                      <InteractiveComponent 
                         interactive={content.content.interactive}
                         onStateChange={setInteractiveState}
                      />
                   </div>
                )}
              </div>

              {/* Right Column: Stats & Actions */}
              <div className="space-y-6">
                 <div className="glass-panel p-6 rounded-2xl space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Performance Metrics</h3>
                    
                    <div className="space-y-4">
                       <div className="flex justify-between items-center pb-4 border-b border-white/5">
                          <span className="text-slate-400">Attention Level</span>
                          <span className="text-emerald-400 font-bold">{Math.round(content.metadata.attentionLevel * 100)}%</span>
                       </div>
                       <div className="flex justify-between items-center pb-4 border-b border-white/5">
                          <span className="text-slate-400">Engagement</span>
                          <span className="text-orange-400 font-bold">{Math.round(content.metadata.engagementScore * 100)}%</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-slate-400">Global Completion</span>
                          <span className="text-purple-400 font-bold">{Math.round(content.analytics.completionRate * 100)}%</span>
                       </div>
                    </div>
                 </div>

                 <button className="w-full py-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-lg shadow-cyan-900/20 transition-all">
                    Complete Module
                 </button>
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  )
}

// Keeping the Interactive Components simple but wrapped in div styled if needed. 
// For brevity, using the same logic but ensuring text contrast is good.

function InteractiveComponent({ interactive, onStateChange }: { interactive: any; onStateChange: (state: any) => void }) {
  const [state, setState] = useState<any>({})

  const handleStateChange = (newState: any) => {
    setState(newState)
    onStateChange(newState)
  }

  // Interactive components need to ensure they look good on dark backgrounds
  switch (interactive.type) {
    case 'counting_game':
      return <CountingGame interactive={interactive} state={state} onStateChange={handleStateChange} />
    case 'comprehension_quiz':
      return <ComprehensionQuiz interactive={interactive} state={state} onStateChange={handleStateChange} />
    case 'planet_explorer':
      return <PlanetExplorer interactive={interactive} state={state} onStateChange={handleStateChange} />
    case 'attention_training':
      return <AttentionTraining interactive={interactive} state={state} onStateChange={handleStateChange} />
    case 'memory_palace':
      return <MemoryPalace interactive={interactive} state={state} onStateChange={handleStateChange} />
    default:
      return <div className="p-4 bg-white/5 rounded-lg text-slate-400">Interactive content optimized for mobile.</div>
  }
}

// ... existing interactive component functions (minimal style updates for dark mode) ... 
// Updating container classes to be dark-mode friendly

function CountingGame({ interactive, state, onStateChange }: any) {
  const [count, setCount] = useState(0)
  
  return (
    <div className="p-6 bg-cyan-900/20 rounded-xl border border-cyan-500/20">
      <h4 className="text-lg font-semibold text-cyan-200 mb-4">Count the Animals!</h4>
      <p className="mb-4 text-slate-300">Target: {interactive.targetCount}</p>
      <div className="flex flex-wrap gap-4 mb-4">
        {interactive.animals.map((animal: string, index: number) => (
          <button
            key={index}
            onClick={() => setCount(prev => prev + 1)}
            className="px-4 py-2 bg-black/40 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/20 transition-colors text-2xl"
          >
            {animal}
          </button>
        ))}
      </div>
      <div className="text-3xl font-bold text-cyan-400">{count}</div>
    </div>
  )
}

function ComprehensionQuiz({ interactive, state, onStateChange }: any) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
    if (answerIndex === interactive.questions[currentQuestion].correct) {
      setScore(prev => prev + 1)
    }
  }

  const nextQuestion = () => {
    if (currentQuestion < interactive.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
      setSelectedAnswer(null)
    }
  }

  const question = interactive.questions[currentQuestion]

  return (
    <div className="p-6 bg-emerald-900/20 rounded-xl border border-emerald-500/20">
      <h4 className="text-lg font-semibold text-emerald-200 mb-4">Quiz Protocol</h4>
      <div className="mb-4">
        <p className="text-sm text-emerald-400/60 mb-2">Query {currentQuestion + 1} / {interactive.questions.length}</p>
        <p className="font-medium text-white mb-4 text-lg">{question.question}</p>
        <div className="space-y-3">
          {question.options.map((option: string, index: number) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={selectedAnswer !== null}
              className={`w-full p-4 text-left rounded-xl border transition-all ${
                selectedAnswer === index
                  ? index === question.correct
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-red-500/20 border-red-500 text-red-300'
                  : selectedAnswer !== null && index === question.correct
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-black/20 border-white/10 hover:bg-white/5 text-slate-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      {selectedAnswer !== null && currentQuestion < interactive.questions.length - 1 && (
        <button onClick={nextQuestion} className="px-6 py-2 bg-emerald-600 text-white rounded-lg">Next Query</button>
      )}
    </div>
  )
}

function PlanetExplorer({ interactive }: any) {
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null)
  return (
     <div className="p-6 bg-purple-900/20 rounded-xl border border-purple-500/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
           {interactive.planets.map((planet: any, index: number) => (
              <button key={index} onClick={() => setSelectedPlanet(planet.name)} className="p-4 rounded-xl border border-white/10 bg-black/20 hover:bg-purple-500/20 transition-all flex flex-col items-center gap-2">
                 <div className="w-8 h-8 rounded-full" style={{ backgroundColor: planet.color }} />
                 <span className="text-sm text-slate-300">{planet.name}</span>
              </button>
           ))}
        </div>
        {selectedPlanet && (
           <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-slate-300">
              <h4 className="text-xl font-bold text-white mb-2">{selectedPlanet}</h4>
              <p>Analyzing planetary data...</p>
           </div>
        )}
     </div>
  )
}

function AttentionTraining({ interactive }: any) {
   return <div className="text-slate-400">Attention Training Module Loaded</div>
}

function MemoryPalace({ interactive }: any) {
   return <div className="text-slate-400">Memory Palace Module Loaded</div>
}
