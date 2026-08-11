interface DeclarationReceiptData {
  companyName: string
  currency: string
  weekNumber: number
  year: number
  revenue: number
  chargesDeductible: number
  chargesNonDeductible: number
  netProfit: number
  taxes: number
  declaredAt: string | Date
  mairieZone?: "NORD" | "SUD" | null
}

export function downloadDeclarationReceipt(d: DeclarationReceiptData) {
  const f = (n: number) => `${d.currency}${(n ?? 0).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const declaredAt = new Date(d.declaredAt).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })
  const zoneLabel = d.mairieZone === "NORD" ? "Mairie Nord" : d.mairieZone === "SUD" ? "Mairie Sud" : null

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Accusé de réception — ${d.companyName} — S${String(d.weekNumber).padStart(2, "0")} ${d.year}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #1a1a2e; background: #fff; padding: 40px; max-width: 640px; margin: 0 auto; }
  h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
  .subtitle { font-size: 13px; color: #6b7280; margin-bottom: 24px; }
  .badge { display: inline-block; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; border-radius: 999px; padding: 4px 12px; font-size: 12px; font-weight: 600; margin-bottom: 24px; }
  .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
  .row.total { font-weight: 700; font-size: 15px; border-bottom: none; padding-top: 16px; }
  .row span:first-child { color: #6b7280; }
  .footer { margin-top: 32px; font-size: 11px; color: #9ca3af; }
</style>
</head>
<body>
  <h1>Accusé de réception — Déclaration d'impôt</h1>
  <p class="subtitle">${d.companyName} — Semaine ${String(d.weekNumber).padStart(2, "0")} / ${d.year}${zoneLabel ? ` · ${zoneLabel}` : ""}</p>
  <span class="badge">✓ Déclaration reçue le ${declaredAt}</span>
  <div class="row"><span>Chiffre d'affaires</span><span>${f(d.revenue)}</span></div>
  <div class="row"><span>Charges déductibles</span><span>${f(d.chargesDeductible)}</span></div>
  <div class="row"><span>Charges non déductibles</span><span>${f(d.chargesNonDeductible)}</span></div>
  <div class="row"><span>Bénéfice net</span><span>${f(d.netProfit)}</span></div>
  <div class="row total"><span>Impôt déclaré</span><span>${f(d.taxes)}</span></div>
  <p class="footer">Document généré automatiquement — les chiffres sont figés au moment de la déclaration et ne reflètent pas d'éventuelles modifications ultérieures des données comptables de l'entreprise.</p>
</body>
</html>`

  const blob = new Blob([html], { type: "text/html;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `recu-declaration-${d.companyName.replace(/[^a-zA-Z0-9]/g, "_")}-S${String(d.weekNumber).padStart(2, "0")}-${d.year}.html`
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
