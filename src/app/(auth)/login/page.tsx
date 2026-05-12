import LoginForm from "@/components/auth/LoginForm"
import { UtensilsCrossed } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" style={{ backgroundImage: "radial-gradient(ellipse 80% 60% at 50% -10%, hsl(262 83% 58% / 0.12), transparent)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-[0_0_40px_hsl(262_83%_58%/0.3)]">
            <UtensilsCrossed className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">RestoManager</h1>
          <p className="text-sm text-muted-foreground mt-1.5">Connexion à votre espace</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-xl">
          <LoginForm />
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">
          Contactez votre patron pour obtenir vos accès
        </p>
      </div>
    </div>
  )
}
