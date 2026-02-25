"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      let data: any = null;
      try {
        data = await res.json();
      } catch (e) {
        console.error("Failed to parse login response:", e);
      }
      if (!res.ok) throw new Error(data?.error || "Login failed");
      
      const userRes = await fetch("/api/user/profile");
      const userData = await userRes.json();

      if (userData.role === 'Admin') {
        router.push("/dashboard/admin");
      } else if (userData.role === 'Educator') {
        router.push("/dashboard/educator");
      } else if (userData.adhdScore === null || userData.adhdScore === undefined) {
        router.push("/adhd-test");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-black mesh-bg relative overflow-hidden text-white selection:bg-cyan-500/30">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow" />
        <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[440px] relative z-10 px-4"
      >
        <div className="glass-panel p-8 md:p-12 relative overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          {/* Decorative Glow */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
          
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 neon-text">
              Welcome Back
            </h1>
            <p className="text-slate-400 text-lg">Ready to focus?</p>
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

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2 group">
              <label className="text-sm font-medium text-slate-300 ml-1 group-focus-within:text-cyan-400 transition-colors">Email</label>
              <div className="relative">
                <input
                  className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-5 py-4 outline-none focus:bg-black/40 focus:border-cyan-500/50 focus:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300 placeholder:text-slate-600"
                  placeholder="name@example.com"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium text-slate-300 group-focus-within:text-cyan-400 transition-colors">Password</label>
                <Link href="/forgot-password">
                  <span className="text-xs font-medium text-cyan-400 hover:text-cyan-300 cursor-pointer transition-colors">
                    Forgot Password?
                  </span>
                </Link>
              </div>
              <div className="relative">
                <input
                  className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-5 py-4 outline-none focus:bg-black/40 focus:border-cyan-500/50 focus:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300 placeholder:text-slate-600"
                  placeholder="••••••••"
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold rounded-xl py-4 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-4 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  "Sign In"
                )}
              </span>
            </motion.button>
          </form>

          <div className="mt-10 text-center space-y-6">
            <p className="text-sm text-slate-400 font-medium">
              Don&apos;t have an account?{" "}
              <Link href="/signup">
                <span className="text-cyan-400 font-bold hover:text-cyan-300 cursor-pointer transition-colors">
                  Sign up now
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
          </div>
        </div>
      </motion.div>
    </main>
  );
}
