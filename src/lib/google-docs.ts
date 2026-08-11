const DOCS_PATTERN = /^https:\/\/docs\.google\.com\/(document|spreadsheets|presentation)\/d\/([a-zA-Z0-9_-]+)/
const DRIVE_PATTERN = /^https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/

export function isValidGoogleLink(raw: string): boolean {
  return DOCS_PATTERN.test(raw) || DRIVE_PATTERN.test(raw)
}

export function toGooglePreviewUrl(raw: string): string | null {
  const docsMatch = raw.match(DOCS_PATTERN)
  if (docsMatch) return `https://docs.google.com/${docsMatch[1]}/d/${docsMatch[2]}/preview`
  const driveMatch = raw.match(DRIVE_PATTERN)
  if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/preview`
  return null
}
