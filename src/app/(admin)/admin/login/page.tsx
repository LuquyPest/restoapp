import AdminLoginForm from "@/components/admin/AdminLoginForm"
import { ShieldCheck } from "lucide-react"

export default function AdminLoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, hsl(224 71% 4%) 0%, hsl(222 47% 7%) 50%, hsl(262 40% 8%) 100%)" }}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none fixed top-1/4 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-red-600/5 blur-3xl" />
      <div className="pointer-events-none fixed bottom-1/4 left-1/2 -translate-x-1/2 h-64 w-96 rounded-full bg-violet-600/5 blur-3xl" />

      {/* Subtle grid */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(to right,white 1px,transparent 1px),linear-gradient(to bottom,white 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="relative z-10 w-full max-w-sm animate-fade-in">

        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 shadow-lg shadow-red-500/10">
            <ShieldCheck className="h-7 w-7 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Administration</h1>
          <p className="mt-1.5 text-sm text-white/40">Accès restreint — Super Admin uniquement</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/8 bg-white/4 p-7 shadow-2xl backdrop-blur-xl">
          <AdminLoginForm />
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-white/20">
          RestoCompta — Panel d&apos;administration
        </p>
      </div>
    </div>
  )
}
