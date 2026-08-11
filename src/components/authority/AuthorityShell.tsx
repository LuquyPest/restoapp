"use client"
import { LogOut, Landmark } from "lucide-react"
import { signOut } from "next-auth/react"
import { AppLogo } from "@/components/ui/AppLogo"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Props { roleLabel: string; userName: string; children: React.ReactNode }

export default function AuthorityShell({ roleLabel, userName, children }: Props) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-md px-4 md:px-8 h-14 flex items-center gap-3 shadow-sm">
        <AppLogo size={28} />
        <div className="flex items-center gap-2">
          <Landmark className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">{roleLabel}</span>
          <Badge variant="secondary" className="text-[10px]">Autorité</Badge>
        </div>
        <div className="flex-1" />
        <span className="text-sm text-muted-foreground hidden sm:inline">{userName}</span>
        <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
          <LogOut className="h-4 w-4" /> Déconnexion
        </Button>
      </header>
      <main className="p-4 md:p-8 max-w-6xl mx-auto">{children}</main>
    </div>
  )
}
