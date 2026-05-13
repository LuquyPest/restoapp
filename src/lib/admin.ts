import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

if (!process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET est manquant — définissez-le dans .env")
}
const ADMIN_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET)

export async function signAdminToken() {
  return new SignJWT({ role: "superadmin" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .sign(ADMIN_SECRET)
}

export async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, ADMIN_SECRET)
    return payload.role === "superadmin"
  } catch {
    return false
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_token")?.value
  if (!token) return false
  return verifyAdminToken(token)
}

export function slugifyRestaurantName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20)
}
