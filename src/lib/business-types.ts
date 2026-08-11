export const COMPANY_TYPES = ["RESTO_BAR", "GARAGE", "CONCESSION"] as const
export type CompanyType = typeof COMPANY_TYPES[number]

export const COMPANY_TYPE_LABELS: Record<CompanyType, string> = {
  RESTO_BAR: "Restaurant / Bar / Boîte de nuit",
  GARAGE: "Garage automobile",
  CONCESSION: "Concession automobile",
}

interface DefaultGrade { name: string; salaryPercent: number }

interface BusinessVocab {
  menuNavLabel: string
  stockNavLabel: string
  menuCategoryPlaceholder: string
  recipeLabel: string | null
  ingredientNoun: string
  searchPlaceholder: string
  searchArticleLabel: string
  defaultGrades: DefaultGrade[]
  hasLiveOrderTickets: boolean
}

export const BUSINESS_VOCAB: Record<CompanyType, BusinessVocab> = {
  RESTO_BAR: {
    menuNavLabel: "Carte",
    stockNavLabel: "Stock",
    menuCategoryPlaceholder: "Plats...",
    recipeLabel: "Recette (ingrédients)",
    ingredientNoun: "ingrédient",
    searchPlaceholder: "Rechercher employé, article, facture, commande…",
    searchArticleLabel: "Articles",
    defaultGrades: [
      { name: "Patron(ne)", salaryPercent: 70 },
      { name: "Manager", salaryPercent: 65 },
      { name: "Employé CDI", salaryPercent: 65 },
      { name: "Employé CDD", salaryPercent: 50 },
    ],
    hasLiveOrderTickets: true,
  },
  GARAGE: {
    menuNavLabel: "Services & Pièces",
    stockNavLabel: "Pièces détachées",
    menuCategoryPlaceholder: "Vidange, Freinage, Diagnostic...",
    recipeLabel: "Pièces utilisées",
    ingredientNoun: "pièce",
    searchPlaceholder: "Rechercher employé, service, facture, intervention…",
    searchArticleLabel: "Services & Pièces",
    defaultGrades: [
      { name: "Patron(ne)", salaryPercent: 70 },
      { name: "Chef d'atelier", salaryPercent: 65 },
      { name: "Mécanicien", salaryPercent: 65 },
      { name: "Apprenti", salaryPercent: 50 },
    ],
    hasLiveOrderTickets: false,
  },
  CONCESSION: {
    menuNavLabel: "Catalogue véhicules",
    stockNavLabel: "Stock",
    menuCategoryPlaceholder: "Citadine, SUV, Utilitaire...",
    recipeLabel: null,
    ingredientNoun: "pièce",
    searchPlaceholder: "Rechercher employé, véhicule, facture, vente…",
    searchArticleLabel: "Véhicules",
    defaultGrades: [
      { name: "Patron(ne)", salaryPercent: 70 },
      { name: "Directeur commercial", salaryPercent: 65 },
      { name: "Vendeur", salaryPercent: 65 },
      { name: "Stagiaire", salaryPercent: 50 },
    ],
    hasLiveOrderTickets: false,
  },
}

export function isCompanyType(value: string): value is CompanyType {
  return (COMPANY_TYPES as readonly string[]).includes(value)
}
