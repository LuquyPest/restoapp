"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"

type ToastType = "success" | "error" | "info"
interface Toast { id: string; message: string; type: ToastType }
const ToastContext = createContext<{ toast: (msg: string, type?: ToastType) => void }>({ toast: () => {} })

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const remove = (id: string) => setToasts(p => p.filter(t => t.id !== id))
  const add = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2)
    setToasts(p => [...p, { id, message, type }])
    setTimeout(() => remove(id), 4000)
  }, [])

  const colors = {
    success: { bg: "var(--green-dim)", border: "rgba(34,197,94,0.2)", color: "var(--green)" },
    error:   { bg: "var(--red-dim)",   border: "rgba(239,68,68,0.2)",  color: "var(--red)" },
    info:    { bg: "var(--bg-elevated)", border: "var(--border-mid)", color: "var(--text)" },
  }

  return (
    <ToastContext.Provider value={{ toast: add }}>
      <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 200, display: "flex", flexDirection: "column", gap: 8 }}>
        {toasts.map(t => {
          const c = colors[t.type]
          return (
            <div key={t.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px", borderRadius: 10,
              background: c.bg, border: `1px solid ${c.border}`,
              color: c.color, fontSize: 13, fontWeight: 500,
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
              animation: "fadeUp 0.2s ease forwards",
              minWidth: 260,
            }}>
              {t.type === "success" && <CheckCircle size={14} />}
              {t.type === "error"   && <AlertCircle size={14} />}
              {t.type === "info"    && <Info size={14} />}
              <span style={{ flex: 1 }}>{t.message}</span>
              <button onClick={() => remove(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", opacity: 0.6, display: "flex" }}>
                <X size={12} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
