import { BUSINESS_VOCAB, type CompanyType } from "./business-types"

export const CONFIGURABLE_PAGES = [
  { key: "dashboard",      label: "Dashboard",        defaultRoles: ["OWNER","MANAGER","EMPLOYEE"] },
  { key: "orders",         label: "Commandes",        defaultRoles: ["OWNER","MANAGER","EMPLOYEE"] },
  { key: "loyalty",        label: "Cartes fidélité",  defaultRoles: ["OWNER","MANAGER"] },
  { key: "employees",      label: "Employés (RH)",    defaultRoles: ["OWNER","MANAGER"] },
  { key: "sales",          label: "Liste des ventes", defaultRoles: ["OWNER","MANAGER"] },
  { key: "sales/products", label: "Ventes produits",  defaultRoles: ["OWNER","MANAGER"] },
  { key: "report",         label: "Bilan",            defaultRoles: ["OWNER","MANAGER"] },
  { key: "menu",           label: "Carte (menu)",     defaultRoles: ["OWNER","MANAGER"] },
  { key: "stock",          label: "Stock",            defaultRoles: ["OWNER"] },
  { key: "partners",       label: "Partenaires",      defaultRoles: ["OWNER","MANAGER"] },
  { key: "suppliers",      label: "Fournisseurs",     defaultRoles: ["OWNER","MANAGER"] },
  { key: "invoices",       label: "Factures",         defaultRoles: ["OWNER","MANAGER"] },
  { key: "charges",        label: "Charges",          defaultRoles: ["OWNER","MANAGER"] },
] as const

export function getConfigurablePages(companyType: CompanyType = "RESTO_BAR") {
  const vocab = BUSINESS_VOCAB[companyType]
  return CONFIGURABLE_PAGES.map(p => {
    if (p.key === "menu") return { ...p, label: `${vocab.menuNavLabel} (menu)` }
    if (p.key === "stock") return { ...p, label: vocab.stockNavLabel }
    return p
  })
}
