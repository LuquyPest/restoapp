"use client"

import { useEffect } from "react"
import { X } from "lucide-react"

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg"
}

export default function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    if (open) document.addEventListener("keydown", h)
    return () => document.removeEventListener("keydown", h)
  }, [open, onClose])

  if (!open) return null

  const maxW = size === "sm" ? 420 : size === "lg" ? 680 : 520

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div onClick={onClose} style={{
        position: "absolute", inset: 0,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      }} />
      <div style={{
        position: "relative", width: "100%", maxWidth: maxW,
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-mid)",
        borderRadius: 16,
        boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        animation: "fadeUp 0.2s ease forwards",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border)",
            background: "transparent", cursor: "pointer", color: "var(--text-muted)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <X size={13} />
          </button>
        </div>
        <div style={{ padding: "20px" }}>{children}</div>
      </div>
    </div>
  )
}
