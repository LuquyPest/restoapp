"use client"

import { Sun, Moon, Bell } from "lucide-react"
import { useTheme } from "@/components/layout/ThemeProvider"

interface HeaderProps {
  title: string
}

export default function Header({ title }: HeaderProps) {
  const { theme, toggle } = useTheme()

  return (
    <header className="h-14 bg-[var(--bg-card)] border-b border-[var(--border)] flex items-center justify-between px-6 sticky top-0 z-20">
      <h1 className="text-base font-semibold text-[var(--text)]">{title}</h1>
      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-all"
          aria-label="Changer le thème"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-all"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
