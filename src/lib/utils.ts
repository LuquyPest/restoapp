import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getISOWeek(d: Date): number {
  const date = new Date(d); date.setHours(0,0,0,0)
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7)
  const week1 = new Date(date.getFullYear(), 0, 4)
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
}

export function getWeekBounds(week: number, year: number) {
  const jan4 = new Date(year, 0, 4)
  const startOfWeek1 = new Date(jan4)
  startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7))
  const start = new Date(startOfWeek1)
  start.setDate(startOfWeek1.getDate() + (week - 1) * 7)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

export interface TaxBracket { min: number; max?: number; rate: number }

export interface TaxConfig { taxType?: string | null; taxBrackets?: string | null }

function applyBrackets(profit: number, brackets: TaxBracket[]): number {
  let tax = 0
  for (const b of brackets) {
    if (profit <= b.min) break
    const upper = b.max !== undefined ? Math.min(profit, b.max) : profit
    tax += (upper - b.min) * (b.rate / 100)
  }
  return tax
}

export function calculateTax(profit: number, config?: TaxConfig | null): number {
  const type = config?.taxType ?? "TYPE3"

  if (type === "TYPE1") {
    // $1–$1 000 000 : 35% · au-delà : 45%
    return applyBrackets(profit, [
      { min: 0, max: 1_000_000, rate: 35 },
      { min: 1_000_000, rate: 45 },
    ])
  }
  if (type === "TYPE2") {
    // $0–$100 000 : 0% · $100 001–$1 000 000 : 30% · au-delà : 40%
    return applyBrackets(profit, [
      { min: 0, max: 100_000, rate: 0 },
      { min: 100_000, max: 1_000_000, rate: 30 },
      { min: 1_000_000, rate: 40 },
    ])
  }
  if (type === "CUSTOM" && config?.taxBrackets) {
    try {
      const brackets: TaxBracket[] = JSON.parse(config.taxBrackets)
      return applyBrackets(profit, brackets)
    } catch { /* fall through to TYPE3 */ }
  }
  // TYPE3 (default)
  return applyBrackets(profit, [
    { min: 0, max: 50_000, rate: 0 },
    { min: 50_000, max: 100_000, rate: 20 },
    { min: 100_000, max: 500_000, rate: 30 },
    { min: 500_000, rate: 40 },
  ])
}

export function formatCurrency(amount: number, currency = "$") {
  return `${currency}${amount.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export function formatDateTime(date: Date | string) {
  return new Date(date).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export function getISOWeeksInYear(year: number): number {
  return getISOWeek(new Date(year, 11, 28))
}

export function getPrevWeeks(week: number, year: number, count: number): { week: number; year: number }[] {
  const result: { week: number; year: number }[] = []
  let w = week, y = year
  for (let i = 0; i < count; i++) {
    result.unshift({ week: w, year: y })
    w--
    if (w < 1) { y--; w = getISOWeeksInYear(y) }
  }
  return result
}

export function getWeekRange() {
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

export function getMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  return { start, end }
}
