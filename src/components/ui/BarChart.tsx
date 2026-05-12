"use client"

interface BarData { label: string; value: number }

interface Props {
  data: BarData[]
  currency?: string
  height?: number
  color?: string
}

export default function BarChart({ data, currency = "$", height = 160, color = "hsl(263 70% 65%)" }: Props) {
  const max = Math.max(...data.map(d => d.value), 1)

  const fmt = (n: number) => {
    if (n >= 1000) return `${currency}${(n / 1000).toFixed(1)}k`
    return `${currency}${n.toFixed(0)}`
  }

  return (
    <div className="w-full" style={{ height }}>
      <div className="flex items-end justify-between gap-1.5 h-full">
        {data.map((d, i) => {
          const pct = max > 0 ? (d.value / max) * 100 : 0
          const barHeight = `${Math.max(pct, d.value > 0 ? 4 : 0)}%`
          return (
            <div key={i} className="flex flex-col items-center gap-1 flex-1 h-full justify-end group">
              <div className="relative flex-1 flex items-end w-full">
                {d.value > 0 && (
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    <div className="bg-foreground text-background text-[10px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap">
                      {fmt(d.value)}
                    </div>
                  </div>
                )}
                <div
                  className="w-full rounded-t-md transition-all duration-500"
                  style={{
                    height: barHeight,
                    background: d.value > 0 ? color : "hsl(var(--muted))",
                    opacity: d.value > 0 ? 1 : 0.3,
                    minHeight: 2,
                  }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground font-medium shrink-0">{d.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
