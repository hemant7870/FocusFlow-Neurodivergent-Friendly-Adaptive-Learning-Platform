"use client";
import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import EyeTrackerDebug from "@/components/tracking/EyeTracker";
import { EyeTrackerProvider } from "@/components/tracking/EyeTrackerContext";
import { 
  LayoutDashboard, 
  Gamepad2, 
  Target, 
  Library, 
  LineChart, 
  GraduationCap, 
  ClipboardCheck, 
  Eye, 
  FileText, 
  Settings, 
  LogOut,
  ShieldCheck
} from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user/profile");
        const data = await res.json();
        setRole(data.role);
      } catch (err) {
        console.error("Failed to fetch user role:", err);
      }
    };
    fetchUser();
  }, []);

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard, roles: ['Student', 'Educator', 'Admin'] },
    { name: "Student Console", href: "/dashboard/educator", icon: GraduationCap, roles: ['Educator', 'Admin'] },
    { name: "Admin Console", href: "/dashboard/admin", icon: ShieldCheck, roles: ['Admin'] },
    { name: "Gamified Dashboard", href: "/dashboard/gamified", icon: Gamepad2, roles: ['Student'] },
    { name: "Interactive Learning", href: "/dashboard/interactive-learning", icon: Target, roles: ['Student'] },
    { name: "Content Hub", href: "/dashboard/content-hub", icon: Library, roles: ['Student'] },
    { name: "Real-Time Analytics", href: "/dashboard/realtime", icon: LineChart, roles: ['Student', 'Educator', 'Admin'] },
    { name: "Learning Hub", href: "/learn", icon: GraduationCap, roles: ['Student'] },
    { name: "ADHD Test", href: "/adhd-test", icon: ClipboardCheck, roles: ['Student'] },
    { name: "Attention Tracker", href: "/dashboard/attention", icon: Eye, roles: ['Student'] },
    { name: "Reports", href: "/dashboard/reports", icon: FileText, roles: ['Student', 'Educator', 'Admin'] },
    { name: "Settings", href: "/dashboard/settings", icon: Settings, roles: ['Student', 'Educator', 'Admin'] },
  ];

  const filteredNavItems = navItems.filter(item => !item.roles || (role && item.roles.includes(role)));

  return (
    <div className="min-h-screen flex bg-black mesh-bg text-white font-sans selection:bg-cyan-500/30">
        {/* Glassmorphic Sidebar */}
        <aside className="w-64 fixed inset-y-0 left-0 z-50 glass-panel border-r border-white/10 flex flex-col backdrop-blur-xl">
           <div className="p-6 flex items-center justify-center border-b border-white/5">
              <Link href="/" className="group">
                 <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 neon-text group-hover:scale-105 transition-transform">
                    FocusFlow
                 </h1>
              </Link>
           </div>

           <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {filteredNavItems.map((item) => {
                 const isActive = pathname === item.href;
                 const Icon = item.icon;
                 return (
                    <Link
                       key={item.href}
                       href={item.href}
                       className={`relative group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                          isActive 
                             ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)] border border-cyan-500/30" 
                             : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                       }`}
                    >
                       {isActive && (
                          <motion.div
                             layoutId="sidebar-active"
                             className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10"
                             initial={false}
                             transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                       )}
                       <span className={`transition-transform group-hover:scale-110 ${isActive ? "scale-110" : ""}`}>
                          <Icon size={20} className={isActive ? "text-cyan-400" : ""} />
                       </span>
                       <span className={`font-medium relative z-10 ${isActive ? "text-cyan-100" : ""}`}>
                          {item.name}
                       </span>
                       {isActive && (
                          <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                       )}
                    </Link>
                 );
              })}
           </nav>

           <div className="p-4 border-t border-white/5 bg-black/20">
              <button
                 onClick={handleLogout}
                 className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 border border-transparent transition-all group"
              >
                 <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                 <span className="font-medium">Disconnect</span>
              </button>
           </div>
        </aside>

        {/* Main Content Area - Offset for fixed sidebar */}
        <main className="flex-1 ml-64 min-h-screen relative">
           {/* Background Grid Elements */}
           <div className="fixed inset-0 pointer-events-none z-0">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.03]"></div>
           </div>
           
           <div className="relative z-10 p-8 md:p-12 max-w-7xl mx-auto">
              {children}
           </div>
        </main>

        <EyeTrackerDebug />
      </div>
  );
}
