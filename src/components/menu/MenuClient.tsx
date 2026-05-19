"use client"
import { useState, useMemo } from "react"
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, ImageIcon, X, ChefHat } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface RecipeLine { ingredientId: string; ingredientName: string; quantity: number }
interface MenuItem {
  id: string; name: string; description: string | null; price: number; costPrice: number
  category: string; isAvailable: boolean; imageUrl: string | null
  recipeLines: { ingredientId: string; quantity: number; ingredient: { id: string; name: string } }[]
}
interface Ingredient { id: string; name: string; quantity: number; minQuantity: number }

const EMPTY = { name: "", description: "", price: "", costPrice: "", category: "", imageUrl: "", isAvailable: true }

interface Props { items: MenuItem[]; role: string; currency: string; ingredients: Ingredient[] }

export default function MenuClient({ items, role, currency, ingredients }: Props) {
  const router = useRouter()
  const [modal, setModal] = useState<"create" | "edit" | null>(null)
  const [selected, setSelected] = useState<MenuItem | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [recipeLines, setRecipeLines] = useState<RecipeLine[]>([])
  const [newIngredientId, setNewIngredientId] = useState("")
  const [newIngredientQty, setNewIngredientQty] = useState("1")
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [imgError, setImgError] = useState(false)

  const fmt = (n: number) => formatCurrency(n, currency)
  const canEdit = role !== "EMPLOYEE"
  const canRecipe = role === "OWNER"
  const categories = useMemo(() => [...new Set(items.map(i => i.category))], [items])
  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase()))
  const grouped = categories.reduce<Record<string, MenuItem[]>>((acc, cat) => {
    const catItems = filtered.filter(i => i.category === cat)
    if (catItems.length > 0) acc[cat] = catItems
    return acc
  }, {})

  function openCreate() {
    setForm(EMPTY); setImgError(false); setRecipeLines([]); setNewIngredientId(""); setNewIngredientQty("1"); setModal("create")
  }
  function openEdit(item: MenuItem) {
    setSelected(item); setImgError(false)
    setForm({ name: item.name, description: item.description ?? "", price: String(item.price), costPrice: String(item.costPrice), category: item.category, imageUrl: item.imageUrl ?? "", isAvailable: item.isAvailable })
    setRecipeLines(item.recipeLines.map(l => ({ ingredientId: l.ingredientId, ingredientName: l.ingredient.name, quantity: l.quantity })))
    setNewIngredientId(""); setNewIngredientQty("1")
    setModal("edit")
  }

  function addIngredient() {
    if (!newIngredientId) return
    const ing = ingredients.find(i => i.id === newIngredientId)
    if (!ing) return
    if (recipeLines.some(l => l.ingredientId === newIngredientId)) return
    const qty = parseFloat(newIngredientQty) || 1
    setRecipeLines(prev => [...prev, { ingredientId: newIngredientId, ingredientName: ing.name, quantity: qty }])
    setNewIngredientId(""); setNewIngredientQty("1")
  }

  function removeIngredient(ingredientId: string) {
    setRecipeLines(prev => prev.filter(l => l.ingredientId !== ingredientId))
  }

  function updateIngredientQty(ingredientId: string, qty: string) {
    setRecipeLines(prev => prev.map(l => l.ingredientId === ingredientId ? { ...l, quantity: parseFloat(qty) || 0 } : l))
  }

  async function save() {
    setLoading(true)
    const payload: any = {
      ...form,
      price: parseFloat(form.price as string),
      costPrice: parseFloat(form.costPrice as string) || 0,
    }
    if (canRecipe) payload.recipeLines = recipeLines.map(l => ({ ingredientId: l.ingredientId, quantity: l.quantity }))

    if (modal === "create") await fetch("/api/menu", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    else if (selected) await fetch(`/api/menu/${selected.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    setLoading(false); setModal(null); router.refresh()
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cet article ?")) return
    await fetch(`/api/menu/${id}`, { method: "DELETE" }); router.refresh()
  }

  async function toggleAvail(item: MenuItem) {
    await fetch(`/api/menu/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isAvailable: !item.isAvailable }) })
    router.refresh()
  }

  const previewUrl = (form.imageUrl as string)?.startsWith("http") ? form.imageUrl : null
  const availableIngredients = ingredients.filter(i => !recipeLines.some(l => l.ingredientId === i.id))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Carte</h1>
          <p className="text-sm text-muted-foreground mt-1">{items.length} article{items.length > 1 ? "s" : ""}</p>
        </div>
        {canEdit && <Button onClick={openCreate}><Plus className="h-4 w-4" /> Ajouter</Button>}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input placeholder="Rechercher..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {Object.entries(grouped).map(([cat, catItems]) => (
        <div key={cat}>
          <div className="flex items-center gap-3 mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{cat}</p>
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">{catItems.length}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {catItems.map(item => (
              <Card key={item.id} className={`overflow-hidden transition-all ${!item.isAvailable ? "opacity-50" : "hover:border-border/80"}`}>
                <div className="relative">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="h-28 w-full object-contain bg-muted p-1" onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                  ) : (
                    <div className="h-24 bg-muted flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  {!item.isAvailable && <div className="absolute inset-0 bg-background/60 flex items-center justify-center"><Badge variant="destructive" className="text-[10px]">Indisponible</Badge></div>}
                  {item.recipeLines.length > 0 && (
                    <div className="absolute bottom-1.5 right-1.5">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 gap-1">
                        <ChefHat className="h-2.5 w-2.5" />{item.recipeLines.length}
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <p className="text-sm font-semibold truncate">{item.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-bold text-primary">{fmt(item.price)}</span>
                    {item.costPrice > 0 && <span className="text-[10px] text-muted-foreground">coût: {fmt(item.costPrice)}</span>}
                  </div>
                  {canEdit && (
                    <div className="flex gap-1 mt-2 pt-2 border-t">
                      <Button variant="ghost" size="icon" className="h-7 w-7 flex-1" onClick={() => toggleAvail(item)}>
                        {item.isAvailable ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 flex-1" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 flex-1 hover:bg-destructive/10 hover:text-destructive" onClick={() => remove(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <Card className="p-16 text-center">
          <p className="text-muted-foreground mb-4">Aucun article dans la carte</p>
          {canEdit && <Button onClick={openCreate}>Ajouter le premier article</Button>}
        </Card>
      )}

      <Dialog open={modal !== null} onOpenChange={v => !v && setModal(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{modal === "create" ? "Nouvel article" : "Modifier l'article"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Nom</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5"><Label>Prix vente</Label><Input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Coût revient</Label><Input type="number" step="0.01" min="0" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Catégorie</Label><Input placeholder="Plats..." value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
            </div>
            <div className="space-y-1.5">
              <Label>Image (URL)</Label>
              <Input placeholder="https://..." value={form.imageUrl} onChange={e => { setForm({ ...form, imageUrl: e.target.value }); setImgError(false) }} />
              {previewUrl && !imgError && (
                <div className="mt-2 h-24 overflow-hidden rounded-lg border bg-muted">
                  <img src={previewUrl as string} alt="preview" className="h-full w-full object-cover" onError={() => setImgError(true)} />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <Switch checked={form.isAvailable} onCheckedChange={v => setForm({ ...form, isAvailable: v })} />
              <Label>Disponible à la vente</Label>
            </div>

            {canRecipe && ingredients.length > 0 && (
              <div className="space-y-2 rounded-lg border p-3 bg-muted/20">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <ChefHat className="h-3 w-3" />Recette (ingrédients)
                </p>

                {recipeLines.length > 0 && (
                  <div className="space-y-1.5">
                    {recipeLines.map(line => (
                      <div key={line.ingredientId} className="flex items-center gap-2">
                        <span className="flex-1 text-sm truncate">{line.ingredientName}</span>
                        <Input
                          type="number" min="0.01" step="0.01"
                          value={line.quantity}
                          onChange={e => updateIngredientQty(line.ingredientId, e.target.value)}
                          className="h-7 w-20 text-xs text-right"
                        />
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 hover:bg-destructive/10 hover:text-destructive" onClick={() => removeIngredient(line.ingredientId)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {availableIngredients.length > 0 && (
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Select value={newIngredientId} onValueChange={setNewIngredientId}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Ajouter un ingrédient…" /></SelectTrigger>
                        <SelectContent>
                          {availableIngredients.map(i => (
                            <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Input
                      type="number" min="0.01" step="0.01" placeholder="Qté"
                      value={newIngredientQty}
                      onChange={e => setNewIngredientQty(e.target.value)}
                      className="h-8 w-20 text-xs"
                    />
                    <Button size="sm" variant="outline" className="h-8" onClick={addIngredient} disabled={!newIngredientId}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {recipeLines.length === 0 && <p className="text-xs text-muted-foreground">Aucun ingrédient — pas de déduction de stock à la vente</p>}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setModal(null)}>Annuler</Button>
              <Button className="flex-1" onClick={save} disabled={loading}>{loading ? "Enregistrement..." : "Enregistrer"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
