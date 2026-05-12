import type { Metadata } from "next"
import "../globals.css"
import { ThemeProvider } from "@/components/layout/ThemeProvider"

export const metadata: Metadata = { title: "Admin — RestoManager" }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  )
}
