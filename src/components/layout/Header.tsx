"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/layout/ThemeProvider"

export default function Header({ title }: { title?: string }) {
  const { theme, toggle } = useTheme()
  return (
    <header style={{
      height: 52, display: "flex", alignItems: "center", justifyContent: "flex-end",
      padding: "0 24px", borderBottom: "1px solid var(--border)",
      background: "var(--bg-card)", position: "sticky", top: 0, zIndex: 20,
    }}>
      <button onClick={toggle} style={{
        width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border)",
        background: "transparent", cursor: "pointer", color: "var(--text-muted)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-mid)"; (e.currentTarget as HTMLElement).style.color = "var(--text)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
      >
        {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
      </button>
    </header>
  )
}
