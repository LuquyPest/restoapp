"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
  LayoutDashboard, Users, UtensilsCrossed, ShoppingBag, Truck,
  FileText, Settings, LogOut, ChevronRight,
  TrendingUp, Receipt, Handshake, BarChart3, Sun, Moon, CreditCard, KeyRound, Package,
  Bell, X, CheckCheck, AlertTriangle,
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
import { BUSINESS_VOCAB, type CompanyType } from "@/lib/business-types"

function getNavGroups(companyType: CompanyType) {
  const vocab = BUSINESS_VOCAB[companyType]
  return [
    {
      label: "Principal",
      items: [
        { key: "dashboard", label: "Dashboard",       href: "/dashboard", icon: LayoutDashboard, roles: ["OWNER","MANAGER","EMPLOYEE"] },
        { key: "orders",    label: "Commandes",       href: "/orders",    icon: ShoppingBag,     roles: ["OWNER","MANAGER","EMPLOYEE"] },
        { key: "loyalty",   label: "Cartes fidélité", href: "/loyalty",   icon: CreditCard,      roles: ["OWNER","MANAGER"] },
      ],
    },
    {
      label: "RH",
      items: [
        { key: "employees", label: "Employés", href: "/employees", icon: Users, roles: ["OWNER","MANAGER"] },
      ],
    },
    {
      label: "Analyse",
      items: [
        { key: "report",         label: "Bilan",            href: "/report",         icon: BarChart3,  roles: ["OWNER","MANAGER"] },
        { key: "sales",          label: "Liste des ventes", href: "/sales",          icon: TrendingUp, roles: ["OWNER","MANAGER"] },
        { key: "sales/products", label: "Ventes produits",  href: "/sales/products", icon: BarChart3,  roles: ["OWNER","MANAGER"] },
      ],
    },
    {
      label: "Gestion",
      items: [
        { key: "menu",      label: vocab.menuNavLabel,  href: "/menu",      icon: UtensilsCrossed, roles: ["OWNER","MANAGER"] },
        { key: "stock",     label: vocab.stockNavLabel, href: "/stock",     icon: Package,         roles: ["OWNER"] },
        { key: "partners",  label: "Partenaires",       href: "/partners",  icon: Handshake,       roles: ["OWNER","MANAGER"] },
        { key: "suppliers", label: "Fournisseurs",      href: "/suppliers", icon: Truck,           roles: ["OWNER","MANAGER"] },
        { key: "invoices",  label: "Factures",          href: "/invoices",  icon: FileText,        roles: ["OWNER","MANAGER"] },
        { key: "charges",   label: "Charges",           href: "/charges",   icon: Receipt,         roles: ["OWNER","MANAGER"] },
      ],
    },
    {
      label: "Système",
      items: [
        { key: "settings", label: "Paramètres", href: "/settings", icon: Settings, roles: ["OWNER"] },
      ],
    },
  ]
}

interface NotificationItem { id: string; type: string; title: string; body: string; createdAt: Date | string }
interface Props { userRole: string; companyName: string; companyType: CompanyType; userName: string; companyLogo?: string | null; gradePermissions?: string[] | null; accessRoleName?: string | null; initialNotifications?: NotificationItem[]; mobileOpen?: boolean; onMobileClose?: () => void }

export default function Sidebar({ userRole, companyName, companyType, userName, companyLogo, gradePermissions = null, accessRoleName = null, initialNotifications = [], mobileOpen = false, onMobileClose }: Props) {
  const navGroups = getNavGroups(companyType)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileModal, setProfileModal] = useState(false)
  const [profileForm, setProfileForm] = useState({ phone: "", accountNumber: "", currentPassword: "", newPassword: "" })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState("")
  const [profileSuccess, setProfileSuccess] = useState(false)

  async function dismissOne(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "DELETE" })
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  async function dismissAll() {
    await fetch("/api/notifications", { method: "PATCH" })
    setNotifications([])
    setNotifOpen(false)
  }

  const initials = userName?.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() ?? "U"
  const roleLabel = accessRoleName ?? (userRole === "OWNER" ? "Patron" : userRole === "MANAGER" ? "Manager" : "Employé")

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
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-sidebar transition-transform duration-300 ease-in-out",
        "md:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col border-b px-4 py-3 gap-2">
          {companyLogo
            ? <img src={companyLogo} alt={companyName} width={44} height={44} className="rounded-lg object-contain" />
            : <AppLogo size={44} />
          }
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">{companyName}</p>
            <Badge variant="secondary" className="mt-0.5 h-4 text-[10px] px-1.5">{roleLabel}</Badge>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {navGroups.map(group => {
            const items = group.items.filter(i => {
              if (userRole === "OWNER") return true
              // Rôle d'accès custom → il prime sur les restrictions système
              if (gradePermissions !== null) return gradePermissions.includes(i.key)
              // Pas de rôle custom → droits par défaut du rôle système
              return i.roles.includes(userRole)
            })
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
                      <Link key={item.href} href={item.href} onClick={onMobileClose} className={cn(
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
          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(v => !v)}
              className="w-full flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-sidebar-accent transition-colors text-left"
            >
              <div className="relative shrink-0">
                <Bell className="h-4 w-4 text-muted-foreground" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-[9px] font-bold text-white flex items-center justify-center">
                    {notifications.length > 9 ? "9+" : notifications.length}
                  </span>
                )}
              </div>
              <span className="flex-1 text-sm text-sidebar-foreground/70">Notifications</span>
            </button>

            {notifOpen && (
              <div className="absolute bottom-10 left-0 w-72 max-w-[calc(100vw-2rem)] rounded-xl border bg-popover shadow-xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2.5 border-b">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Notifications {notifications.length > 0 && <span className="text-foreground">({notifications.length})</span>}
                  </p>
                  {notifications.length > 0 && (
                    <button onClick={dismissAll} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <CheckCheck className="h-3 w-3" /> Tout effacer
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <Bell className="h-8 w-8 mb-2 opacity-30" />
                      <p className="text-xs">Aucune notification</p>
                    </div>
                  ) : notifications.map(n => (
                    <div key={n.id} className="flex items-start gap-2.5 px-3 py-2.5 hover:bg-muted/40 border-b last:border-0 group">
                      <AlertTriangle className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", n.type === "OVERDUE_INVOICE" ? "text-destructive" : "text-amber-500")} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold">{n.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{n.body}</p>
                      </div>
                      <button onClick={() => dismissOne(n.id)} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground hover:text-foreground">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

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
