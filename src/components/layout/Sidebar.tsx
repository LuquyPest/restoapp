"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
  LayoutDashboard, Users, UtensilsCrossed, ShoppingBag, Truck,
  FileText, Settings, LogOut, ChevronRight,
  TrendingUp, Receipt, Handshake, BarChart3, Sun, Moon, CreditCard,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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

interface Props { userRole: string; restaurantName: string; userName: string }

export default function Sidebar({ userRole, restaurantName, userName }: Props) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const initials = userName?.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() ?? "U"
  const roleLabel = userRole === "OWNER" ? "Patron" : userRole === "MANAGER" ? "Manager" : "Employé"

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r bg-sidebar">
      <div className="flex h-14 items-center gap-3 border-b px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0">
          <UtensilsCrossed className="h-4 w-4 text-primary-foreground" />
        </div>
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
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
          </Avatar>
          <span className="flex-1 truncate text-sm font-medium text-sidebar-foreground">{userName}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-3.5 w-3.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-3.5 w-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
        <Button variant="ghost" className="w-full justify-start gap-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9" onClick={() => signOut({ callbackUrl: "/login" })}>
          <LogOut className="h-4 w-4" />Déconnexion
        </Button>
      </div>
    </aside>
  )
}
