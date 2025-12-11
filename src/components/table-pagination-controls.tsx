"use client"

import * as React from "react"

type Props = {
  total: number
  page: number
  pageSize: number
  label?: string
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  pageSizeOptions?: number[]
}

const defaultOptions = [5, 10, 20, 50]

export function TablePaginationControls({
  total,
  page,
  pageSize,
  label = "items",
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = defaultOptions,
}: Props) {
  const safeTotal = Math.max(0, total)
  const safePage = safeTotal === 0 ? 0 : Math.max(1, page)
  const safePageSize = Math.max(1, pageSize)
  const totalPages =
    safeTotal === 0 ? 1 : Math.max(1, Math.ceil(safeTotal / safePageSize))

  const startIndex =
    safeTotal === 0 ? 0 : (safePage - 1) * safePageSize + 1
  const endIndex =
    safeTotal === 0 ? 0 : Math.min(safePage * safePageSize, safeTotal)

  const goTo = (next: number) => {
    const clamped = Math.min(Math.max(next, 1), totalPages)
    onPageChange(clamped)
  }

  const previousDisabled = safePage <= 1
  const nextDisabled = safePage >= totalPages

  return (
    <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="text-muted-foreground">
        Menampilkan{" "}
        {safeTotal === 0 ? "0" : `${startIndex}-${endIndex}`} dari{" "}
        {safeTotal} {label}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <label className="flex items-center gap-2 text-sm">
          Rows per page
          <select
            className="h-8 rounded border bg-background px-2"
            value={safePageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded border px-3 py-1 text-xs disabled:opacity-50"
            onClick={() => goTo(safePage - 1)}
            disabled={previousDisabled}
          >
            Previous
          </button>
          <span className="text-xs text-muted-foreground">
            Page {safePage} of {totalPages}
          </span>
          <button
            type="button"
            className="rounded border px-3 py-1 text-xs disabled:opacity-50"
            onClick={() => goTo(safePage + 1)}
            disabled={nextDisabled}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
