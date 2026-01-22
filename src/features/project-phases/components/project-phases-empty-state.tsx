"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type SearchEmptyStateProps = {
  query: string
  onClear: () => void
  onAddPhase: () => void
}

export const ProjectPhasesSearchEmptyState: React.FC<SearchEmptyStateProps> = ({
  query,
  onClear,
  onAddPhase,
}) => {
  return (
    <Card className="bg-background border-t">
      <div className="flex items-center gap-3 p-4 border-b">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-medium">Hasil Pencarian</h3>
          <p className="text-sm text-muted-foreground">
            Tidak ditemukan hasil untuk{" "}
            <span className="font-medium text-foreground">"{query}"</span>.
          </p>
        </div>
      </div>
      <div className="p-6">
        <p className="text-sm text-muted-foreground">
          Periksa ejaan kata kunci atau coba gunakan kata kunci yang lebih
          umum.
        </p>
        <div className="mt-4 flex gap-3">
          <Button variant="outline" onClick={onClear}>
            Bersihkan Pencarian
          </Button>
          <Button onClick={onAddPhase}>Tambah Phase</Button>
        </div>
      </div>
    </Card>
  )
}

type EmptyStateProps = {
  onAddPhase: () => void
}

export const ProjectPhasesEmptyState: React.FC<EmptyStateProps> = ({
  onAddPhase,
}) => {
  return (
    <Card className="bg-background border-t">
      <div className="flex items-center gap-3 p-4 border-b">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-medium">Data Project Phases</h3>
          <p className="text-sm text-muted-foreground">
            Belum ada data yang ditampilkan.
          </p>
        </div>
      </div>
      <div className="p-6">
        <p className="text-sm text-muted-foreground">
          Tambahkan project phase untuk mulai mengelola tahapan dan timeline
          proyek.
        </p>
        <div className="mt-4">
          <Button onClick={onAddPhase}>Tambah Phase</Button>
        </div>
      </div>
    </Card>
  )
}
