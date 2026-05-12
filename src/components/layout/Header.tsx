"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export default function Header({ title }: { title?: string }) {
  const { theme, setTheme } = useTheme()
  return (
    <header className="h-14 flex items-center justify-end px-6 border-b bg-card sticky top-0 z-20">
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="h-8 w-8 rounded-lg border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border/80 transition-all"
      >
        <Sun className="h-3.5 w-3.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-3.5 w-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </button>
    </header>
  )
}
