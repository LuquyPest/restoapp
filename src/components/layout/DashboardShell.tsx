"use client"
import { useState } from "react"
import Sidebar from "./Sidebar"
import SearchBar from "./SearchBar"
import Link from "next/link"
import { Menu, NotebookPen } from "lucide-react"

interface NotificationItem { id: string; type: string; title: string; body: string; createdAt: string }

interface Props {
  userRole: string
  restaurantName: string
  userName: string
  restaurantLogo?: string | null
  gradePermissions?: string[] | null
  accessRoleName?: string | null
  initialNotifications?: NotificationItem[]
  children: React.ReactNode
}

export default function DashboardShell({
  children,
  userRole,
  restaurantName,
  userName,
  restaurantLogo,
  gradePermissions = null,
  accessRoleName = null,
  initialNotifications = [],
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <Sidebar
        userRole={userRole}
        restaurantName={restaurantName}
        userName={userName}
        restaurantLogo={restaurantLogo}
        gradePermissions={gradePermissions}
        accessRoleName={accessRoleName}
        initialNotifications={initialNotifications}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="md:ml-64 min-h-screen flex flex-col">
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-8 h-14 flex items-center gap-3">
          <button
            className="md:hidden shrink-0 h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0"><SearchBar /></div>
          <Link
            href="/patchnotes"
            className="shrink-0 h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Notes de mise à jour"
          >
            <NotebookPen className="h-4 w-4" />
          </Link>
        </header>
        <main className="p-4 md:p-8 max-w-7xl flex-1">{children}</main>
      </div>
    </div>
  )
}
