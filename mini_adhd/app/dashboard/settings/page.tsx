"use client"
import { useEffect, useState } from 'react'

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<any>({ fontSize: 'medium', backgroundColor: '#f8fafc', contrast: 'normal', spacing: 'normal', speechSpeed: 1.0, animationEnabled: true })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/user/preferences').then(r => r.json()).then(d => {
      setPrefs({ ...prefs, ...d.preferences })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function save() {
    setSaving(true)
    await fetch('/api/user/preferences', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(prefs) })
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Settings</h2>
      <div className="bg-white rounded-xl p-4 shadow space-y-3">
        <div>
          <div className="text-sm text-slate-500 mb-1">Font Size</div>
          <select className="border rounded-xl p-2" value={prefs.fontSize} onChange={e => setPrefs({ ...prefs, fontSize: e.target.value })}>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="xl">XL</option>
          </select>
        </div>
        <div>
          <div className="text-sm text-slate-500 mb-1">Background Color</div>
          <input type="color" value={prefs.backgroundColor || '#f8fafc'} onChange={e => setPrefs({ ...prefs, backgroundColor: e.target.value })} />
        </div>
        <div>
          <div className="text-sm text-slate-500 mb-1">Contrast</div>
          <select className="border rounded-xl p-2" value={prefs.contrast} onChange={e => setPrefs({ ...prefs, contrast: e.target.value })}>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <div className="text-sm text-slate-500 mb-1">Spacing</div>
          <select className="border rounded-xl p-2" value={prefs.spacing} onChange={e => setPrefs({ ...prefs, spacing: e.target.value })}>
            <option value="compact">Compact</option>
            <option value="normal">Normal</option>
            <option value="relaxed">Relaxed</option>
          </select>
        </div>
        <div>
          <div className="text-sm text-slate-500 mb-1">Speech Speed</div>
          <input 
            type="range" 
            min="0.5" 
            max="2" 
            step="0.1" 
            value={prefs.speechSpeed || 1.0} 
            onChange={e => setPrefs({ ...prefs, speechSpeed: parseFloat(e.target.value) })}
            className="w-full"
          />
          <div className="text-xs text-gray-400">{prefs.speechSpeed || 1.0}x speed</div>
        </div>
        <div>
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={prefs.animationEnabled !== false} 
              onChange={e => setPrefs({ ...prefs, animationEnabled: e.target.checked })}
            />
            <span className="text-sm text-slate-500">Enable animations</span>
          </label>
        </div>
        <button onClick={save} className="px-3 py-2 rounded-xl bg-primary-600 text-white" disabled={saving}>{saving ? 'Saving...' : 'Save Preferences'}</button>
      </div>
      <div className={`${prefs.fontSize}`} style={{ background: prefs.backgroundColor }}>
        <div className="text-sm text-slate-500 mb-1">Preview</div>
        <div className="bg-white rounded-xl p-4 shadow">
          This is a preview with your current settings.
        </div>
      </div>
    </div>
  )
}

