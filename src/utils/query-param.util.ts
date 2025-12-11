export type QueryParams = Record<string, unknown>

export const cleanQueryParams = <T extends QueryParams>(
  params?: T,
): Partial<T> | undefined => {
  if (!params) return undefined

  const entries = Object.entries(params).filter(([, value]) => {
    if (value === undefined || value === null) return false
    if (typeof value === "string" && value.trim() === "") return false
    return true
  })

  return entries.length > 0 ? (Object.fromEntries(entries) as Partial<T>) : undefined
}
