import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

function getAdminSecret() {
  if (!process.env.AUTH_SECRET) {
    throw new Error("AUTH_SECRET est manquant — définissez-le dans .env")
  }
  return new TextEncoder().encode(process.env.AUTH_SECRET)
}

export async function signAdminToken() {
  return new SignJWT({ role: "superadmin" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .sign(getAdminSecret())
}

export async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getAdminSecret())
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

export function slugifyCompanyName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20)
}
