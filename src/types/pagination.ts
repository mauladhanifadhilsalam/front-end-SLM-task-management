export type PaginationMeta = {
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export const defaultPaginationMeta: PaginationMeta = {
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
}

export const normalizePagination = (
  payload: unknown,
  fallback: PaginationMeta = defaultPaginationMeta,
): PaginationMeta => {
  if (!payload || typeof payload !== "object") {
    return { ...fallback }
  }

  const source = payload as Record<string, unknown>

  const safeNumber = (key: string, defaultValue: number) => {
    const value = Number(source[key])
    return Number.isFinite(value) && value > 0 ? value : defaultValue
  }

  const total = safeNumber("total", fallback.total)
  const pageSize = safeNumber("pageSize", fallback.pageSize)
  const totalPages =
    safeNumber("totalPages", fallback.totalPages) || fallback.totalPages || 1
  const pageRaw = Number(source.page)
  const page =
    Number.isFinite(pageRaw) && pageRaw >= 1
      ? Math.min(pageRaw, totalPages)
      : fallback.page

  return {
    total,
    page,
    pageSize,
    totalPages,
    hasNextPage: Boolean(source.hasNextPage),
    hasPrevPage: Boolean(source.hasPrevPage),
  }
}
