"use client"
import { useState, useMemo } from "react"
import { Plus, Pencil, Trash2, Search, ImageIcon, AlertTriangle, Package, History } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Ingredient {
  id: string
  name: string
  quantity: number
  minQuantity: number
  imageUrl: string | null
}

const EMPTY = { name: "", quantity: "0", minQuantity: "0", imageUrl: "" }

interface Props { ingredients: Ingredient[] }

export default function StockClient({ ingredients: initial }: Props) {
  const router = useRouter()
  const [ingredients, setIngredients] = useState(initial)
  const [modal, setModal] = useState<"create" | "edit" | null>(null)
  const [selected, setSelected] = useState<Ingredient | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [imgError, setImgError] = useState(false)

  const filtered = useMemo(() =>
    ingredients.filter(i => i.name.toLowerCase().includes(search.toLowerCase())),
    [ingredients, search]
  )

  const lowStock = ingredients.filter(i => i.quantity <= i.minQuantity)

  function openCreate() {
    setForm(EMPTY); setImgError(false); setModal("create")
  }
  function openEdit(item: Ingredient) {
    setSelected(item); setImgError(false)
    setForm({ name: item.name, quantity: String(item.quantity), minQuantity: String(item.minQuantity), imageUrl: item.imageUrl ?? "" })
    setModal("edit")
  }

  async function save() {
    setLoading(true)
    const payload = {
      name: form.name,
      quantity: parseFloat(form.quantity) || 0,
      minQuantity: parseFloat(form.minQuantity) || 0,
      imageUrl: form.imageUrl.trim() || null,
    }
    if (modal === "create") {
      const res = await fetch("/api/stock", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      if (res.ok) {
        const created = await res.json()
        setIngredients(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      }
    } else if (selected) {
      const res = await fetch(`/api/stock/${selected.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      if (res.ok) {
        const updated = await res.json()
        setIngredients(prev => prev.map(i => i.id === selected.id ? updated : i))
      }
    }
    setLoading(false); setModal(null)
    router.refresh()
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cet ingrédient ? Les recettes l'utilisant seront également supprimées.")) return
    await fetch(`/api/stock/${id}`, { method: "DELETE" })
    setIngredients(prev => prev.filter(i => i.id !== id))
    router.refresh()
  }

  const previewUrl = form.imageUrl.startsWith("http") ? form.imageUrl : null

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stock</h1>
          <p className="text-sm text-muted-foreground mt-1">{ingredients.length} ingrédient{ingredients.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/stock/history"><History className="h-4 w-4" /> Historique</Link>
          </Button>
          <Button onClick={openCreate}><Plus className="h-4 w-4" /> Ajouter</Button>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">{lowStock.length} ingrédient{lowStock.length !== 1 ? "s" : ""} en rupture ou sous le seuil</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map(i => (
              <Badge key={i.id} variant="outline" className="border-amber-500/50 text-amber-600 dark:text-amber-400 text-xs">
                {i.name} — {i.quantity}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input placeholder="Rechercher un ingrédient..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 && (
        <Card className="p-16 text-center">
          <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">{ingredients.length === 0 ? "Aucun ingrédient" : "Aucun résultat"}</p>
          {ingredients.length === 0 && <Button onClick={openCreate}>Ajouter le premier ingrédient</Button>}
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filtered.map(item => {
          const isLow = item.quantity <= item.minQuantity
          return (
            <Card key={item.id} className={`overflow-hidden transition-all ${isLow ? "border-amber-500/40" : "hover:border-border/80"}`}>
              <div className="relative">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="h-28 w-full object-contain bg-muted p-1" onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                ) : (
                  <div className="h-24 bg-muted flex items-center justify-center">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                {isLow && (
                  <div className="absolute top-1.5 right-1.5">
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">Stock bas</Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-semibold truncate">{item.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-sm font-bold ${isLow ? "text-amber-500" : "text-primary"}`}>{item.quantity}</span>
                  <span className="text-[10px] text-muted-foreground">min: {item.minQuantity}</span>
                </div>
                <div className="flex gap-1 mt-2 pt-2 border-t">
                  <Button variant="ghost" size="icon" className="h-7 w-7 flex-1" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 flex-1 hover:bg-destructive/10 hover:text-destructive" onClick={() => remove(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={modal !== null} onOpenChange={v => !v && setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modal === "create" ? "Nouvel ingrédient" : "Modifier l'ingrédient"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nom</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Quantité en stock</Label>
                <Input type="number" min="0" step="0.01" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Seuil d'alerte</Label>
                <Input type="number" min="0" step="0.01" value={form.minQuantity} onChange={e => setForm({ ...form, minQuantity: e.target.value })} />
                <p className="text-xs text-muted-foreground">Alerte si stock ≤ ce seuil</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Image (URL)</Label>
              <Input placeholder="https://..." value={form.imageUrl} onChange={e => { setForm({ ...form, imageUrl: e.target.value }); setImgError(false) }} />
              {previewUrl && !imgError && (
                <div className="mt-2 h-24 overflow-hidden rounded-lg border bg-muted">
                  <img src={previewUrl} alt="preview" className="h-full w-full object-cover" onError={() => setImgError(true)} />
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setModal(null)}>Annuler</Button>
              <Button className="flex-1" onClick={save} disabled={loading || !form.name.trim()}>
                {loading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
