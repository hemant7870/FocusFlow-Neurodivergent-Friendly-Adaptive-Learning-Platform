"use client";
import Link from 'next/link';
import { modules } from '@/lib/content/modules';
import { useEffect, useState } from 'react';

export default function LearningHub() {
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => {
        if (data.progress?.completedModules) {
          setCompletedModules(data.progress.completedModules);
        }
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Learning Hub</h1>
           <p className="text-gray-500">Master your focus with these short lessons.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const isCompleted = completedModules.includes(module.id);
          return (
            <Link 
              href={`/dashboard/learning/${module.id}`} 
              key={module.id}
              className={`block bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all border-2 ${isCompleted ? 'border-green-500' : 'border-transparent hover:border-blue-500'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  module.category === 'Focus' ? 'bg-blue-100 text-blue-800' :
                  module.category === 'Mindfulness' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {module.category}
                </span>
                {isCompleted && <span className="text-green-500 font-bold">✓ Done</span>}
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{module.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                {module.description}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>⏱️ {module.duration} min</span>
                <span className="font-bold text-yellow-600">+{module.xpReward} XP</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
