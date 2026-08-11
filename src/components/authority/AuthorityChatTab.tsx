"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  authorUserId: string
  fromAuthority: boolean
  body: string
  createdAt: string
}

interface Props {
  messagesUrl: string
  sendUrl: string
  readUrl: string
  sendExtra?: Record<string, any>
  viewerIsAuthority: boolean
  canSend: boolean
}

const POLL_INTERVAL = 4000

export default function AuthorityChatTab({ messagesUrl, sendUrl, readUrl, sendExtra, viewerIsAuthority, canSend }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchMessages = useCallback(async (silent = false) => {
    const res = await fetch(messagesUrl)
    if (res.ok) setMessages(await res.json())
    if (!silent) setLoaded(true)
  }, [messagesUrl])

  useEffect(() => {
    fetchMessages()
    fetch(readUrl, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sendExtra ?? {}) })
    const id = setInterval(() => fetchMessages(true), POLL_INTERVAL)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesUrl, readUrl])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages.length])

  async function send() {
    const body = draft.trim()
    if (!body) return
    setSending(true)
    setDraft("")
    try {
      const res = await fetch(sendUrl, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, ...(sendExtra ?? {}) }),
      })
      if (res.ok) await fetchMessages(true)
    } finally { setSending(false) }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex flex-col rounded-lg border h-[480px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loaded && messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Aucun message pour l'instant</p>
        )}
        {messages.map(m => {
          const mine = m.fromAuthority === viewerIsAuthority
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[75%] rounded-xl px-3.5 py-2 text-sm", mine ? "bg-primary text-primary-foreground" : "bg-muted")}>
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={cn("text-[10px] mt-1", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>{formatTime(m.createdAt)}</p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      {canSend ? (
        <div className="border-t p-3 flex gap-2 items-end">
          <Textarea
            rows={1} placeholder="Écrire un message..." value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }}
            className="resize-none min-h-9 max-h-32"
          />
          <Button size="icon" onClick={send} disabled={sending || !draft.trim()}><Send className="h-4 w-4" /></Button>
        </div>
      ) : (
        <div className="border-t p-3 text-xs text-muted-foreground text-center">Lecture seule</div>
      )}
    </div>
  )
}
