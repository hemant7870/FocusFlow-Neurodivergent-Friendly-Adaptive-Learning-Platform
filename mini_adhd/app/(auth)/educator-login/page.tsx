"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function EducatorLoginPage() {
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
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Login failed");
      
      // Verify role after login
      const userRes = await fetch("/api/user/profile");
      const userData = await userRes.json();
      
      if (userData.role !== 'Educator' && userData.role !== 'Admin') {
        throw new Error("Access denied. This portal is for educators only.");
      }

      router.push("/dashboard/educator");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-black mesh-bg relative overflow-hidden text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-green-500/10 blur-[120px] rounded-full animate-pulse-slow" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[440px] relative z-10 px-4"
      >
        <div className="glass-panel p-8 border border-white/10">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-cyan-400">
              Educator Portal
            </h1>
            <p className="text-slate-400">Sign in to support your students</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-200 text-sm rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Work Email</label>
              <input
                className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-5 py-4 outline-none focus:border-green-500/50 transition-all"
                placeholder="educator@school.edu"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <input
                className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-5 py-4 outline-none focus:border-green-500/50 transition-all"
                placeholder="••••••••"
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-xl py-4 shadow-[0_0_20px_rgba(74,222,128,0.2)]"
            >
              {loading ? "Authenticating..." : "Educator Login"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <Link href="/login" className="text-slate-500 hover:text-white transition-colors">
              Looking for student login?
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
