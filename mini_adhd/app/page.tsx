import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6 mesh-bg text-white overflow-hidden relative">
      <div className="fixed top-0 left-0 w-full h-full -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-xl w-full glass-card rounded-2xl shadow-2xl p-12 text-center space-y-8 relative z-10 border-white/10">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent tracking-tight">FocusFlow</h1>
          <p className="text-xl text-white/70 font-light">AI Tutor for Neurodivergent Learners</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto min-w-[140px]">
              Get Started
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="ghost" size="lg" className="w-full sm:w-auto min-w-[140px]">
              Login
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
