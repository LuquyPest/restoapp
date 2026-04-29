import LoginForm from "@/components/auth/LoginForm"
import { UtensilsCrossed } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)]">RestoManager</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Connexion à votre espace</p>
        </div>

        <div className="card p-6">
          <LoginForm />
        </div>

        <p className="text-center text-xs text-[var(--text-subtle)] mt-6">
          Contactez votre patron pour obtenir vos accès
        </p>
      </div>
    </div>
  )
}
