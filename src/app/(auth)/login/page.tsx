import LoginForm from "@/components/auth/LoginForm"
import { LoginLogo } from "@/components/ui/LoginLogo"
import { BarChart3, Package, ShoppingBag, Users } from "lucide-react"

const features = [
  { icon: ShoppingBag, label: "Commandes & menu" },
  { icon: Package,     label: "Gestion du stock" },
  { icon: BarChart3,   label: "Bilan hebdomadaire" },
  { icon: Users,       label: "Paie des employés" },
]

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — branding ─────────────────────────────────── */}
      <div className="hidden lg:flex w-[52%] relative overflow-hidden flex-col items-start justify-between p-14"
        style={{ background: "linear-gradient(135deg, hsl(262 83% 9%) 0%, hsl(262 60% 15%) 40%, hsl(245 60% 18%) 100%)" }}>

        {/* Ambient orbs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-1/3 right-0 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-60 w-60 rounded-full bg-violet-800/20 blur-2xl" />

        {/* Subtle grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: "linear-gradient(to right,white 1px,transparent 1px),linear-gradient(to bottom,white 1px,transparent 1px)", backgroundSize: "48px 48px" }} />

        {/* Top edge highlight */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400/25 to-transparent" />

        {/* Logo */}
        <div className="relative z-10">
          <LoginLogo size={52} className="drop-shadow-2xl" />
        </div>

        {/* Main content */}
        <div className="relative z-10 max-w-[420px]">
          <h1 className="text-[2.6rem] font-bold leading-[1.15] tracking-tight text-white mb-5">
            RestoCompta
          </h1>
          <p className="text-violet-200/75 text-[1.05rem] leading-relaxed mb-10">
            La plateforme tout-en-un pour piloter votre restaurant — de la prise de commande au bilan comptable.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, label }) => (
              <div key={label}
                className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/25">
                  <Icon className="h-4 w-4 text-violet-300" />
                </div>
                <span className="text-sm font-medium text-violet-100/90">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-xs text-violet-400/40">
          © 2026 RestoCompta — Tous droits réservés
        </p>
      </div>

      {/* ── Right panel — form ────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-[360px] animate-fade-in">

          {/* Mobile logo */}
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <LoginLogo size={72} className="mb-3 drop-shadow-lg" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Connexion</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Entrez vos identifiants pour accéder à votre espace
            </p>
          </div>

          <LoginForm />

          <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
            Vous n&apos;avez pas de compte ?<br />
            <span className="font-medium text-foreground/60">Contactez votre patron pour obtenir vos accès.</span>
          </p>
        </div>
      </div>

    </div>
  )
}
