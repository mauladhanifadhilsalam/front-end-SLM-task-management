"use client"


import { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CrossIcon, SlidersHorizontal } from "lucide-react"

interface FilterOption {
  label: string
  value: string
}

interface ToolbarFilter {
  columnId: string
  title: string
  options: FilterOption[]
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchPlaceholder?: string
  searchKey?: string
  filters?: ToolbarFilter[]
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = "Search...",
  searchKey,
  filters = [],
}: DataTableToolbarProps<TData>) {
  const column = searchKey ? table.getColumn(searchKey) : null

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2">
        {column && (
          <Input
            placeholder={searchPlaceholder}
            value={(column.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              column.setFilterValue(event.target.value)
            }
            className="h-8 w-[200px] lg:w-[250px]"
          />
        )}

        {/* Filter Groups */}
        {filters.map((f) => (
          <DropdownMenu key={f.columnId}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                {f.title} <SlidersHorizontal className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40">
              <DropdownMenuLabel>{f.title}</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {f.options.map((opt) => {
                const col = table.getColumn(f.columnId)
                const current = (col?.getFilterValue() as string[]) ?? []

                return (
                  <DropdownMenuCheckboxItem
                    key={opt.value}
                    checked={current.includes(opt.value)}
                    onCheckedChange={(checked) => {
                      const next = checked
                        ? [...current, opt.value]
                        : current.filter((v) => v !== opt.value)

                      col?.setFilterValue(next.length ? next : undefined)
                    }}
                  >
                    {opt.label}
                  </DropdownMenuCheckboxItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>

      {/* Reset Filters Button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8"
        onClick={() => table.resetColumnFilters()}
      >
        <CrossIcon className="mr-2 h-4 w-4" /> Reset
      </Button>
    </div>
  )
}
