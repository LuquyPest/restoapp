"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
  LayoutDashboard, Users, UtensilsCrossed, ShoppingBag, Truck,
  FileText, Settings, LogOut, ChevronRight,
  TrendingUp, Receipt, Handshake, BarChart3, Sun, Moon, CreditCard, KeyRound,
} from "lucide-react"
import { AppLogo } from "@/components/ui/AppLogo"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const navGroups = [
  {
    label: "Principal",
    items: [
      { label: "Dashboard",    href: "/dashboard", icon: LayoutDashboard, roles: ["OWNER","MANAGER","EMPLOYEE"] },
      { label: "Commandes",    href: "/orders",    icon: ShoppingBag,     roles: ["OWNER","MANAGER","EMPLOYEE"] },
    ],
  },
  {
    label: "Analyse",
    items: [
      { label: "Liste des ventes",  href: "/sales",          icon: TrendingUp,  roles: ["OWNER","MANAGER"] },
      { label: "Ventes produits",   href: "/sales/products", icon: BarChart3,   roles: ["OWNER","MANAGER"] },
      { label: "Bilan",             href: "/report",         icon: BarChart3,   roles: ["OWNER"] },
    ],
  },
  {
    label: "Gestion",
    items: [
      { label: "Employés",         href: "/employees", icon: Users,          roles: ["OWNER","MANAGER"] },
      { label: "Carte",            href: "/menu",      icon: UtensilsCrossed,roles: ["OWNER","MANAGER"] },
      { label: "Partenaires",      href: "/partners",  icon: Handshake,      roles: ["OWNER","MANAGER"] },
      { label: "Cartes fidélité",  href: "/loyalty",   icon: CreditCard,     roles: ["OWNER","MANAGER"] },
      { label: "Fournisseurs",     href: "/suppliers", icon: Truck,          roles: ["OWNER","MANAGER"] },
      { label: "Factures",         href: "/invoices",  icon: FileText,       roles: ["OWNER","MANAGER"] },
      { label: "Charges",          href: "/charges",   icon: Receipt,        roles: ["OWNER","MANAGER"] },
    ],
  },
  {
    label: "Système",
    items: [
      { label: "Paramètres", href: "/settings", icon: Settings, roles: ["OWNER"] },
    ],
  },
]

interface Props { userRole: string; restaurantName: string; userName: string; restaurantLogo?: string | null }

export default function Sidebar({ userRole, restaurantName, userName, restaurantLogo }: Props) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [profileModal, setProfileModal] = useState(false)
  const [profileForm, setProfileForm] = useState({ phone: "", accountNumber: "", currentPassword: "", newPassword: "" })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState("")
  const [profileSuccess, setProfileSuccess] = useState(false)

  const initials = userName?.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() ?? "U"
  const roleLabel = userRole === "OWNER" ? "Patron" : userRole === "MANAGER" ? "Manager" : "Employé"

  async function saveProfile() {
    setProfileLoading(true); setProfileError(""); setProfileSuccess(false)
    try {
      const payload: any = {}
      if (profileForm.phone) payload.phone = profileForm.phone
      if (profileForm.accountNumber) payload.accountNumber = profileForm.accountNumber
      if (profileForm.newPassword) {
        payload.currentPassword = profileForm.currentPassword
        payload.newPassword = profileForm.newPassword
      }
      const res = await fetch("/api/profile", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur")
      setProfileSuccess(true)
      setProfileForm({ phone: "", accountNumber: "", currentPassword: "", newPassword: "" })
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (e: any) { setProfileError(e.message) }
    finally { setProfileLoading(false) }
  }

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r bg-sidebar">
        <div className="flex flex-col border-b px-4 py-3 gap-2">
          {restaurantLogo
            ? <img src={restaurantLogo} alt={restaurantName} width={44} height={44} className="rounded-lg object-contain" />
            : <AppLogo size={44} />
          }
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">{restaurantName}</p>
            <Badge variant="secondary" className="mt-0.5 h-4 text-[10px] px-1.5">{roleLabel}</Badge>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {navGroups.map(group => {
            const items = group.items.filter(i => i.roles.includes(userRole))
            if (items.length === 0) return null
            return (
              <div key={group.label}>
                <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {items.map(item => {
                    const Icon = item.icon
                    const active = pathname === item.href || (item.href !== "/sales" && pathname.startsWith(item.href + "/"))
                    return (
                      <Link key={item.href} href={item.href} className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                        active ? "bg-primary/10 text-primary font-medium" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}>
                        <Icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
                        <span className="flex-1">{item.label}</span>
                        {active && <ChevronRight className="h-3 w-3 opacity-50" />}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        <div className="border-t p-3 space-y-1">
          {/* Profile button - clickable */}
          <button
            onClick={() => { setProfileModal(true); setProfileError(""); setProfileSuccess(false) }}
            className="w-full flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-sidebar-accent transition-colors text-left"
          >
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
            </Avatar>
            <span className="flex-1 truncate text-sm font-medium text-sidebar-foreground">{userName}</span>
            <KeyRound className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </button>

          <Button variant="ghost" size="icon" className="w-full justify-start gap-2.5 px-2 h-8 text-muted-foreground hover:text-foreground"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-3.5 w-3.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-3.5 w-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="text-xs">Thème</span>
          </Button>

          <Button variant="ghost" className="w-full justify-start gap-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9"
            onClick={() => signOut({ callbackUrl: "/login" })}>
            <LogOut className="h-4 w-4" />Déconnexion
          </Button>
        </div>
      </aside>

      {/* Profile modal */}
      <Dialog open={profileModal} onOpenChange={v => !v && setProfileModal(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Mon profil — {userName}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Informations</p>
              <div className="space-y-1.5">
                <Label>Téléphone</Label>
                <Input placeholder="Numéro de téléphone" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Numéro de compte bancaire</Label>
                <Input placeholder="ex: 1234-5678" value={profileForm.accountNumber} onChange={e => setProfileForm({ ...profileForm, accountNumber: e.target.value })} />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Changer le mot de passe</p>
              <div className="space-y-1.5">
                <Label>Mot de passe actuel</Label>
                <Input type="password" placeholder="••••••••" value={profileForm.currentPassword} onChange={e => setProfileForm({ ...profileForm, currentPassword: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Nouveau mot de passe</Label>
                <Input type="password" placeholder="Min. 6 caractères" value={profileForm.newPassword} onChange={e => setProfileForm({ ...profileForm, newPassword: e.target.value })} />
              </div>
            </div>

            {profileError && <p className="text-sm text-destructive">{profileError}</p>}
            {profileSuccess && <p className="text-sm text-emerald-500">✓ Modifications enregistrées</p>}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setProfileModal(false)}>Fermer</Button>
              <Button className="flex-1" onClick={saveProfile} disabled={profileLoading}>
                {profileLoading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
