"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getADHDLevel, getLearningMode } from "@/lib/adaptiveEngine";
import HeatmapOverlay from "@/components/visualization/HeatmapOverlay";
import FocusReport from "@/components/reports/FocusReport";
import { useTracking } from "@/components/context/TrackingContext";

interface UserProfile {
  name: string;
  adhdScore?: number;
  preferences: {
    preferredMode?: "text" | "visual" | "audio";
  };
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  
  // Tracking State
  // Tracking State (Consumed from Context)
  // const [attentionMetrics, setAttentionMetrics] = useState<AttentionMetrics>(...); // Removed
  // const [adhdProfile, setAdhdProfile] = useState<ADHDProfile>(...); // Removed
  // const [history, setHistory] = useState<AttentionMetrics[]>([]); // Removed

  // Gamification State
  const [totalPoints, setTotalPoints] = useState(0);
  const [focusSeconds, setFocusSeconds] = useState(0);
  const [level, setLevel] = useState(1);

  // Global Tracking State
  const { attentionMetrics, mouseMetrics, eyeMetrics, adhdProfile, history } = useTracking();

  // Gamification Logic (Effect based on global metrics)
  useEffect(() => {
    if (attentionMetrics.state === 'focused' || attentionMetrics.state === 'hyperfocus') {
      setFocusSeconds(prev => {
        const newSeconds = prev + 1;
        // Every 60 seconds of focus, award points
        if (newSeconds >= 60) {
          updateGamification(60, attentionMetrics.score);
          return 0;
        }
        return newSeconds;
      });
    }
  }, [attentionMetrics.state, attentionMetrics.score]); // Run when state/score updates

  const updateGamification = async (duration: number, attentionScore: number) => {
    try {
      const res = await fetch('/api/gamification/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'focus-session',
          data: { duration, attentionScore }
        })
      });
      const data = await res.json();
      if (data.success) {
        setTotalPoints(data.newTotal);
      }
    } catch (error) {
      console.error("Error updating gamification:", error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      setProfile(data);
      if (data.gamification?.points) {
        setTotalPoints(data.gamification.points);
        setLevel(data.gamification.level || 1);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    alert("Exporting PDF report... (Feature simulated)");
  };

  if (loading) return <div className="p-8">Loading...</div>;

  const adhdLevel = profile?.adhdScore !== undefined ? getADHDLevel(profile.adhdScore) : "Not Taken";
  const attentionPercent = Math.round(attentionMetrics.score * 100);

  return (
    <main className="min-h-screen mesh-bg text-white p-4 md:p-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-primary/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-purple-500/10 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        <HeatmapOverlay 
          mousePosition={mouseMetrics.position} 
          gazePosition={{ x: eyeMetrics.gazeX, y: eyeMetrics.gazeY }} 
          show={showHeatmap} 
        />

        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">{profile?.name || "Learner"}</span>
            </h1>
            <p className="text-blue-100/60 font-medium">Ready to achieve your flow state?</p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-2 rounded-2xl">
             <div className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-xl flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <span className="font-bold text-yellow-300">{totalPoints} pts</span>
             </div>
             <div className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center gap-2">
                <span className="text-xl">⭐</span>
                <span className="font-bold text-purple-300">Lvl {level}</span>
             </div>
          </div>
        </header>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Hero Metric (Span 8) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
             {/* Hero Gauge */}
             <div className="glass-card rounded-3xl p-8 min-h-[350px] flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-500/5 group-hover:opacity-100 transition-opacity opacity-0" />
                
                <h2 className="text-xl font-medium text-white/70 mb-6 uppercase tracking-widest text-sm">Real-time Attention</h2>
                
                <div className="relative flex items-center justify-center">
                   {/* Glow Effect */}
                   <div className={`absolute inset-0 rounded-full blur-[50px] transition-all duration-1000 ${
                      attentionMetrics.state === 'focused' ? 'bg-green-500/20' : 
                      attentionMetrics.state === 'distracted' ? 'bg-red-500/20' : 'bg-blue-500/20'
                   }`} />

                   {/* SVG Gauge */}
                   <svg className="w-64 h-64 transform -rotate-90">
                      <circle
                         cx="128"
                         cy="128"
                         r="110"
                         fill="transparent"
                         stroke="currentColor"
                         strokeWidth="12"
                         className="text-white/5"
                      />
                      <motion.circle
                         cx="128"
                         cy="128"
                         r="110"
                         fill="transparent"
                         stroke={
                            attentionMetrics.state === 'focused' ? '#4ade80' : 
                            attentionMetrics.state === 'distracted' ? '#f87171' : '#60a5fa'
                         }
                         strokeWidth="12"
                         strokeLinecap="round"
                         initial={{ pathLength: 0 }}
                         animate={{ pathLength: attentionMetrics.score }}
                         transition={{ duration: 1, ease: "easeOut" }}
                         className="drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                      />
                   </svg>

                   {/* Center Text */}
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-6xl font-bold tracking-tighter text-white">
                         {attentionPercent}<span className="text-2xl text-white/50">%</span>
                      </span>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                           attentionMetrics.state === 'focused' ? 'bg-green-500 text-green-950' : 
                           attentionMetrics.state === 'distracted' ? 'bg-red-500 text-red-950' : 'bg-blue-500 text-blue-950'
                        }`}
                      >
                         {attentionMetrics.state}
                      </motion.div>
                   </div>
                </div>

                <p className="mt-8 text-white/40 text-sm max-w-md text-center">
                   Based on live analysis of mouse movement patterns ({Math.round(mouseMetrics.erraticScore * 100)}% stability) and eye gaze consistency.
                </p>
             </div>

             {/* Detailed Report Component */}
             <div className="glass-card rounded-2xl p-6">
                <FocusReport 
                  currentMetrics={attentionMetrics} 
                  adhdProfile={adhdProfile} 
                  onExport={handleExport} 
                />
             </div>
          </div>

          {/* Right Column: Secondary Metrics (Span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* Screening Result Card */}
            <div className="glass-card rounded-3xl p-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="text-4xl">📝</span>
               </div>
               
               <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-500/20 p-2 rounded-xl text-blue-300">
                     <span className="text-xl">📊</span>
                  </div>
                  <div>
                     <h3 className="font-semibold text-white/90">Screening Result</h3>
                     <p className="text-xs text-white/50">Baseline Profile</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between items-end">
                     <div>
                        <div className="text-sm text-white/60 mb-1">ADHD Indication</div>
                        <div className={`text-2xl font-bold ${
                           adhdLevel === 'High' ? 'text-red-400' : 
                           adhdLevel === 'Moderate' ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                           {adhdLevel}
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-sm text-white/60 mb-1">Score</div>
                        <div className="text-xl font-mono text-white/90">{profile?.adhdScore || 0}/100</div>
                     </div>
                  </div>
                  
                  {/* Score Progress Bar */}
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                     <div 
                        className={`h-full rounded-full ${
                           adhdLevel === 'High' ? 'bg-red-500' : 
                           adhdLevel === 'Moderate' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${profile?.adhdScore || 0}%` }}
                     />
                  </div>
               </div>
            </div>
            
            {/* Mouse Activity Card */}
            <motion.div 
               className="glass-card rounded-3xl p-6 relative overflow-hidden group"
               whileHover={{ scale: 1.02 }}
               transition={{ type: "spring", stiffness: 300 }}
            >
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg className="w-24 h-24" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2v10h-2V2h2m0 16h-2v4h2v-4m-6-6H3v-2h4v2m14 0h-4v-2h4v2M3 12a9 9 0 0 1 9-9 9 9 0 0 1 9 9 9 9 0 0 1-9 9 9 9 0 0 1-9-9z"/></svg>
               </div>
               
               <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-2xl ${mouseMetrics.isIdle ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300'}`}>
                     <span className="text-xl">🖱️</span>
                  </div>
                  <div>
                     <div className="text-xs font-bold text-white/40 uppercase tracking-wider">Mouse Activity</div>
                     <div className="font-semibold text-lg">{mouseMetrics.isIdle ? 'Idle' : 'Active'}</div>
                  </div>
               </div>
               
               <div className="space-y-2">
                  <div className="flex justify-between text-xs text-white/60">
                     <span>Stability</span>
                     <span>{Math.round((1 - mouseMetrics.erraticScore) * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                     <motion.div 
                        className="h-full bg-green-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${(1 - mouseMetrics.erraticScore) * 100}%` }}
                     />
                  </div>
               </div>
            </motion.div>

            {/* Eye Contact Card */}
            <motion.div 
               className="glass-card rounded-3xl p-6 relative overflow-hidden group"
               whileHover={{ scale: 1.02 }}
               transition={{ type: "spring", stiffness: 300 }}
            >
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg className="w-24 h-24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
               </div>

               <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-2xl ${eyeMetrics.isDistracted ? 'bg-red-500/20 text-red-300' : 'bg-purple-500/20 text-purple-300'}`}>
                     <span className="text-xl">👁️</span>
                  </div>
                  <div>
                     <div className="text-xs font-bold text-white/40 uppercase tracking-wider">Eye Contact</div>
                     <div className="font-semibold text-lg">{eyeMetrics.isDistracted ? 'Distracted' : 'Focused'}</div>
                  </div>
               </div>
               
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 text-xs text-white/70">
                  <div className={`w-1.5 h-1.5 rounded-full ${eyeMetrics.isDistracted ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
                  {eyeMetrics.isDistracted ? 'Please resume eye contact' : 'Tracking active'}
               </div>
            </motion.div>

            {/* Quick Actions */}
            <div className="space-y-3">
               <h3 className="font-medium text-white/60 ml-1">Quick Launch</h3>
               
               <Link href="/dashboard/gamified" className="block">
                  <div className="glass-card p-4 rounded-2xl hover:bg-white/10 transition-colors flex items-center justify-between group">
                     <div className="flex items-center gap-3">
                        <div className="bg-yellow-500/20 p-2 rounded-xl text-yellow-300">🎮</div>
                        <div>
                           <div className="font-semibold text-white/90">Gamified Mode</div>
                           <div className="text-xs text-white/50">Earn points & badges</div>
                        </div>
                     </div>
                     <span className="text-white/20 group-hover:text-white/60 transition-colors">→</span>
                  </div>
               </Link>

               <Link href="/dashboard/learning" className="block">
                  <div className="glass-card p-4 rounded-2xl hover:bg-white/10 transition-colors flex items-center justify-between group">
                     <div className="flex items-center gap-3">
                        <div className="bg-blue-500/20 p-2 rounded-xl text-blue-300">📚</div>
                        <div>
                           <div className="font-semibold text-white/90">Learning Hub</div>
                           <div className="text-xs text-white/50">Adaptive lessons</div>
                        </div>
                     </div>
                     <span className="text-white/20 group-hover:text-white/60 transition-colors">→</span>
                  </div>
               </Link>
               
               <button 
                 onClick={() => setShowHeatmap(!showHeatmap)}
                 className={`w-full p-4 rounded-2xl glass-card transition-all flex items-center justify-center gap-2 hover:bg-white/10 ${showHeatmap ? 'border-red-500/30 bg-red-500/10' : ''}`}
               >
                 <span className="text-sm font-medium text-white/70">
                   {showHeatmap ? 'Disable Heatmap Overlay' : 'Enable Heatmap Overlay'}
                 </span>
               </button>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
