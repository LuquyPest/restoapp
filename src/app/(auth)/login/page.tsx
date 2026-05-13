import LoginForm from "@/components/auth/LoginForm"
import { LoginLogo } from "@/components/ui/LoginLogo"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" style={{ backgroundImage: "radial-gradient(ellipse 80% 60% at 50% -10%, hsl(262 83% 58% / 0.12), transparent)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <LoginLogo size={120} className="mx-auto mb-2 drop-shadow-xl" />
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
