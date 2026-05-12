import AdminLoginForm from "@/components/admin/AdminLoginForm"

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4"
      style={{ backgroundImage: "radial-gradient(ellipse 80% 60% at 50% -10%, hsl(262 83% 58% / 0.08), transparent)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/20">
            <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Administration</h1>
          <p className="text-sm text-muted-foreground mt-1.5">Accès restreint</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-xl">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  )
}
