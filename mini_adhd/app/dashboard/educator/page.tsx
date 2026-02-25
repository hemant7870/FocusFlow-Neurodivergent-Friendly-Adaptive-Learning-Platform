"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  TrendingUp, 
  Activity, 
  Search,
  ChevronRight,
  User as UserIcon
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Student {
  _id: string;
  name: string;
  email: string;
  adhdScore?: number;
  gamification: {
    points: number;
    level: number;
  };
  progress: {
    modulesCompleted: number;
  };
  updatedAt: string;
}

interface Stats {
  totalStudents: number;
  averageADHDScore: number;
  activeToday: number;
}

export default function EducatorDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/educator/students");
      const data = await res.json();
      setStudents(data.students || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error("Error fetching educator data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Avg Focus Score',
        data: [65, 72, 68, 85, 82, 90, 88],
        fill: true,
        borderColor: '#4ade80',
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Avg Engagement',
        data: [45, 52, 48, 65, 62, 75, 70],
        fill: true,
        borderColor: '#818cf8',
        backgroundColor: 'rgba(129, 140, 248, 0.1)',
        tension: 0.4,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: 'rgba(255, 255, 255, 0.7)' }
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'rgba(255, 255, 255, 0.5)' }
      },
      x: {
        grid: { display: false },
        ticks: { color: 'rgba(255, 255, 255, 0.5)' }
      }
    }
  };

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  if (loading) return <div className="p-8">Loading Educator Dashboard...</div>;

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
            Educator Console
          </h1>
          <p className="text-slate-400">Track and support student growth across the platform</p>
        </div>
        {selectedStudent && (
          <button 
            onClick={() => setSelectedStudent(null)}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-all"
          >
            Back to Overview
          </button>
        )}
      </header>

      {selectedStudent ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="glass-card p-8 rounded-3xl border border-white/10 flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-4xl font-bold shadow-[0_0_30px_rgba(6,182,212,0.3)]">
              {selectedStudent.name.charAt(0)}
            </div>
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div>
                <h2 className="text-3xl font-bold">{selectedStudent.name}</h2>
                <p className="text-slate-400">{selectedStudent.email}</p>
              </div>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold">
                  Level {selectedStudent.gamification?.level || 1}
                </div>
                <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold">
                  {selectedStudent.gamification?.points || 0} Points
                </div>
                <div className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 font-bold">
                  {selectedStudent.progress?.modulesCompleted || 0} Modules Done
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-card p-6 rounded-3xl border border-white/5">
              <h3 className="text-xl font-semibold mb-4">Focus Analysis</h3>
              <div className="h-[250px]">
                <Line 
                  data={{
                    labels: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'],
                    datasets: [{
                      label: 'Attention Score',
                      data: [70, 75, 72, 80, 85, 82, 90],
                      borderColor: '#4ade80',
                      backgroundColor: 'rgba(74, 222, 128, 0.1)',
                      fill: true,
                      tension: 0.4
                    }]
                  }} 
                  options={chartOptions} 
                />
              </div>
            </div>
            <div className="glass-card p-6 rounded-3xl border border-white/5">
              <h3 className="text-xl font-semibold mb-4">Recommended Interventions</h3>
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-colors">
                  <div className="font-bold text-cyan-400">Micro-breaks (suggested)</div>
                  <p className="text-sm text-slate-400">Student shows high engagement but focus drops after 15 minutes.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-colors">
                  <div className="font-bold text-purple-400">Visual Reinforcement</div>
                  <p className="text-sm text-slate-400">Adaptive engine suggests switching to visual-heavy modules.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl flex items-center gap-4 border border-white/5">
              <div className="bg-blue-500/20 p-3 rounded-xl text-blue-400">
                <Users size={24} />
              </div>
              <div>
                <div className="text-sm text-slate-400">Total Students</div>
                <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
              </div>
            </div>
            <div className="glass-card p-6 rounded-2xl flex items-center gap-4 border border-white/5">
              <div className="bg-green-500/20 p-3 rounded-xl text-green-400">
                <TrendingUp size={24} />
              </div>
              <div>
                <div className="text-sm text-slate-400">Avg ADHD Score</div>
                <div className="text-2xl font-bold">{Math.round(stats?.averageADHDScore || 0)}/100</div>
              </div>
            </div>
            <div className="glass-card p-6 rounded-2xl flex items-center gap-4 border border-white/5">
              <div className="bg-purple-500/20 p-3 rounded-xl text-purple-400">
                <Activity size={24} />
              </div>
              <div>
                <div className="text-sm text-slate-400">Active Today</div>
                <div className="text-2xl font-bold">{stats?.activeToday || 0}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Growth Chart */}
            <div className="lg:col-span-8 glass-card p-6 rounded-3xl border border-white/5">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Student Growth Trends</h2>
                <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm outline-none focus:border-cyan-500/50">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                </select>
              </div>
              <div className="h-[300px]">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Student List */}
            <div className="lg:col-span-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Search students..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 outline-none focus:border-cyan-500/50 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                  <motion.div 
                    key={student._id}
                    whileHover={{ x: 5 }}
                    onClick={() => setSelectedStudent(student)}
                    className="glass-card p-4 rounded-2xl border border-white/5 flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                        {student.name ? student.name.charAt(0) : '?'}
                      </div>
                      <div>
                        <div className="font-medium">{student.name || 'Anonymous'}</div>
                        <div className="text-xs text-slate-500">Lvl {student.gamification?.level || 1} • {student.progress?.modulesCompleted || 0} Modules</div>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                  </motion.div>
                )) : (
                  <div className="text-center py-8 text-slate-500 border border-dashed border-white/10 rounded-2xl">
                    No students found
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
