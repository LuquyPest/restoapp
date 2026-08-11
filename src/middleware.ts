import { auth } from "@/lib/auth"
import { jwtVerify } from "jose"
import { NextResponse } from "next/server"
import { checkRateLimit } from "@/lib/rate-limit"
import { isAuthorityRole } from "@/lib/authority"

if (!process.env.AUTH_SECRET) throw new Error("AUTH_SECRET manquant")
const ADMIN_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET)

export default auth(async (req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session
  const method = req.method ?? "GET"

  const isAdminPage = nextUrl.pathname.startsWith("/admin")
  const isAdminLoginPage = nextUrl.pathname === "/admin/login"
  const isAuthPage = nextUrl.pathname.startsWith("/login")
  const isApiAuth = nextUrl.pathname.startsWith("/api/auth")
  const isApiAdmin = nextUrl.pathname.startsWith("/api/admin")
  const isAuthorityPage = nextUrl.pathname.startsWith("/authority")
  const userRole = session?.user?.role as string | undefined

  // CSRF : rejeter les mutations sans Origin ou avec une origine non autorisée
  if (["POST", "PATCH", "DELETE", "PUT"].includes(method) && !isApiAuth) {
    const origin = req.headers.get("origin")
    const allowedOrigin = process.env.NEXTAUTH_URL?.replace(/\/$/, "")
    if (!origin || !allowedOrigin || origin !== allowedOrigin) {
      return new NextResponse(JSON.stringify({ error: "Origine non autorisée" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      })
    }
  }

  // Rate limit sur l'endpoint de connexion
  if (isApiAuth && nextUrl.pathname === "/api/auth/callback/credentials") {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? req.headers.get("x-real-ip") ?? "unknown"
    if (!await checkRateLimit(`auth-login:${ip}`, 5, 60_000)) {
      return new NextResponse(JSON.stringify({ error: "Trop de tentatives, réessayez dans une minute" }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      })
    }
  }

  // Routes API admin : vérification JWT (défense en profondeur)
  // Exclure /api/admin/login sinon le middleware bloque la connexion elle-même
  if (isApiAdmin && nextUrl.pathname !== "/api/admin/login") {
    const token = req.cookies.get("admin_token")?.value
    if (!token) {
      return new NextResponse(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }
    try {
      const { payload } = await jwtVerify(token, ADMIN_SECRET)
      if (payload.role !== "superadmin") throw new Error()
    } catch {
      return new NextResponse(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }
    return NextResponse.next()
  }

  const isAdminLogin = nextUrl.pathname === "/api/admin/login"
  const isPublic = isAuthPage || isApiAuth || isAdminLoginPage || isAdminLogin

  if (!isLoggedIn && !isPublic && !isAdminPage) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  // Bloquer les pages /admin/* (hors /admin/login) sans cookie admin valide
  if (isAdminPage && !isAdminLoginPage) {
    const token = req.cookies.get("admin_token")?.value
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", nextUrl))
    }
    try {
      const { payload } = await jwtVerify(token, ADMIN_SECRET)
      if (payload.role !== "superadmin") throw new Error()
    } catch {
      return NextResponse.redirect(new URL("/admin/login", nextUrl))
    }
  }

  if (isLoggedIn && isAuthPage) {
    const dest = userRole && isAuthorityRole(userRole) ? "/authority" : "/dashboard"
    return NextResponse.redirect(new URL(dest, nextUrl))
  }

  // Espace autorité (IRS / Mairies) : réservé aux rôles dédiés
  if (isAuthorityPage) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", nextUrl))
    if (!userRole || !isAuthorityRole(userRole)) return NextResponse.redirect(new URL("/login", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
  runtime: "nodejs",
}
