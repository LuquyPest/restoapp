"use client"
import { useState } from "react"
import Sidebar from "./Sidebar"
import SearchBar from "./SearchBar"
import Link from "next/link"
import { Menu, NotebookPen } from "lucide-react"
import type { CompanyType } from "@/lib/business-types"

interface NotificationItem { id: string; type: string; title: string; body: string; createdAt: string }

interface Props {
  userRole: string
  companyName: string
  companyType: CompanyType
  userName: string
  companyLogo?: string | null
  gradePermissions?: string[] | null
  accessRoleName?: string | null
  initialNotifications?: NotificationItem[]
  hasEmployeeRecord?: boolean
  children: React.ReactNode
}

export default function DashboardShell({
  children,
  userRole,
  companyName,
  companyType,
  userName,
  companyLogo,
  gradePermissions = null,
  accessRoleName = null,
  initialNotifications = [],
  hasEmployeeRecord = false,
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
        companyName={companyName}
        companyType={companyType}
        userName={userName}
        companyLogo={companyLogo}
        gradePermissions={gradePermissions}
        accessRoleName={accessRoleName}
        initialNotifications={initialNotifications}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        hasEmployeeRecord={hasEmployeeRecord}
      />
      <div className="md:ml-64 min-h-screen flex flex-col">
        <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 px-4 md:px-8 h-14 flex items-center gap-3 shadow-sm">
          <button
            className="md:hidden shrink-0 h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0"><SearchBar companyType={companyType} /></div>
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
