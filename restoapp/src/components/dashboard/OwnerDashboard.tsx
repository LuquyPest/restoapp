"use client"

import { formatCurrency, formatDateTime } from "@/lib/utils"
import {
  TrendingUp,
  Users,
  ShoppingCart,
  FileText,
  Banknote,
  AlertCircle,
  ArrowUpRight,
  CheckCircle,
  Clock,
} from "lucide-react"
import Link from "next/link"

interface RecentOrder {
  id: string
  total: number
  status: string
  createdAt: Date
  employee: { firstName: string; lastName: string } | null
  lines: { quantity: number; menuItem: { name: string } }[]
}

interface Props {
  weekRevenue: number
  monthRevenue: number
  totalCharges: number
  benefit: number
  totalEmployees: number
  pendingInvoices: number
  weekOrderCount: number
  monthOrderCount: number
  recentOrders: RecentOrder[]
  currency: string
}

export default function OwnerDashboard({
  weekRevenue,
  monthRevenue,
  totalCharges,
  benefit,
  totalEmployees,
  pendingInvoices,
  weekOrderCount,
  monthOrderCount,
  recentOrders,
  currency,
}: Props) {
  const fmt = (n: number) => formatCurrency(n, currency)

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="page-title">Tableau de bord</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">Vue d'ensemble de votre établissement</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">CA ce mois</span>
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-brand-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--text)] mt-2">{fmt(monthRevenue)}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Cette semaine : {fmt(weekRevenue)}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">Charges</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Banknote className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--text)] mt-2">{fmt(totalCharges)}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Payes + taxes ce mois</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">Bénéfice</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${benefit >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
              <TrendingUp className={`w-4 h-4 ${benefit >= 0 ? "text-green-500" : "text-red-500"}`} />
            </div>
          </div>
          <p className={`text-2xl font-bold mt-2 ${benefit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {fmt(benefit)}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">CA − charges ce mois</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">Commandes</span>
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-brand-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--text)] mt-2">{monthOrderCount}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Cette semaine : {weekOrderCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/employees" className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow group">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-brand-500" />
          </div>
          <div className="flex-1">
            <p className="text-xl font-bold text-[var(--text)]">{totalEmployees}</p>
            <p className="text-sm text-[var(--text-muted)]">Employés actifs</p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[var(--text-subtle)] group-hover:text-[var(--text-muted)] transition-colors" />
        </Link>

        <Link href="/invoices" className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow group">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pendingInvoices > 0 ? "bg-amber-500/10" : "bg-green-500/10"}`}>
            <FileText className={`w-5 h-5 ${pendingInvoices > 0 ? "text-amber-500" : "text-green-500"}`} />
          </div>
          <div className="flex-1">
            <p className="text-xl font-bold text-[var(--text)]">{pendingInvoices}</p>
            <p className="text-sm text-[var(--text-muted)]">Factures en attente</p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[var(--text-subtle)] group-hover:text-[var(--text-muted)] transition-colors" />
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="section-title">Dernières commandes</h2>
          <Link href="/orders" className="text-xs text-brand-500 hover:text-brand-600 font-medium transition-colors">
            Voir tout →
          </Link>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {recentOrders.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-[var(--text-muted)]">
              Aucune commande pour le moment
            </div>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-[var(--bg)] transition-colors">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  order.status === "CONFIRMED" ? "bg-green-500/10" : order.status === "CANCELLED" ? "bg-red-500/10" : "bg-amber-500/10"
                }`}>
                  {order.status === "CONFIRMED" ? (
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  ) : order.status === "CANCELLED" ? (
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text)] truncate">
                    {order.employee ? `${order.employee.firstName} ${order.employee.lastName}` : "—"}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    {order.lines.map((l) => `${l.quantity}× ${l.menuItem.name}`).join(", ")}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-[var(--text)]">{fmt(order.total)}</p>
                  <p className="text-xs text-[var(--text-subtle)]">{formatDateTime(order.createdAt)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
