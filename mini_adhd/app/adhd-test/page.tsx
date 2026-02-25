"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useTracking } from '@/components/context/TrackingContext'

const ADHD_QUESTIONS = [
  {
    id: 1,
    question: "How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?",
    options: [
      { text: "Never", value: 0 },
      { text: "Rarely", value: 1 },
      { text: "Sometimes", value: 2 },
      { text: "Often", value: 3 },
      { text: "Very Often", value: 4 }
    ]
  },
  {
    id: 2,
    question: "How often do you have difficulty getting things in order when you have to do a task that requires organization?",
    options: [
      { text: "Never", value: 0 },
      { text: "Rarely", value: 1 },
      { text: "Sometimes", value: 2 },
      { text: "Often", value: 3 },
      { text: "Very Often", value: 4 }
    ]
  },
  {
    id: 3,
    question: "How often do you have problems remembering appointments or obligations?",
    options: [
      { text: "Never", value: 0 },
      { text: "Rarely", value: 1 },
      { text: "Sometimes", value: 2 },
      { text: "Often", value: 3 },
      { text: "Very Often", value: 4 }
    ]
  },
  {
    id: 4,
    question: "When you have a task that requires a lot of thought, how often do you avoid or delay getting started?",
    options: [
      { text: "Never", value: 0 },
      { text: "Rarely", value: 1 },
      { text: "Sometimes", value: 2 },
      { text: "Often", value: 3 },
      { text: "Very Often", value: 4 }
    ]
  },
  {
    id: 5,
    question: "How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?",
    options: [
      { text: "Never", value: 0 },
      { text: "Rarely", value: 1 },
      { text: "Sometimes", value: 2 },
      { text: "Often", value: 3 },
      { text: "Very Often", value: 4 }
    ]
  },
  {
    id: 6,
    question: "How often do you feel overly active and compelled to do things, like you were driven by a motor?",
    options: [
      { text: "Never", value: 0 },
      { text: "Rarely", value: 1 },
      { text: "Sometimes", value: 2 },
      { text: "Often", value: 3 },
      { text: "Very Often", value: 4 }
    ]
  },
  {
    id: 7,
    question: "How often do you make careless mistakes when you have to work on a boring or difficult project?",
    options: [
      { text: "Never", value: 0 },
      { text: "Rarely", value: 1 },
      { text: "Sometimes", value: 2 },
      { text: "Often", value: 3 },
      { text: "Very Often", value: 4 }
    ]
  },
  {
    id: 8,
    question: "How often do you have difficulty keeping your attention when you are doing boring or repetitive work?",
    options: [
      { text: "Never", value: 0 },
      { text: "Rarely", value: 1 },
      { text: "Sometimes", value: 2 },
      { text: "Often", value: 3 },
      { text: "Very Often", value: 4 }
    ]
  },
  {
    id: 9,
    question: "How often do you have difficulty concentrating on what people say to you, even when they are speaking to you directly?",
    options: [
      { text: "Never", value: 0 },
      { text: "Rarely", value: 1 },
      { text: "Sometimes", value: 2 },
      { text: "Often", value: 3 },
      { text: "Very Often", value: 4 }
    ]
  },
  {
    id: 10,
    question: "How often do you misplace or have difficulty finding things at home or at work?",
    options: [
      { text: "Never", value: 0 },
      { text: "Rarely", value: 1 },
      { text: "Sometimes", value: 2 },
      { text: "Often", value: 3 },
      { text: "Very Often", value: 4 }
    ]
  }
]

export default function ADHDTestPage() {
  const router = useRouter()
  const { refreshProfile } = useTracking()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = value
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < ADHD_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      submitTest()
    }
  }

  const submitTest = async () => {
    setLoading(true)
    try {
      const totalScore = answers.reduce((sum, answer) => sum + (answer || 0), 0)
      const adhdScore = Math.round((totalScore / (ADHD_QUESTIONS.length * 4)) * 100)
      
      const res = await fetch('/api/user/adhd-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adhdScore })
      })
      
      if (res.ok) {
        await refreshProfile()
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error submitting test:', error)
    } finally {
      setLoading(false)
    }
  }

  const progress = ((currentQuestion + 1) / ADHD_QUESTIONS.length) * 100
  const currentQ = ADHD_QUESTIONS[currentQuestion]

  return (
    <div className="min-h-screen mesh-gradient text-white overflow-hidden font-display selection:bg-primary/30">
      <div className="relative flex h-screen w-full max-w-md mx-auto flex-col p-6">
        {/* Background decoration */}
        <div className="fixed top-0 left-0 w-full h-full -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-primary/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[20%] right-[5%] w-80 h-80 bg-purple-500/10 blur-[120px] rounded-full" />
        </div>

        <div className="flex-1 flex flex-col gap-6 relative z-10">


          {/* Header Section */}
          <header className="flex flex-col gap-4 pt-4 pb-2">
            <div className="flex items-center justify-between">
              <button onClick={() => router.back()} className="text-white/70 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
              <h1 className="text-sm font-semibold tracking-wider uppercase text-white/50">Assessment</h1>
              <div className="w-6" /> {/* Spacer */}
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <h2 className="text-2xl font-bold text-white">
                  Question {currentQuestion + 1} <span className="text-white/40 font-medium text-lg">of {ADHD_QUESTIONS.length}</span>
                </h2>
                <span className="text-primary text-sm font-semibold">{Math.round(progress)}% Complete</span>
              </div>
              <ProgressBar progress={progress} />
            </div>
          </header>

          {/* Question Card */}
          <main className="flex-1 flex flex-col gap-6 overflow-y-auto no-scrollbar pb-24">
            <Card 
              key={currentQuestion}
              className="rounded-xl p-8 shadow-2xl relative overflow-hidden transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 hover:shadow-[0_20px_40px_-15px_rgba(19,182,236,0.3)]"
            >
              <p className="text-lg md:text-xl font-medium leading-relaxed text-white text-center">
                {currentQ.question}
              </p>
            </Card>

            {/* Answer Options */}
            <div className="flex flex-col gap-3">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option.value)}
                  className="relative group cursor-pointer w-full text-left"
                >
                  <div className={`flex items-center justify-between p-5 rounded-xl border transition-all duration-200 ${
                    answers[currentQuestion] === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}>
                    <span className={`text-lg font-medium transition-colors ${
                      answers[currentQuestion] === option.value ? 'text-white' : 'text-white/80'
                    }`}>
                      {option.text}
                    </span>
                    
                    {/* Custom Radio Indicator */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      answers[currentQuestion] === option.value ? 'border-primary' : 'border-white/20'
                    }`}>
                      <div className={`w-3 h-3 rounded-full bg-primary transition-opacity ${
                        answers[currentQuestion] === option.value ? 'opacity-100' : 'opacity-0'
                      }`} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </main>

          {/* Bottom Navigation */}
          <footer className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent pt-12 z-20">
            <div className="max-w-md mx-auto flex items-center justify-between gap-4">
              <Button
                variant="ghost"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="flex items-center gap-2 h-14"
              >
                <span>Previous</span>
              </Button>
              
              <Button
                variant="primary"
                fullWidth
                onClick={handleNext}
                disabled={answers[currentQuestion] === undefined || loading}
                className="flex items-center justify-center gap-2 h-14"
              >
                <span>{loading ? 'Processing...' : currentQuestion === ADHD_QUESTIONS.length - 1 ? 'Complete Test' : 'Next Question'}</span>
              </Button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
