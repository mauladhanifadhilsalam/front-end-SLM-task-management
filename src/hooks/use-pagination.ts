"use client"

import * as React from "react"

export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 10

export function usePagination(initialPage = DEFAULT_PAGE, initialPageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = React.useState(initialPage)
  const [pageSize, setPageSize] = React.useState(initialPageSize)

  const handlePageChange = React.useCallback((nextPage: number, totalPages?: number) => {
    const upperBound = totalPages && totalPages > 0 ? totalPages : Number.POSITIVE_INFINITY
    setPage((current) => {
      if (!Number.isFinite(nextPage)) return current
      const clamped = Math.max(1, Math.min(nextPage, upperBound))
      return clamped
    })
  }, [])

  const handlePageSizeChange = React.useCallback((nextPageSize: number) => {
    if (!Number.isFinite(nextPageSize) || nextPageSize <= 0) return
    setPageSize(nextPageSize)
    setPage(1)
  }, [])

  const resetPagination = React.useCallback(() => {
    setPage(DEFAULT_PAGE)
    setPageSize(DEFAULT_PAGE_SIZE)
  }, [])

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
    resetPagination,
  }
}
