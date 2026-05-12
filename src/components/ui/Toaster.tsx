"use client"
import { createContext, useContext, useState, useCallback } from "react"
import { CheckCircle, AlertCircle, Info, X } from "lucide-react"

type ToastType = "success" | "error" | "info"
interface ToastItem { id: string; message: string; type: ToastType }
const ToastContext = createContext<{ toast: (msg: string, type?: ToastType) => void }>({ toast: () => {} })

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const remove = (id: string) => setToasts(p => p.filter(t => t.id !== id))
  const add = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2)
    setToasts(p => [...p, { id, message, type }])
    setTimeout(() => remove(id), 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast: add }}>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg animate-scale-in min-w-[260px] ${
            t.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
            t.type === "error" ? "bg-destructive/10 border-destructive/20 text-destructive" :
            "bg-card border-border text-foreground"
          }`}>
            {t.type === "success" && <CheckCircle className="h-4 w-4 shrink-0" />}
            {t.type === "error" && <AlertCircle className="h-4 w-4 shrink-0" />}
            {t.type === "info" && <Info className="h-4 w-4 shrink-0" />}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => remove(t.id)} className="opacity-60 hover:opacity-100 transition-opacity"><X className="h-3.5 w-3.5" /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
