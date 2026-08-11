"use client"
import { useState, useEffect, useCallback } from "react"
import { FileText, Link as LinkIcon, Plus, Trash2, Download, Eye, ExternalLink, AlertTriangle } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { toGooglePreviewUrl } from "@/lib/google-docs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Doc {
  id: string; title: string; kind: "FILE" | "LINK"
  filePath: string | null; externalUrl: string | null
  expiresAt: string | null; createdAt: string
}
interface Props { employeeId: string; canManage: boolean }

const EMPTY = { title: "", kind: "FILE" as "FILE" | "LINK", externalUrl: "", expiresAt: "" }

export default function EmployeeDocumentsTab({ employeeId, canManage }: Props) {
  const [documents, setDocuments] = useState<Doc[]>([])
  const [loaded, setLoaded] = useState(false)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [preview, setPreview] = useState<Doc | null>(null)
  const [deleteDoc, setDeleteDoc] = useState<Doc | null>(null)

  const fetchDocuments = useCallback(async () => {
    const res = await fetch(`/api/employees/${employeeId}/documents`)
    if (res.ok) setDocuments(await res.json())
    setLoaded(true)
  }, [employeeId])

  useEffect(() => { fetchDocuments() }, [fetchDocuments])

  function isExpiringSoon(doc: Doc) {
    if (!doc.expiresAt) return false
    const days = (new Date(doc.expiresAt).getTime() - Date.now()) / 86400000
    return days <= 30
  }

  async function upload() {
    setLoading(true); setError("")
    try {
      const body = new FormData()
      body.set("title", form.title)
      body.set("kind", form.kind)
      if (form.expiresAt) body.set("expiresAt", form.expiresAt)
      if (form.kind === "FILE") {
        if (!file) throw new Error("Sélectionnez un fichier PDF")
        body.set("file", file)
      } else {
        body.set("externalUrl", form.externalUrl)
      }
      const res = await fetch(`/api/employees/${employeeId}/documents`, { method: "POST", body })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur")
      setModal(false); setForm(EMPTY); setFile(null)
      fetchDocuments()
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function remove() {
    if (!deleteDoc) return
    setLoading(true)
    await fetch(`/api/employees/${employeeId}/documents/${deleteDoc.id}`, { method: "DELETE" })
    setDeleteDoc(null); setLoading(false)
    fetchDocuments()
  }

  function previewUrl(doc: Doc): string | null {
    if (doc.kind === "FILE") return `/api/employees/${employeeId}/documents/${doc.id}/file`
    return doc.externalUrl ? toGooglePreviewUrl(doc.externalUrl) : null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{documents.length} document{documents.length !== 1 ? "s" : ""}</p>
        {canManage && (
          <Button size="sm" onClick={() => { setForm(EMPTY); setFile(null); setError(""); setModal(true) }}>
            <Plus className="h-3.5 w-3.5" /> Ajouter
          </Button>
        )}
      </div>

      {loaded && documents.length === 0 && (
        <Card className="p-10 text-center"><p className="text-muted-foreground">Aucun document</p></Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {documents.map(doc => (
          <Card key={doc.id}>
            <CardContent className="p-4 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  {doc.kind === "FILE" ? <FileText className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{doc.title}</p>
                  <p className="text-[11px] text-muted-foreground">Ajouté le {formatDate(doc.createdAt)}</p>
                </div>
              </div>
              {doc.expiresAt && (
                <Badge variant={isExpiringSoon(doc) ? "destructive" : "outline"} className="text-[10px] gap-1">
                  {isExpiringSoon(doc) && <AlertTriangle className="h-2.5 w-2.5" />}
                  Expire le {formatDate(doc.expiresAt)}
                </Badge>
              )}
              <div className="flex gap-1.5 pt-1">
                <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => setPreview(doc)}>
                  <Eye className="h-3.5 w-3.5" /> Aperçu
                </Button>
                {doc.kind === "FILE" ? (
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <a href={`/api/employees/${employeeId}/documents/${doc.id}/file?download=1`}><Download className="h-3.5 w-3.5" /></a>
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <a href={doc.externalUrl ?? "#"} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a>
                  </Button>
                )}
                {canManage && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteDoc(doc)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Aperçu */}
      <Dialog open={!!preview} onOpenChange={v => !v && setPreview(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader><DialogTitle>{preview?.title}</DialogTitle></DialogHeader>
          {preview && (previewUrl(preview) ? (
            <iframe src={previewUrl(preview)!} className="w-full h-[70vh] rounded-lg border" />
          ) : (
            <p className="text-sm text-muted-foreground">Aperçu indisponible pour ce lien.</p>
          ))}
        </DialogContent>
      </Dialog>

      {/* Ajout */}
      <Dialog open={modal} onOpenChange={v => !v && setModal(false)}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Ajouter un document</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Titre</Label><Input placeholder="Contrat de travail, pièce d'identité..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div className="flex gap-2">
              <Button type="button" variant={form.kind === "FILE" ? "default" : "outline"} size="sm" className="flex-1" onClick={() => setForm({ ...form, kind: "FILE" })}>PDF</Button>
              <Button type="button" variant={form.kind === "LINK" ? "default" : "outline"} size="sm" className="flex-1" onClick={() => setForm({ ...form, kind: "LINK" })}>Lien Google</Button>
            </div>
            {form.kind === "FILE" ? (
              <div className="space-y-1.5"><Label>Fichier PDF (max 10 Mo)</Label><Input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] ?? null)} /></div>
            ) : (
              <div className="space-y-1.5"><Label>Lien Google Docs/Sheets/Slides/Drive</Label><Input placeholder="https://docs.google.com/document/d/..." value={form.externalUrl} onChange={e => setForm({ ...form, externalUrl: e.target.value })} /></div>
            )}
            <div className="space-y-1.5"><Label>Date d'expiration (optionnel)</Label><Input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} /></div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setModal(false)}>Annuler</Button><Button className="flex-1" onClick={upload} disabled={loading || !form.title}>{loading ? "..." : "Ajouter"}</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Suppression */}
      <Dialog open={!!deleteDoc} onOpenChange={v => !v && setDeleteDoc(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Supprimer ce document ?</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">⚠️ Action irréversible.</div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteDoc(null)}>Annuler</Button>
              <Button variant="destructive" className="flex-1" onClick={remove} disabled={loading}>{loading ? "..." : "Supprimer"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
