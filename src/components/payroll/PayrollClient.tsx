"use client"
import { useState } from "react"
import { formatCurrency, formatDate, getISOWeek } from "@/lib/utils"
import { Calculator, CheckCircle, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"


interface Grade { name: string; salaryPercent: number }
interface Employee { id: string; firstName: string; lastName: string; grade: Grade }
interface Payroll {
  id: string
  weekNumber: number
  year: number
  revenue: number
  costRevenue: number
  grossSalary: number
  taxes: number
  bonus: number
  netSalary: number
  isPaid: boolean
  employee: Employee & { grade: Grade }
}
interface Props { payrolls: Payroll[]; employees: Employee[]; role: string; currency: string; defaultTaxRate: number }

export default function PayrollClient({ payrolls, employees, role, currency, defaultTaxRate }: Props) {
  const router = useRouter()
  const now = new Date()
  const [modal, setModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [weekNumber, setWeekNumber] = useState(String(getISOWeek(now)))
  const [year, setYear] = useState(String(now.getFullYear()))
  const [taxRate, setTaxRate] = useState(String(defaultTaxRate))
  const [bonuses, setBonuses] = useState<Record<string, string>>({})
  const isOwner = role === "OWNER" || role === "MANAGER"
  const fmt = (n: number) => formatCurrency(n, currency)
  const totalNet = payrolls.filter(p => !p.isPaid).reduce((s, p) => s + p.netSalary, 0)

  async function generate() {
    setLoading(true)
    const bonusMap: Record<string, number> = {}
    Object.entries(bonuses).forEach(([id, val]) => { if (val) bonusMap[id] = parseFloat(val) })
    await fetch("/api/payroll", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weekNumber: parseInt(weekNumber),
        year: parseInt(year),
        taxRate: parseFloat(taxRate),
        bonuses: bonusMap,
      }),
    })
    setLoading(false); setModal(false); router.refresh()
  }

  async function markPaid(id: string) {
    await fetch(`/api/payroll/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isPaid: true }) })
    router.refresh()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isOwner ? `${payrolls.filter(p => !p.isPaid).length} en attente · ${fmt(totalNet)} à verser` : "Votre historique de payes"}
          </p>
        </div>
        {isOwner && (
          <Button onClick={() => setModal(true)}>
            <Calculator className="h-4 w-4" /> Générer les payes
          </Button>
        )}
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              {isOwner && <TableHead>Employé</TableHead>}
              <TableHead>Semaine</TableHead>
              <TableHead>CA réalisé</TableHead>
              <TableHead>Coût revient</TableHead>
              <TableHead>Salaire brut</TableHead>
              <TableHead>Taxes</TableHead>
              <TableHead>Prime</TableHead>
              <TableHead>Net</TableHead>
              <TableHead>Statut</TableHead>
              {isOwner && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {payrolls.length === 0 ? (
              <TableRow><TableCell colSpan={isOwner ? 10 : 8} className="text-center py-10 text-muted-foreground">Aucune paye générée</TableCell></TableRow>
            ) : payrolls.map(p => (
              <TableRow key={p.id}>
                {isOwner && (
                  <TableCell>
                    <div>
                      <p className="font-medium">{p.employee.firstName} {p.employee.lastName}</p>
                      <p className="text-xs text-muted-foreground">{p.employee.grade.name} · {p.employee.grade.salaryPercent}%</p>
                    </div>
                  </TableCell>
                )}
                <TableCell className="text-xs text-muted-foreground">S{String(p.weekNumber).padStart(2,"0")} {p.year}</TableCell>
                <TableCell className="font-medium">{fmt(p.revenue)}</TableCell>
                <TableCell className="text-amber-500">−{fmt(p.costRevenue ?? 0)}</TableCell>
                <TableCell>{fmt(p.grossSalary)}</TableCell>
                <TableCell className="text-destructive">−{fmt(p.taxes)}</TableCell>
                <TableCell className="text-emerald-500">+{fmt(p.bonus)}</TableCell>
                <TableCell className="font-bold">{fmt(p.netSalary)}</TableCell>
                <TableCell>
                  {p.isPaid
                    ? <Badge variant="success"><CheckCircle className="h-3 w-3" /> Versée</Badge>
                    : <Badge variant="warning"><Clock className="h-3 w-3" /> En attente</Badge>}
                </TableCell>
                {isOwner && (
                  <TableCell>
                    {!p.isPaid && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs hover:text-primary" onClick={() => markPaid(p.id)}>
                        Marquer versée
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={modal} onOpenChange={v => !v && setModal(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Générer les payes</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Semaine</Label>
                <Input type="number" min="1" max="53" value={weekNumber} onChange={e => setWeekNumber(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Année</Label>
                <Input type="number" min="2020" value={year} onChange={e => setYear(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Taux taxes (%)</Label>
                <Input type="number" min="0" max="100" step="0.1" value={taxRate} onChange={e => setTaxRate(e.target.value)} />
              </div>
            </div>

            {employees.length > 0 && (
              <div>
                <Label className="mb-2 block">Primes individuelles (optionnel)</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {employees.map(emp => (
                    <div key={emp.id} className="flex items-center gap-3">
                      <div className="flex-1 text-sm">
                        <p className="font-medium">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-muted-foreground">{emp.grade.name} · {emp.grade.salaryPercent}%</p>
                      </div>
                      <Input type="number" min="0" step="0.01" className="w-28 h-8 text-xs" placeholder="0"
                        value={bonuses[emp.id] ?? ""} onChange={e => setBonuses(p => ({ ...p, [emp.id]: e.target.value }))} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
              Calcul : (CA − coût revient) × % grade = brut. Taxes déduites, primes ajoutées.
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setModal(false)}>Annuler</Button>
              <Button className="flex-1" onClick={generate} disabled={loading || !weekNumber || !year}>
                {loading ? "Génération..." : "Générer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
