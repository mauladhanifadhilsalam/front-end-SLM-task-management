"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

type Props = {
  name: string
  categories: string[]
  notes: string
  loading: boolean
  onNameChange: (value: string) => void
  onAddCategory: (value: string) => void
  onRemoveCategory: (index: number) => void
  onNotesChange: (value: string) => void
}

export const ProjectBasicSection: React.FC<Props> = ({
  name,
  categories,
  notes,
  loading,
  onNameChange,
  onAddCategory,
  onRemoveCategory,
  onNotesChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nama Project</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Masukkan nama project"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Kategori</Label>
        <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[42px]">
          {categories.map((category, index) => (
            <div
              key={index}
              className="flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm"
            >
              <span>{category}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0"
                disabled={loading}
                onClick={() => onRemoveCategory(index)}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </Button>
            </div>
          ))}
          <Input
            id="category"
            type="text"
            className="flex-1 border-0 shadow-none focus-visible:ring-0 min-w-[200px] p-0"
            placeholder={
              categories.length === 0
                ? "Ketik kategori dan tekan Enter..."
                : "Tambah kategori..."
            }
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                const value = e.currentTarget.value.trim()
                if (value) {
                  onAddCategory(value)
                  e.currentTarget.value = ""
                }
              }
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Catatan tambahan"
          disabled={loading}
        />
      </div>
    </div>
  )
}
