export function generateReportHtml(data: any, week: number, year: number): string {
  const c = data.currency ?? ""
  const f = (n: number) => `${c}${(n ?? 0).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const fd = (d: any) => d ? new Date(d).toLocaleDateString("fr-FR") : "—"
  const pct = (n: number) => `${n?.toFixed(2) ?? 0}%`

  const maxVal = Math.max(...(data.dailyData ?? []).map((d: any) => d.value), 1)

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Bilan S${String(week).padStart(2,"0")} ${year} — ${data.restaurantName}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1a1a2e; background: #fff; padding: 32px; }
  h1 { font-size: 24px; font-weight: 700; color: #1a1a2e; margin-bottom: 4px; letter-spacing: -0.02em; }
  h2 { font-size: 14px; font-weight: 700; color: #1a1a2e; margin: 24px 0 10px; padding-bottom: 6px; border-bottom: 2px solid #e5e7eb; text-transform: uppercase; letter-spacing: 0.05em; }
  .subtitle { font-size: 13px; color: #6b7280; margin-bottom: 28px; }
  .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 28px; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
  .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; }
  .card-title { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
  .card-value { font-size: 22px; font-weight: 700; color: #1a1a2e; letter-spacing: -0.02em; }
  .card-value.green { color: #16a34a; }
  .card-value.red { color: #dc2626; }
  .card-value.blue { color: #6c63ff; }
  .bilan-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
  .bilan-row.bold { font-weight: 600; border-bottom: 1px solid #e5e7eb; }
  .bilan-row.indent { padding-left: 16px; color: #6b7280; }
  .bilan-row span:last-child { font-weight: 500; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px; }
  th { background: #f3f4f6; color: #6b7280; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; padding: 8px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
  td { padding: 8px 12px; border-bottom: 1px solid #f3f4f6; color: #374151; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; }
  .badge-green { background: #dcfce7; color: #16a34a; }
  .badge-red { background: #fee2e2; color: #dc2626; }
  .badge-amber { background: #fef3c7; color: #d97706; }
  .badge-gray { background: #f3f4f6; color: #6b7280; }
  .bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 80px; margin: 12px 0; }
  .bar-wrap { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; height: 100%; justify-content: flex-end; }
  .bar { width: 100%; background: #6c63ff; border-radius: 4px 4px 0 0; min-height: 2px; }
  .bar-label { font-size: 10px; color: #9ca3af; font-weight: 500; }
  .section { margin-bottom: 36px; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center; }
  .mono { font-family: 'Courier New', monospace; }
</style>
</head>
<body>
<h1>${data.restaurantName} — Bilan hebdomadaire</h1>
<p class="subtitle">Semaine S${String(week).padStart(2,"0")} ${year} · Du ${data.weekStart} au ${data.weekEnd} · Généré le ${new Date().toLocaleDateString("fr-FR")}</p>

<div class="grid3">
  <div class="card"><div class="card-title">Chiffre d'affaires</div><div class="card-value blue">${f(data.revenue)}</div></div>
  <div class="card"><div class="card-title">Bénéfice net</div><div class="card-value ${(data.netProfit ?? 0) >= 0 ? "green" : "red"}">${f(data.netProfit)}</div></div>
  <div class="card"><div class="card-title">Trésorerie</div><div class="card-value">${f(data.treasury)}</div></div>
</div>

<div class="section">
<h2>Ventes par jour</h2>
<div class="bar-chart">${(data.dailyData ?? []).map((d: any) => {
  const h = Math.max((d.value / maxVal) * 70, d.value > 0 ? 4 : 0)
  return `<div class="bar-wrap"><div class="bar" style="height:${h}px" title="${f(d.value)}"></div><div class="bar-label">${d.label}</div></div>`
}).join("")}</div>
<table><thead><tr><th>Jour</th><th>Date</th><th>CA</th></tr></thead><tbody>
${(data.dailyData ?? []).map((d: any) => `<tr><td>${d.label}</td><td>${d.date}</td><td><strong>${f(d.value)}</strong></td></tr>`).join("")}
</tbody></table>
</div>

<div class="section">
<h2>Bilan financier</h2>
<div class="grid3">
<div class="card">
  <div class="card-title" style="margin-bottom:12px">Compte de résultat</div>
  <div class="bilan-row bold"><span>Chiffre d'affaires</span><span>${f(data.revenue)}</span></div>
  <div class="bilan-row bold"><span>− Salaires</span><span style="color:#d97706">${f(data.totalSalaries)}</span></div>
  <div class="bilan-row bold"><span>Bénéfice après salaires</span><span>${f(data.afterSalaries)}</span></div>
  <div class="bilan-row bold"><span>− Charges déductibles</span><span style="color:#d97706">${f(data.chargesDeductible)}</span></div>
  <div class="bilan-row bold"><span>Bénéfice brut</span><span>${f(data.grossProfit)}</span></div>
  <div class="bilan-row indent"><span>− Impôts (${pct(data.taxRate)})</span><span style="color:#dc2626">${f(data.taxes)}</span></div>
  <div class="bilan-row bold"><span>Bénéfice net</span><span style="color:#16a34a">${f(data.netProfit)}</span></div>
  <div class="bilan-row indent"><span>− Prime employés (${pct(data.bonusRate)})</span><span style="color:#d97706">${f(data.bonusTotal)}</span></div>
  <div class="bilan-row bold"><span>Après prime</span><span>${f(data.afterBonus)}</span></div>
  <div class="bilan-row indent"><span>Dividendes (${pct(data.dividendRate)})</span><span>${f(data.dividendTotal)}</span></div>
  <div class="bilan-row indent"><span>Trésorerie</span><span>${f(data.treasury)}</span></div>
  <div class="bilan-row indent"><span>− Charges non déductibles</span><span style="color:#dc2626">${f(data.chargesNonDeductible)}</span></div>
  <div class="bilan-row bold"><span>Bénéfice final</span><span style="color:${(data.finalProfit ?? 0) >= 0 ? "#16a34a" : "#dc2626"}">${f(data.finalProfit)}</span></div>
</div>
<div class="card">
  <div class="card-title" style="margin-bottom:12px">Charges</div>
  <div class="bilan-row bold"><span>Total déductibles</span><span>${f(data.chargesDeductible)}</span></div>
  ${(data.charges ?? []).filter((ch: any) => ch.type === "DEDUCTIBLE").map((ch: any) => `<div class="bilan-row indent"><span>${ch.name}</span><span>${f(ch.amount)}</span></div>`).join("")}
  <div class="bilan-row bold" style="margin-top:8px"><span>Total non déductibles</span><span>${f(data.chargesNonDeductible)}</span></div>
  ${(data.charges ?? []).filter((ch: any) => ch.type === "NON_DEDUCTIBLE").map((ch: any) => `<div class="bilan-row indent"><span>${ch.name}</span><span>${f(ch.amount)}</span></div>`).join("")}
</div>
<div class="card">
  <div class="card-title" style="margin-bottom:12px">Ventes</div>
  <div class="bilan-row bold"><span>Clients directs</span><span>${f(data.clientRevenue)}</span></div>
  <div class="bilan-row bold"><span>Partenaires</span><span>${f(data.partnerRevenue)}</span></div>
  ${(data.partnerSummary ?? []).map((p: any) => `<div class="bilan-row indent"><span>${p.name}</span><span>${f(p.revenue)}</span></div>`).join("")}
</div>
</div>
</div>

<div class="section">
<h2>Employés</h2>
<table><thead><tr><th>Nom</th><th>Grade</th><th>N° Compte</th><th>CA brut</th><th>Coût revient</th><th>CA net</th><th>% Salaire</th><th>Salaire</th><th>% Dividende</th><th>Dividende</th></tr></thead><tbody>
${(data.employeeStats ?? []).map((e: any) => `
<tr>
  <td><strong>${e.firstName} ${e.lastName}</strong></td>
  <td>${e.grade}</td>
  <td class="mono">${e.accountNumber ?? "—"}</td>
  <td>${f(e.revenue)}</td>
  <td style="color:#d97706">−${f(e.costRevenue)}</td>
  <td><strong>${f(e.netRevenue)}</strong></td>
  <td><span class="badge badge-gray">${e.salaryPercent}%</span></td>
  <td style="color:#16a34a"><strong>${f(e.salary)}</strong></td>
  <td><span class="badge badge-gray">${e.dividendPercent ?? 0}%</span></td>
  <td style="color:#6c63ff"><strong>${f(e.dividend ?? 0)}</strong></td>
</tr>`).join("")}
</tbody></table>
</div>

<div class="section">
<h2>Ventes par produit</h2>
<table><thead><tr><th>Produit</th><th>Catégorie</th><th>Qté</th><th>CA</th><th>Coût</th><th>Marge</th></tr></thead><tbody>
${(data.productStats ?? []).map((p: any) => `
<tr>
  <td><strong>${p.name}</strong></td>
  <td>${p.category}</td>
  <td>${p.qty}</td>
  <td>${f(p.revenue)}</td>
  <td style="color:#d97706">−${f(p.cost)}</td>
  <td style="color:${(p.revenue - p.cost) >= 0 ? "#16a34a" : "#dc2626"}"><strong>${f(p.revenue - p.cost)}</strong></td>
</tr>`).join("")}
</tbody></table>
</div>

<div class="section">
<h2>Partenaires</h2>
<table><thead><tr><th>Nom</th><th>Remise</th><th>Statut</th><th>CA semaine</th><th>Remise accordée</th></tr></thead><tbody>
${(data.partners ?? []).map((p: any) => {
  const stats = (data.partnerSummary ?? []).find((s: any) => s.name === p.name)
  return `<tr>
    <td><strong>${p.name}</strong></td>
    <td>${p.discount}%</td>
    <td><span class="badge ${p.isActive ? "badge-green" : "badge-gray"}">${p.isActive ? "Actif" : "Inactif"}</span></td>
    <td>${stats ? f(stats.revenue) : "—"}</td>
    <td style="color:#16a34a">${stats ? `−${f(stats.discount)}` : "—"}</td>
  </tr>`
}).join("")}
</tbody></table>
</div>

<div class="section">
<h2>Cartes de fidélité</h2>
<table><thead><tr><th>Client</th><th>Remise</th><th>Expire le</th><th>Statut</th></tr></thead><tbody>
${(data.loyaltyCards ?? []).map((lc: any) => {
  const exp = new Date(lc.expiresAt)
  const expired = exp < new Date()
  return `<tr>
    <td><strong>${lc.name}</strong></td>
    <td>${lc.discount}%</td>
    <td>${fd(lc.expiresAt)}</td>
    <td><span class="badge ${expired ? "badge-red" : lc.isActive ? "badge-green" : "badge-gray"}">${expired ? "EXPIRÉE" : lc.isActive ? "Active" : "Inactive"}</span></td>
  </tr>`
}).join("")}
</tbody></table>
</div>

<div class="section">
<h2>Fournisseurs</h2>
<table><thead><tr><th>Nom</th><th>Contact</th><th>Email</th><th>Téléphone</th></tr></thead><tbody>
${(data.suppliers ?? []).map((s: any) => `<tr><td><strong>${s.name}</strong></td><td>${s.contact ?? "—"}</td><td>${s.email ?? "—"}</td><td>${s.phone ?? "—"}</td></tr>`).join("")}
</tbody></table>

<h2>Factures</h2>
<table><thead><tr><th>Référence</th><th>Fournisseur</th><th>Montant</th><th>Échéance</th><th>Statut</th></tr></thead><tbody>
${(data.invoices ?? []).map((i: any) => `<tr>
  <td>${i.ref ?? "—"}</td>
  <td>${i.supplier}</td>
  <td><strong>${f(i.amount)}</strong></td>
  <td>${fd(i.dueDate)}</td>
  <td><span class="badge ${i.status === "PAID" ? "badge-green" : i.status === "OVERDUE" ? "badge-red" : "badge-amber"}">${i.status === "PAID" ? "Payée" : i.status === "OVERDUE" ? "En retard" : "En attente"}</span></td>
</tr>`).join("")}
</tbody></table>
</div>

<div class="section">
<h2>Liste des ventes — ${(data.allOrders ?? []).length} commandes</h2>
<table><thead><tr><th>Employé</th><th>Articles</th><th>Partenaire</th><th>Remise</th><th>Total</th><th>Date</th></tr></thead><tbody>
${(data.allOrders ?? []).slice(0, 100).map((o: any) => `<tr>
  <td>${o.employeeName}</td>
  <td style="font-size:11px;max-width:200px">${o.lines.map((l: any) => `${l.qty}× ${l.name}`).join(", ")}</td>
  <td>${o.partnerName ?? o.loyaltyName ?? "—"}</td>
  <td style="color:#16a34a">${o.discountAmount > 0 ? `−${f(o.discountAmount)}` : "—"}</td>
  <td><strong>${f(o.total)}</strong></td>
  <td style="font-size:11px">${new Date(o.createdAt).toLocaleString("fr-FR")}</td>
</tr>`).join("")}
</tbody></table>
</div>

<div class="footer">Bilan généré le ${new Date().toLocaleString("fr-FR")} · ${data.restaurantName} · Semaine ${week} ${year}</div>
</body>
</html>`
}
