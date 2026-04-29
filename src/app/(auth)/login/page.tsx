import LoginForm from "@/components/auth/LoginForm"

export default function LoginPage() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", padding: 16,
      backgroundImage: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(108,99,255,0.12), transparent)",
    }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 0 40px var(--accent-glow)",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11l19-9-9 19-2-8-8-2z"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.02em" }}>
            RestoManager
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
            Connexion à votre espace
          </p>
        </div>

        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-mid)",
          borderRadius: 16, padding: 28,
        }}>
          <LoginForm />
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-subtle)", marginTop: 20 }}>
          Contactez votre patron pour obtenir vos accès
        </p>
      </div>
    </div>
  )
}
