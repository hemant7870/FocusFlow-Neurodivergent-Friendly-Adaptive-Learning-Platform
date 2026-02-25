"use client";
import { useParams, useRouter } from 'next/navigation';
import { modules } from '@/lib/content/modules';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import confetti from 'canvas-confetti';

export default function ModuleDetail() {
  const params = useParams();
  const router = useRouter();
  const module = modules.find(m => m.id === params.id);
  
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if already completed
   useEffect(() => {
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => {
        if (data.progress?.completedModules?.includes(module?.id)) {
          setComplete(true);
        }
      })
      .catch(err => console.error(err));
  }, [module?.id]);


  if (!module) return <div>Module not found</div>;

  const handleComplete = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/modules/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId: module.id })
      });
      const data = await res.json();
      
      if (data.success || data.message === 'Module already completed') {
        setComplete(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <Link href="/dashboard/learning" className="text-sm text-gray-500 hover:text-blue-600">
        ← Back to Learning Hub
      </Link>
      
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{module.title}</h1>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>⏱️ {module.duration} mins</span>
          <span className="font-bold text-yellow-600">🏆 {module.xpReward} XP Reward</span>
        </div>
      </div>

      <div className="prose dark:prose-invert max-w-none bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm">
        <ReactMarkdown>{module.content}</ReactMarkdown>
      </div>

      <div className="flex justify-center">
        {complete ? (
           <button disabled className="px-8 py-3 bg-green-100 text-green-700 rounded-full font-bold text-lg cursor-default">
             ✅ Module Completed
           </button>
        ) : (
          <button 
            onClick={handleComplete}
            disabled={loading}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            {loading ? 'Completing...' : 'Mark as Complete & Claim XP'}
          </button>
        )}
      </div>
    </div>
  );
}
