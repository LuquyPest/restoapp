export const AUTHORITY_ROLES = ["IRS", "MAIRIE_NORD", "MAIRIE_SUD"] as const
export type AuthorityRole = typeof AUTHORITY_ROLES[number]

export function isAuthorityRole(role: string): role is AuthorityRole {
  return (AUTHORITY_ROLES as readonly string[]).includes(role)
}

export const AUTHORITY_ROLE_LABELS: Record<AuthorityRole, string> = {
  IRS: "IRS",
  MAIRIE_NORD: "Mairie Nord",
  MAIRIE_SUD: "Mairie Sud",
}

// Zone que ce rôle est autorisé à consulter — null = toutes (IRS)
export function authorityZone(role: AuthorityRole): "NORD" | "SUD" | null {
  if (role === "MAIRIE_NORD") return "NORD"
  if (role === "MAIRIE_SUD") return "SUD"
  return null
}
