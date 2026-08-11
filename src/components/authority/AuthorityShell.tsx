"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Landmark, Bell, X, CheckCheck, AlertTriangle, KeyRound } from "lucide-react"
import { signOut } from "next-auth/react"
import { AppLogo } from "@/components/ui/AppLogo"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface NotificationItem { id: string; type: string; title: string; body: string; createdAt: string; link?: string | null }
interface Props { roleLabel: string; userName: string; initialNotifications?: NotificationItem[]; children: React.ReactNode }

export default function AuthorityShell({ roleLabel, userName, initialNotifications = [], children }: Props) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications)
  const [notifOpen, setNotifOpen] = useState(false)
  const [pwOpen, setPwOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [pwError, setPwError] = useState("")
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)

  async function changePassword() {
    setPwError(""); setPwSuccess(false)
    if (newPassword.length < 6) { setPwError("Le nouveau mot de passe doit faire au moins 6 caractères"); return }
    setPwLoading(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur")
      setPwSuccess(true)
      setCurrentPassword(""); setNewPassword("")
    } catch (e: any) { setPwError(e.message) }
    finally { setPwLoading(false) }
  }

  async function dismissOne(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "DELETE" })
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  async function dismissAll() {
    await fetch("/api/notifications", { method: "PATCH" })
    setNotifications([])
    setNotifOpen(false)
  }

  function openNotification(n: NotificationItem) {
    dismissOne(n.id)
    setNotifOpen(false)
    if (n.link) router.push(n.link)
  }

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

        <div className="relative">
          <button
            onClick={() => setNotifOpen(v => !v)}
            className="relative h-9 w-9 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-destructive text-[9px] font-bold text-white flex items-center justify-center">
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute top-11 right-0 w-80 max-w-[calc(100vw-2rem)] rounded-xl border bg-popover shadow-xl z-50 overflow-hidden">
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
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Bell className="h-8 w-8 mb-2 opacity-30" />
                    <p className="text-xs">Aucune notification</p>
                  </div>
                ) : notifications.map(n => (
                  <div
                    key={n.id}
                    role={n.link ? "button" : undefined}
                    onClick={n.link ? () => openNotification(n) : undefined}
                    className={cn(
                      "flex items-start gap-2.5 px-3 py-2.5 border-b last:border-0 group",
                      n.link ? "cursor-pointer hover:bg-muted/60" : "hover:bg-muted/40"
                    )}
                  >
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold">{n.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{n.body}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); dismissOne(n.id) }} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground hover:text-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <span className="text-sm text-muted-foreground hidden sm:inline">{userName}</span>
        <Button variant="ghost" size="icon" title="Changer le mot de passe" onClick={() => { setPwOpen(true); setPwError(""); setPwSuccess(false) }}>
          <KeyRound className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
          <LogOut className="h-4 w-4" /> Déconnexion
        </Button>
      </header>
      <main className="p-4 md:p-8 max-w-6xl mx-auto">{children}</main>

      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Changer le mot de passe</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Mot de passe actuel</Label>
              <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Nouveau mot de passe</Label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            {pwError && <p className="text-sm text-destructive">{pwError}</p>}
            {pwSuccess && <p className="text-sm text-emerald-500">Mot de passe mis à jour</p>}
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setPwOpen(false)}>Fermer</Button>
              <Button className="flex-1" onClick={changePassword} disabled={pwLoading || !currentPassword || !newPassword}>
                {pwLoading ? "..." : "Valider"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
