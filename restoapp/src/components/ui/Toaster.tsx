"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastType = "success" | "error" | "info"

interface Toast {
  id: string
  message: string
  type: ToastType
}

const ToastContext = createContext<{
  toast: (message: string, type?: ToastType) => void
}>({ toast: () => {} })

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id))

  const add = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => remove(id), 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast: add }}>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium pointer-events-auto animate-in",
              t.type === "success" && "bg-[var(--bg-card)] border-green-200 text-green-700 dark:border-green-900 dark:text-green-400",
              t.type === "error" && "bg-[var(--bg-card)] border-red-200 text-red-700 dark:border-red-900 dark:text-red-400",
              t.type === "info" && "bg-[var(--bg-card)] border-[var(--border)] text-[var(--text)]"
            )}
          >
            {t.type === "success" && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
            {t.type === "error" && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            {t.type === "info" && <Info className="w-4 h-4 flex-shrink-0" />}
            <span>{t.message}</span>
            <button onClick={() => remove(t.id)} className="ml-1 opacity-60 hover:opacity-100">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
