"use client"

import { formatCurrency } from "@/lib/utils"
import { TrendingUp, ShoppingCart, Banknote, Star } from "lucide-react"
import Link from "next/link"

interface Props {
  employee: {
    firstName: string
    lastName: string
    grade: { name: string; salaryPercent: number }
  }
  weekRevenue: number
  monthRevenue: number
  weekSalary: number
  monthSalary: number
  currency: string
  weekOrderCount: number
  monthOrderCount: number
}

export default function EmployeeDashboard({
  employee,
  weekRevenue,
  monthRevenue,
  weekSalary,
  monthSalary,
  currency,
  weekOrderCount,
  monthOrderCount,
}: Props) {
  const fmt = (n: number) => formatCurrency(n, currency)

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="page-title">Bonjour, {employee.firstName}</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="badge badge-info">{employee.grade.name}</span>
          <span className="text-sm text-[var(--text-muted)]">
            {employee.grade.salaryPercent}% de commission sur vos ventes
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">CA cette semaine</span>
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-brand-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--text)] mt-2">{fmt(weekRevenue)}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{weekOrderCount} commandes</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">Salaire estimé semaine</span>
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Banknote className="w-4 h-4 text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">{fmt(weekSalary)}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{employee.grade.salaryPercent}% du CA</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">CA ce mois</span>
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-brand-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--text)] mt-2">{fmt(monthRevenue)}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{monthOrderCount} commandes</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">Salaire estimé mois</span>
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Star className="w-4 h-4 text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">{fmt(monthSalary)}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{employee.grade.salaryPercent}% du CA</p>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="section-title mb-4">Actions rapides</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/orders/new"
            className="btn-primary text-center py-3 rounded-xl text-sm font-medium"
          >
            Nouvelle commande
          </Link>
          <Link
            href="/orders"
            className="btn-secondary text-center py-3 rounded-xl text-sm font-medium"
          >
            Mes commandes
          </Link>
        </div>
      </div>
    </div>
  )
}
