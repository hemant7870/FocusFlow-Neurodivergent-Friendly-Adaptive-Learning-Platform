"use client"
import { useEffect, useState } from 'react'
import Toast, { useToast } from '@/components/Toast'

type Mode = 'Visual' | 'Auditory' | 'Textual'

export default function LearningHub() {
  const [mode, setMode] = useState<Mode>('Textual')
  const [suggested, setSuggested] = useState<Mode>('Textual')
  const [content, setContent] = useState<{ title: string; body: string; media: string } | null>(null)
  const { msg, show } = useToast()
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const [recognizing, setRecognizing] = useState(false)

  useEffect(() => {
    fetch('/api/learning/content').then(r => r.json()).then(d => {
      setMode(d.mode)
      setSuggested(d.suggested)
      setContent(d.content)
    })
  }, [])

  useEffect(() => {
    // persist preferred mode
    fetch('/api/user/preferences', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ preferredMode: mode }) })
  }, [mode])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Learning Hub</h2>
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-500 flex items-center gap-2">
            <input type="checkbox" checked={ttsEnabled} onChange={e => setTtsEnabled(e.target.checked)} />
            Enable Read Aloud
          </label>
          <div className="text-sm text-slate-500">Suggested: {suggested}</div>
        </div>
      </div>
      <div className="flex gap-2">
        {(['Textual','Visual','Auditory'] as Mode[]).map(m => (
          <button key={m} onClick={() => setMode(m)} className={`px-3 py-1 rounded-xl border ${mode===m?'bg-primary-600 text-white border-primary-600':'bg-white'}`}>{m}</button>
        ))}
      </div>
      <div className="bg-white rounded-xl p-4 shadow min-h-[200px]">
        {!content ? 'Loading...' : (
          <div>
            <h3 className="text-lg font-semibold mb-2">{content.title}</h3>
            <p className="text-slate-600">{content.body}</p>
            <div className="mt-3 flex gap-2">
              <button className="px-3 py-1 rounded-xl border" onClick={() => {
                // Text-to-Speech
                if (ttsEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  const utter = new SpeechSynthesisUtterance(content.body)
                  window.speechSynthesis.speak(utter)
                }
              }}>Read Aloud</button>
              <button className="px-3 py-1 rounded-xl border" onClick={() => {
                // Voice command (Speech Recognition)
                const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
                if (!SR) { show('Speech Recognition not supported'); return }
                const rec = new SR()
                setRecognizing(true)
                rec.lang = 'en-US'
                rec.onresult = (e: any) => {
                  const transcript = e.results[0][0].transcript.toLowerCase()
                  if (transcript.includes('visual')) setMode('Visual')
                  else if (transcript.includes('audio') || transcript.includes('auditory')) setMode('Auditory')
                  else if (transcript.includes('text')) setMode('Textual')
                  show(`Voice: ${transcript}`)
                }
                rec.onend = () => setRecognizing(false)
                rec.start()
              }}>{recognizing ? 'Listening…' : 'Voice Command'}</button>
            </div>
          </div>
        )}
      </div>
      <Toast message={msg} />
    </div>
  )
}

