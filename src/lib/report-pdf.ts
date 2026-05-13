import PDFDocument from "pdfkit"
import type { WebhookPayload } from "./webhook-payload"

function fmtNum(n: number, currency: string) {
  return `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
}

export function generateReportPdf(data: WebhookPayload, test = false): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" })
    const chunks: Buffer[] = []
    doc.on("data", (c: Buffer) => chunks.push(c))
    doc.on("end", () => resolve(Buffer.concat(chunks)))
    doc.on("error", reject)

    const W = 495 // usable width
    const PRIMARY = "#6366f1"
    const LIGHT = "#f1f5f9"
    const MUTED = "#64748b"
    const BLACK = "#0f172a"

    // ── Header ──────────────────────────────────────────────────────────
    doc.rect(50, 50, W, 70).fill(PRIMARY)
    doc.fillColor("#fff").font("Helvetica-Bold").fontSize(20)
      .text(data.restaurant, 70, 65, { width: W - 40 })
    doc.font("Helvetica").fontSize(11).fillColor("#e0e7ff")
      .text(
        `Bilan semaine S${String(data.weekNumber).padStart(2, "0")} ${data.year}  ·  ${data.weekStart} → ${data.weekEnd}${test ? "  [TEST]" : ""}`,
        70, 93, { width: W - 40 }
      )

    let y = 140

    // ── Summary boxes ────────────────────────────────────────────────────
    const boxes = [
      { label: "Chiffre d'affaires", value: fmtNum(data.revenue, data.currency) },
      { label: "Commandes", value: String(data.orderCount) },
      { label: "Total salaires", value: fmtNum(data.totalSalaries, data.currency) },
      { label: "Bénéfice brut", value: fmtNum(data.grossProfit ?? (data.revenue - data.totalSalaries - (data.chargesDeductible ?? 0)), data.currency) },
    ]
    const bw = Math.floor((W - 15) / 4)
    boxes.forEach((b, i) => {
      const bx = 50 + i * (bw + 5)
      doc.rect(bx, y, bw, 58).fill(LIGHT)
      doc.fillColor(MUTED).font("Helvetica").fontSize(8).text(b.label.toUpperCase(), bx + 8, y + 8, { width: bw - 16 })
      doc.fillColor(PRIMARY).font("Helvetica-Bold").fontSize(13).text(b.value, bx + 8, y + 24, { width: bw - 16 })
    })

    y += 75

    // ── Bilan financier ──────────────────────────────────────────────────
    if (data.chargesDeductible !== undefined) {
      doc.fillColor(BLACK).font("Helvetica-Bold").fontSize(12).text("Bilan financier", 50, y)
      y += 18
      doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(50, y).lineTo(50 + W, y).stroke()
      y += 8

      const rows = [
        ["Chiffre d'affaires", fmtNum(data.revenue, data.currency)],
        ["Salaires", `− ${fmtNum(data.totalSalaries, data.currency)}`],
        ["Charges déductibles", `− ${fmtNum(data.chargesDeductible, data.currency)}`],
        ["Bénéfice brut", fmtNum(data.grossProfit ?? 0, data.currency)],
        ["Impôts", `− ${fmtNum(data.taxes ?? 0, data.currency)}`],
        ["Bénéfice net", fmtNum(data.netProfit ?? 0, data.currency)],
        ["Charges non déductibles", `− ${fmtNum(data.chargesNonDeductible ?? 0, data.currency)}`],
        ["Trésorerie finale", fmtNum(data.treasury ?? 0, data.currency)],
      ]

      rows.forEach(([label, value], idx) => {
        const isTotal = label === "Bénéfice net" || label === "Trésorerie finale"
        const rowY = y + idx * 20
        if (isTotal) doc.rect(50, rowY - 2, W, 20).fill("#f0f9ff")
        doc.fillColor(isTotal ? PRIMARY : BLACK).font(isTotal ? "Helvetica-Bold" : "Helvetica").fontSize(10)
          .text(label, 60, rowY, { width: W - 120, continued: false })
        doc.fillColor(isTotal ? PRIMARY : BLACK).font(isTotal ? "Helvetica-Bold" : "Helvetica").fontSize(10)
          .text(value, 50, rowY, { width: W, align: "right" })
      })

      y += rows.length * 20 + 20
    }

    // ── Employés ─────────────────────────────────────────────────────────
    if (data.employees.length > 0) {
      doc.fillColor(BLACK).font("Helvetica-Bold").fontSize(12).text("Employés actifs cette semaine", 50, y)
      y += 18
      doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(50, y).lineTo(50 + W, y).stroke()
      y += 8

      // Table header
      doc.rect(50, y, W, 18).fill(PRIMARY)
      const cols = [
        { label: "Employé", x: 58, w: 150 },
        { label: "Grade", x: 215, w: 90 },
        { label: "Commandes", x: 310, w: 70 },
        { label: "CA", x: 383, w: 80 },
        { label: "Salaire", x: 466, w: 75 },
      ]
      doc.fillColor("#fff").font("Helvetica-Bold").fontSize(9)
      cols.forEach(c => doc.text(c.label, c.x, y + 5, { width: c.w }))
      y += 18

      data.employees.forEach((emp, idx) => {
        if (idx % 2 === 0) doc.rect(50, y, W, 18).fill("#f8fafc")
        doc.fillColor(BLACK).font("Helvetica").fontSize(9)
        doc.text(`${emp.name}`, cols[0].x, y + 5, { width: cols[0].w })
        doc.text(emp.grade, cols[1].x, y + 5, { width: cols[1].w })
        doc.text(String(emp.orderCount), cols[2].x, y + 5, { width: cols[2].w })
        doc.text(fmtNum(emp.revenue, data.currency), cols[3].x, y + 5, { width: cols[3].w })
        doc.text(fmtNum(emp.salary, data.currency), cols[4].x, y + 5, { width: cols[4].w })
        y += 18
      })
    }

    // ── Footer ────────────────────────────────────────────────────────────
    doc.fillColor(MUTED).font("Helvetica").fontSize(8)
      .text(`Généré par RestoCompta · ${new Date().toLocaleString("fr-FR")}`, 50, 780, { width: W, align: "center" })

    doc.end()
  })
}
