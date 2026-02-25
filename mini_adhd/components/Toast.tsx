"use client"
import { useEffect, useState } from 'react'

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => {
    if (!msg) return
    const id = setTimeout(() => setMsg(null), 3000)
    return () => clearTimeout(id)
  }, [msg])
  return { msg, show: (m: string) => setMsg(m) }
}

export default function Toast({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-2 rounded-xl shadow">
      {message}
      <audio autoPlay src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYAZGF0YQAAAAA=" />
    </div>
  )
}

