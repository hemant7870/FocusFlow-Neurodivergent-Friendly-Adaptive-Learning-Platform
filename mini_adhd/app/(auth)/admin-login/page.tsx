"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";

export default function AdminLoginPage() {
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
      
      // Strict role verification
      const userRes = await fetch("/api/user/profile");
      const userData = await userRes.json();
      
      if (userData.role !== 'Admin') {
        throw new Error("Critical Access Error: User is not an authorized administrator.");
      }

      router.push("/dashboard/admin");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-black mesh-bg relative overflow-hidden text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-red-500/10 blur-[120px] rounded-full animate-pulse-slow" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] relative z-10 px-4"
      >
        <div className="glass-panel p-8 border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.1)]">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <ShieldAlert className="text-red-500 w-12 h-12" />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-amber-400">
              Admin Central
            </h1>
            <p className="text-slate-400">Restricted System Access</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-200 text-sm rounded-xl border-l-4 border-l-red-500">
               {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Admin Identifier</label>
              <input
                className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-5 py-4 outline-none focus:border-red-500/50 transition-all font-mono text-sm"
                placeholder="admin@focusflow.ai"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Security Key</label>
              <input
                className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-5 py-4 outline-none focus:border-red-500/50 transition-all font-mono"
                placeholder="••••••••"
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold rounded-xl py-4 shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all"
            >
              {loading ? "Verifying..." : "Authorize Access"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/" className="text-slate-500 hover:text-white transition-colors text-xs uppercase tracking-widest font-bold">
              Return to Public Portal
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
