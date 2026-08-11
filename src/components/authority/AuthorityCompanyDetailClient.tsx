"use client"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Building2, Calendar, StickyNote } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { COMPANY_TYPE_LABELS, type CompanyType } from "@/lib/business-types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import BarChart from "@/components/ui/BarChart"
import AuthorityChatTab from "./AuthorityChatTab"
import { cn } from "@/lib/utils"

type ReviewStatus = "PENDING" | "REVIEWED" | "FLAGGED"

interface Company { id: string; name: string; type: CompanyType; currency: string; mairieZone: "NORD" | "SUD" | null }
interface Declaration {
  id: string; weekNumber: number; year: number; revenue: number
  chargesDeductible: number; chargesNonDeductible: number; netProfit: number; taxes: number; declaredAt: string
  reviewStatus: ReviewStatus; reviewNotes: string | null
}
interface Props { company: Company; declarations: Declaration[]; canManage: boolean }

const TABS = [
  { key: "declarations", label: "Déclarations" },
  { key: "messages", label: "Messages" },
] as const
type TabKey = typeof TABS[number]["key"]

const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  PENDING: "À traiter",
  REVIEWED: "Vérifiée",
  FLAGGED: "Signalée",
}
const REVIEW_STATUS_BADGE: Record<ReviewStatus, "muted" | "success" | "destructive"> = {
  PENDING: "muted",
  REVIEWED: "success",
  FLAGGED: "destructive",
}

export default function AuthorityCompanyDetailClient({ company, declarations: initialDeclarations, canManage }: Props) {
  const [tab, setTab] = useState<TabKey>("declarations")
  const [declarations, setDeclarations] = useState(initialDeclarations)
  const [notesDialogFor, setNotesDialogFor] = useState<string | null>(null)
  const [notesDraft, setNotesDraft] = useState("")
  const [savingNotes, setSavingNotes] = useState(false)
  const fmt = (n: number) => formatCurrency(n, company.currency)

  async function updateReview(id: string, patch: { reviewStatus?: ReviewStatus; reviewNotes?: string | null }) {
    const current = declarations.find(d => d.id === id)
    if (!current) return
    const res = await fetch(`/api/authority/declarations/${id}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reviewStatus: patch.reviewStatus ?? current.reviewStatus,
        reviewNotes: patch.reviewNotes !== undefined ? patch.reviewNotes : current.reviewNotes,
      }),
    })
    if (res.ok) {
      const updated = await res.json()
      setDeclarations(prev => prev.map(d => d.id === id ? { ...d, reviewStatus: updated.reviewStatus, reviewNotes: updated.reviewNotes } : d))
    }
  }

  function openNotes(d: Declaration) {
    setNotesDialogFor(d.id)
    setNotesDraft(d.reviewNotes ?? "")
  }

  async function saveNotes() {
    if (!notesDialogFor) return
    setSavingNotes(true)
    try {
      await updateReview(notesDialogFor, { reviewNotes: notesDraft.trim() || null })
      setNotesDialogFor(null)
    } finally {
      setSavingNotes(false)
    }
  }

  const trendData = [...declarations].reverse().slice(-12).map(d => ({
    label: `S${String(d.weekNumber).padStart(2, "0")}`,
    value: d.taxes,
  }))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link href="/authority/companies"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
          <Building2 className="h-4.5 w-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold tracking-tight truncate">{company.name}</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge variant="secondary" className="text-[10px]">{COMPANY_TYPE_LABELS[company.type]}</Badge>
            {company.mairieZone && <Badge variant="outline" className="text-[10px]">{company.mairieZone === "NORD" ? "Mairie Nord" : "Mairie Sud"}</Badge>}
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "declarations" && (
        <div className="space-y-4">
          {declarations.length === 0 ? (
            <Card className="p-10 text-center"><p className="text-muted-foreground">Aucune déclaration reçue</p></Card>
          ) : (
            <>
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Évolution de l'impôt déclaré</p>
                  <BarChart data={trendData} currency={company.currency} />
                </CardContent>
              </Card>

              <Card>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Semaine</TableHead>
                        <TableHead>CA</TableHead>
                        <TableHead>Charges</TableHead>
                        <TableHead>Bénéfice net</TableHead>
                        <TableHead>Impôt</TableHead>
                        <TableHead>Déclarée le</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {declarations.map(d => (
                        <TableRow key={d.id}>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] gap-1"><Calendar className="h-2.5 w-2.5" />S{String(d.weekNumber).padStart(2, "0")} {d.year}</Badge>
                          </TableCell>
                          <TableCell>{fmt(d.revenue)}</TableCell>
                          <TableCell>{fmt(d.chargesDeductible + d.chargesNonDeductible)}</TableCell>
                          <TableCell>{fmt(d.netProfit)}</TableCell>
                          <TableCell className="font-semibold text-primary">{fmt(d.taxes)}</TableCell>
                          <TableCell className="text-muted-foreground text-xs whitespace-nowrap">{formatDate(d.declaredAt)}</TableCell>
                          <TableCell>
                            {canManage ? (
                              <Select value={d.reviewStatus} onValueChange={(v) => updateReview(d.id, { reviewStatus: v as ReviewStatus })}>
                                <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {(Object.keys(REVIEW_STATUS_LABELS) as ReviewStatus[]).map(s => (
                                    <SelectItem key={s} value={s}>{REVIEW_STATUS_LABELS[s]}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge variant={REVIEW_STATUS_BADGE[d.reviewStatus]} className="text-[10px]">{REVIEW_STATUS_LABELS[d.reviewStatus]}</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost" size="icon" className="h-8 w-8"
                              onClick={() => openNotes(d)}
                              title={canManage ? "Ajouter/modifier une note" : "Voir la note"}
                            >
                              <StickyNote className={cn("h-3.5 w-3.5", d.reviewNotes ? "text-primary" : "text-muted-foreground")} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </>
          )}
        </div>
      )}

      {tab === "messages" && (
        <AuthorityChatTab
          messagesUrl={`/api/authority-messages/${company.id}`}
          sendUrl={`/api/authority-messages/${company.id}`}
          readUrl={`/api/authority-messages/${company.id}/read`}
          viewerIsAuthority
          canSend={canManage}
        />
      )}

      <Dialog open={notesDialogFor !== null} onOpenChange={(open) => { if (!open) setNotesDialogFor(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Note de vérification interne</DialogTitle>
          </DialogHeader>
          {canManage ? (
            <div className="space-y-3">
              <Textarea
                value={notesDraft}
                onChange={e => setNotesDraft(e.target.value)}
                placeholder="Note visible uniquement par votre autorité..."
                rows={5}
                maxLength={2000}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setNotesDialogFor(null)}>Annuler</Button>
                <Button onClick={saveNotes} disabled={savingNotes}>Enregistrer</Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {declarations.find(d => d.id === notesDialogFor)?.reviewNotes || "Aucune note"}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
