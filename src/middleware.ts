import { auth } from "@/lib/auth"
import { jwtVerify } from "jose"
import { NextResponse } from "next/server"
import { checkRateLimit } from "@/lib/rate-limit"

if (!process.env.AUTH_SECRET) throw new Error("AUTH_SECRET manquant")
const ADMIN_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET)

export default auth(async (req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session
  const method = req.method ?? "GET"

  const isAdmin = nextUrl.pathname.startsWith("/admin")
  const isAuthPage = nextUrl.pathname.startsWith("/login")
  const isApiAuth = nextUrl.pathname.startsWith("/api/auth")
  const isApiAdmin = nextUrl.pathname.startsWith("/api/admin")

  // CSRF: reject mutating requests from foreign origins
  if (["POST", "PATCH", "DELETE", "PUT"].includes(method) && !isApiAuth) {
    const origin = req.headers.get("origin")
    const host = req.headers.get("host") ?? ""
    if (origin && !origin.includes(host)) {
      return new NextResponse(JSON.stringify({ error: "Origine non autorisée" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      })
    }
  }

  // Rate limit the credentials login endpoint
  if (isApiAuth && nextUrl.pathname === "/api/auth/callback/credentials") {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? req.headers.get("x-real-ip") ?? "unknown"
    if (!checkRateLimit(`auth-login:${ip}`, 5, 60_000)) {
      return new NextResponse(JSON.stringify({ error: "Trop de tentatives, réessayez dans une minute" }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      })
    }
  }

  // Admin API routes use their own JWT — verify it here (defense in depth)
  if (isApiAdmin) {
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

  const isPublic = isAuthPage || isApiAuth || isAdmin

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
  runtime: "nodejs",
}
