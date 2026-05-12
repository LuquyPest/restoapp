import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session

  const isAdmin = nextUrl.pathname.startsWith("/admin")
  const isAuthPage = nextUrl.pathname.startsWith("/login")
  const isApiAuth = nextUrl.pathname.startsWith("/api/auth")
  const isApiAdmin = nextUrl.pathname.startsWith("/api/admin")
  const isPublic = isAuthPage || isApiAuth || isApiAdmin || isAdmin

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
