"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  ShoppingCart,
  Truck,
  FileText,
  Banknote,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  roles: string[]
}

const navItems: NavItem[] = [
  { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard, roles: ["OWNER", "MANAGER", "EMPLOYEE"] },
  { label: "Employés", href: "/employees", icon: Users, roles: ["OWNER", "MANAGER"] },
  { label: "Carte", href: "/menu", icon: UtensilsCrossed, roles: ["OWNER", "MANAGER", "EMPLOYEE"] },
  { label: "Commandes", href: "/orders", icon: ShoppingCart, roles: ["OWNER", "MANAGER", "EMPLOYEE"] },
  { label: "Fournisseurs", href: "/suppliers", icon: Truck, roles: ["OWNER", "MANAGER"] },
  { label: "Factures", href: "/invoices", icon: FileText, roles: ["OWNER", "MANAGER"] },
  { label: "Payes", href: "/payroll", icon: Banknote, roles: ["OWNER", "MANAGER", "EMPLOYEE"] },
  { label: "Paramètres", href: "/settings", icon: Settings, roles: ["OWNER"] },
]

interface SidebarProps {
  userRole: string
  restaurantName: string
  userName: string
}

export default function Sidebar({ userRole, restaurantName, userName }: SidebarProps) {
  const pathname = usePathname()

  const filtered = navItems.filter((item) => item.roles.includes(userRole))

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-[var(--bg-sidebar)] border-r border-[var(--border)] flex flex-col z-30">
      <div className="px-5 py-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
            <UtensilsCrossed className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text)] truncate">{restaurantName}</p>
            <p className="text-xs text-[var(--text-subtle)]">{userRole === "OWNER" ? "Patron" : userRole === "MANAGER" ? "Manager" : "Employé"}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {filtered.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group",
                isActive
                  ? "bg-brand-500 text-white font-medium"
                  : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-brand-500/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-brand-500">
              {userName?.charAt(0)?.toUpperCase() ?? "U"}
            </span>
          </div>
          <span className="text-sm text-[var(--text)] truncate flex-1">{userName}</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-light)] transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  )
}
