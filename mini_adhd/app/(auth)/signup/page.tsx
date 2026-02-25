"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Student",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      let data: any = null;
      try {
        data = await res.json();
      } catch {
        /* response not JSON or empty */
      }
      if (!res.ok) throw new Error(data?.error || "Signup failed");
      
      if (data?.role === 'Educator') {
        router.push("/dashboard/educator");
      } else if (data?.role === 'Admin') {
        router.push("/dashboard/admin");
      } else {
        router.push("/adhd-test");
      }
    } catch (err: any) {
      console.error('Signup Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleSocialLogin = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-black mesh-bg relative overflow-hidden text-white selection:bg-purple-500/30">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[20%] w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow" />
        <div className="absolute bottom-[20%] left-[10%] w-[600px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[480px] relative z-10 px-4"
      >
        <div className="glass-panel p-8 md:p-10 relative overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
           {/* Decorative Glow */}
           <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 neon-text">
              Create Your Account
            </h2>
            <p className="text-slate-400 text-sm">
              Join our adaptive learning community 🌱
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-200 text-sm rounded-xl flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 shrink-0 shadow-[0_0_10px_#ef4444]" />
              {error}
            </motion.div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1 group">
               <label className="text-xs font-medium text-slate-400 ml-1 group-focus-within:text-purple-400 transition-colors">Full Name</label>
               <input
                className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-5 py-3 outline-none focus:bg-black/40 focus:border-purple-500/50 focus:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all duration-300 placeholder:text-slate-600"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1 group">
               <label className="text-xs font-medium text-slate-400 ml-1 group-focus-within:text-purple-400 transition-colors">Email Address</label>
              <input
                className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-5 py-3 outline-none focus:bg-black/40 focus:border-purple-500/50 focus:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all duration-300 placeholder:text-slate-600"
                placeholder="name@example.com"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1 group">
               <label className="text-xs font-medium text-slate-400 ml-1 group-focus-within:text-purple-400 transition-colors">Password</label>
              <input
                className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-5 py-3 outline-none focus:bg-black/40 focus:border-purple-500/50 focus:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all duration-300 placeholder:text-slate-600"
                placeholder="••••••••"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1 group">
               <label className="text-xs font-medium text-slate-400 ml-1 group-focus-within:text-purple-400 transition-colors">I am a...</label>
              <div className="relative">
                <select
                  className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-5 py-3 outline-none focus:bg-black/40 focus:border-purple-500/50 focus:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all duration-300 appearance-none cursor-pointer hover:bg-white/5"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="Student" className="bg-slate-900 text-white">🎓 Student</option>
                  <option value="Parent" className="bg-slate-900 text-white">👨‍👩‍👧 Parent</option>
                  <option value="Educator" className="bg-slate-900 text-white">📚 Educator</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl py-4 shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-6 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative">
                 {loading ? "Creating Account..." : "Sign Up"}
              </span>
            </motion.button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black/50 backdrop-blur-md px-2 text-slate-500">Or sign up with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSocialLogin}
              className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-xl py-3 text-slate-300 font-semibold hover:bg-white/10 hover:border-white/20 hover:text-white transition-all duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>

            <p className="text-center text-sm text-slate-400 pt-2 font-medium">
              Already have an account?{" "}
              <Link href="/login">
                <span className="text-purple-400 hover:text-purple-300 font-bold cursor-pointer transition-colors">
                  Log in
                </span>
              </Link>
            </p>

            <div className="pt-6 border-t border-white/5 flex flex-wrap justify-center gap-6 opacity-60 hover:opacity-100 transition-opacity">
              <Link href="/educator-login" className="text-[10px] font-bold uppercase tracking-[0.2em] hover:text-cyan-400 transition-colors">
                Educator Access
              </Link>
              <Link href="/admin-login" className="text-[10px] font-bold uppercase tracking-[0.2em] hover:text-red-400 transition-colors">
                Admin Console
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </main>
  );
}
