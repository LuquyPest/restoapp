"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Users, UtensilsCrossed,
  ShoppingBag, Truck, FileText, Banknote,
  Settings, LogOut, ChevronRight, TrendingUp,
  Receipt, Handshake, BarChart3,
} from "lucide-react"
import { signOut } from "next-auth/react"

const navItems = [
  { label: "Dashboard",        href: "/dashboard",  icon: LayoutDashboard, roles: ["OWNER","MANAGER","EMPLOYEE"] },
  { label: "Commandes",        href: "/orders",      icon: ShoppingBag,     roles: ["OWNER","MANAGER","EMPLOYEE"] },
  { label: "Employés",         href: "/employees",   icon: Users,           roles: ["OWNER","MANAGER"] },
  { label: "Carte",            href: "/menu",        icon: UtensilsCrossed, roles: ["OWNER","MANAGER"] },
  { label: "Partenaires",      href: "/partners",    icon: Handshake,       roles: ["OWNER","MANAGER"] },
  { label: "Charges",          href: "/charges",     icon: Receipt,         roles: ["OWNER","MANAGER"] },
  { label: "Fournisseurs",     href: "/suppliers",   icon: Truck,           roles: ["OWNER","MANAGER"] },
  { label: "Factures",         href: "/invoices",    icon: FileText,        roles: ["OWNER","MANAGER"] },
  { label: "Payes",            href: "/payroll",     icon: Banknote,        roles: ["OWNER","MANAGER","EMPLOYEE"] },
  { label: "Liste des ventes", href: "/sales",       icon: TrendingUp,      roles: ["OWNER","MANAGER"] },
  { label: "Ventes produits",  href: "/sales/products", icon: BarChart3,   roles: ["OWNER","MANAGER"] },
  { label: "Bilan",            href: "/report",      icon: BarChart3,       roles: ["OWNER"] },
  { label: "Paramètres",       href: "/settings",    icon: Settings,        roles: ["OWNER"] },
]

interface Props { userRole: string; restaurantName: string; userName: string }

export default function Sidebar({ userRole, restaurantName, userName }: Props) {
  const pathname = usePathname()
  const filtered = navItems.filter(i => i.roles.includes(userRole))
  const initials = userName?.split(" ").map((w: string) => w[0]).join("").slice(0,2).toUpperCase() ?? "U"

  return (
    <aside style={{
      position: "fixed", inset: "0 auto 0 0",
      width: "var(--sidebar-w)",
      background: "var(--bg-card)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      zIndex: 40,
    }}>
      <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <UtensilsCrossed size={16} color="#fff" />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {restaurantName}
            </p>
            <p style={{ fontSize: 11, color: "var(--text-subtle)", marginTop: 1 }}>
              {userRole === "OWNER" ? "Patron" : userRole === "MANAGER" ? "Manager" : "Employé"}
            </p>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 1 }}>
        {filtered.map(item => {
          const Icon = item.icon
          const active = pathname === item.href || (item.href !== "/sales" && pathname.startsWith(item.href + "/")) || (item.href === "/sales" && pathname === "/sales")
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: 9,
              padding: "7px 10px", borderRadius: 7,
              fontSize: 13, fontWeight: active ? 500 : 400,
              color: active ? "var(--text)" : "var(--text-muted)",
              background: active ? "var(--bg-elevated)" : "transparent",
              border: active ? "1px solid var(--border-mid)" : "1px solid transparent",
              textDecoration: "none", transition: "all 0.15s", position: "relative",
            }}
            onMouseEnter={e => { if (!active) { const el = e.currentTarget as HTMLElement; el.style.background = "var(--bg-hover)"; el.style.color = "var(--text)"; }}}
            onMouseLeave={e => { if (!active) { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "var(--text-muted)"; }}}
            >
              {active && <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 14, background: "var(--accent)", borderRadius: "0 2px 2px 0" }} />}
              <Icon size={14} style={{ flexShrink: 0, color: active ? "var(--accent)" : "currentColor" }} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {active && <ChevronRight size={11} style={{ opacity: 0.4 }} />}
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: "10px 8px", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", marginBottom: 2 }}>
          <div style={{
            width: 26, height: 26, borderRadius: "50%",
            background: "var(--accent-dim)", border: "1px solid rgba(108,99,255,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 700, color: "var(--accent)", flexShrink: 0,
          }}>{initials}</div>
          <span style={{ fontSize: 12, color: "var(--text)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName}</span>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/login" })} style={{
          width: "100%", display: "flex", alignItems: "center", gap: 9,
          padding: "7px 10px", borderRadius: 7, border: "none", cursor: "pointer",
          background: "transparent", color: "var(--text-subtle)",
          fontSize: 13, fontFamily: "inherit", transition: "all 0.15s",
        }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--red-dim)"; el.style.color = "var(--red)"; }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "var(--text-subtle)"; }}
        >
          <LogOut size={13} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  )
}
