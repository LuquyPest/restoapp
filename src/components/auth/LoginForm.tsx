"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(""); setLoading(true)
    const res = await signIn("credentials", { email, password, redirect: false })
    setLoading(false)
    if (res?.error) setError("Email ou mot de passe incorrect")
    else { router.push("/dashboard"); router.refresh() }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label className="label">Adresse email</label>
        <input type="email" className="input" placeholder="vous@exemple.com"
          value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
      </div>
      <div>
        <label className="label">Mot de passe</label>
        <div style={{ position: "relative" }}>
          <input type={showPwd ? "text" : "password"} className="input"
            placeholder="••••••••" style={{ paddingRight: 40 }}
            value={password} onChange={e => setPassword(e.target.value)}
            required autoComplete="current-password" />
          <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
            position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer", color: "var(--text-subtle)",
            display: "flex", alignItems: "center",
          }}>
            {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>
      {error && (
        <div style={{ padding: "10px 12px", borderRadius: 8, background: "var(--red-dim)",
          border: "1px solid rgba(239,68,68,0.2)", fontSize: 13, color: "var(--red)" }}>
          {error}
        </div>
      )}
      <button type="submit" className="btn-primary" disabled={loading}
        style={{ width: "100%", height: 40, marginTop: 4, fontSize: 14 }}>
        {loading ? <Loader2 size={16} className="animate-spin" /> : "Se connecter"}
      </button>
    </form>
  )
}
