"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  BarChart3, 
  UserPlus, 
  Settings,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface AdminStats {
  totalUsers: number;
  roleDistribution: Record<string, number>;
  trends: { date: string, newUsers: number }[];
}

interface RecentUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data.stats || null);
      setRecentUsers(data.recentUsers || []);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: stats?.trends.map(t => t.date) || [],
    datasets: [
      {
        label: 'New User Signups',
        data: stats?.trends.map(t => t.newUsers) || [],
        backgroundColor: 'rgba(34, 211, 238, 0.6)',
        borderRadius: 8,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
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

  if (loading) return <div className="p-8">Loading Admin Console...</div>;

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-amber-400">
            Admin Central
          </h1>
          <p className="text-slate-400">Manage platform health and user access control</p>
        </div>
        <button className="glass-card px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-colors border border-white/5">
          <Settings size={18} />
          <span>System Settings</span>
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-white/5">
          <div className="text-sm text-slate-400 mb-1">Total Users</div>
          <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
          <div className="mt-2 flex items-center gap-1 text-xs text-green-400">
            <ArrowUpRight size={14} />
            <span>12% from last month</span>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-white/5">
          <div className="text-sm text-slate-400 mb-1">Active Students</div>
          <div className="text-3xl font-bold">{stats?.roleDistribution['Student'] || 0}</div>
          <div className="mt-2 flex items-center gap-1 text-xs text-cyan-400">
            <BarChart3 size={14} />
            <span>85% engagement rate</span>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-white/5">
          <div className="text-sm text-slate-400 mb-1">Educators</div>
          <div className="text-3xl font-bold">{stats?.roleDistribution['Educator'] || 0}</div>
          <div className="mt-2 flex items-center gap-1 text-xs text-purple-400">
            <ShieldCheck size={14} />
            <span>Verified accounts</span>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-white/5">
          <div className="text-sm text-slate-400 mb-1">System Load</div>
          <div className="text-3xl font-bold">24%</div>
          <div className="mt-2 flex items-center gap-1 text-xs text-amber-400">
            <ArrowDownRight size={14} />
            <span>Optimal performance</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Signup Trends */}
        <div className="lg:col-span-7 glass-card p-6 rounded-3xl border border-white/5">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <UserPlus size={20} className="text-cyan-400" />
            Signup Velocity
          </h2>
          <div className="h-[300px]">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="lg:col-span-5 glass-card p-6 rounded-3xl border border-white/5 overflow-hidden">
          <h2 className="text-xl font-semibold mb-6">Recent Registrations</h2>
          <div className="space-y-4">
            {recentUsers.map((user) => (
              <div key={user._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                    user.role === 'Admin' ? 'bg-red-500/20 text-red-400' : 
                    user.role === 'Educator' ? 'bg-purple-500/20 text-purple-400' : 
                    'bg-cyan-500/20 text-cyan-400'
                  }`}>
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{user.name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                    user.role === 'Admin' ? 'border-red-500/30 text-red-400 bg-red-500/10' : 
                    user.role === 'Educator' ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' : 
                    'border-cyan-500/30 text-cyan-400 bg-cyan-500/10'
                  }`}>
                    {user.role}
                  </span>
                  <button className="text-slate-600 hover:text-white">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-all">
            View All Users
          </button>
        </div>
      </div>
    </div>
  );
}
