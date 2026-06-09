"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(""); setLoading(true)
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Identifiants incorrects")
    } else {
      window.location.href = "/admin"
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      <div className="space-y-1.5">
        <Label htmlFor="admin-email" className="text-sm font-medium text-white/70">
          Email administrateur
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
          <Input
            id="admin-email"
            type="email"
            placeholder="admin@exemple.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="h-10 border-white/10 bg-white/6 pl-9 text-white placeholder:text-white/20 focus-visible:border-red-500/40 focus-visible:ring-red-500/20"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="admin-password" className="text-sm font-medium text-white/70">
          Mot de passe
        </Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
          <Input
            id="admin-password"
            type={showPwd ? "text" : "password"}
            placeholder="••••••••"
            className="h-10 border-white/10 bg-white/6 pl-9 pr-10 text-white placeholder:text-white/20 focus-visible:border-red-500/40 focus-visible:ring-red-500/20"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
            aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full h-10 bg-red-600/80 font-medium text-white hover:bg-red-600 border border-red-500/30 shadow-lg shadow-red-900/20"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Vérification…
          </>
        ) : "Accéder à l'administration"}
      </Button>

    </form>
  )
}
