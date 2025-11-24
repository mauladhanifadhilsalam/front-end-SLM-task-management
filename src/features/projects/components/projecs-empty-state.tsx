"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type SearchEmptyStateProps = {
  query: string
  onClear: () => void
  onCreateProject: () => void
}

export const ProjectsSearchEmptyState: React.FC<
  SearchEmptyStateProps
> = ({ query, onClear, onCreateProject }) => {
  return (
    <Card className="bg-background border-t mt-4">
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
          <h3 className="text-sm font-medium">
            Hasil Pencarian
          </h3>
          <p className="text-sm text-muted-foreground">
            Tidak ditemukan hasil untuk{" "}
            <span className="font-medium text-foreground">
              “{query}”
            </span>
            .
          </p>
        </div>
      </div>
      <div className="p-6">
        <p className="text-sm text-muted-foreground">
          Periksa ejaan kata kunci atau coba gunakan kata kunci yang
          lebih umum.
        </p>
        <div className="mt-4 flex gap-3">
          <Button variant="outline" onClick={onClear}>
            Bersihkan Pencarian
          </Button>
          <Button onClick={onCreateProject}>
            Tambah Project
          </Button>
        </div>
      </div>
    </Card>
  )
}

type EmptyStateProps = {
  onCreateProject: () => void
}

export const ProjectsEmptyState: React.FC<EmptyStateProps> = ({
  onCreateProject,
}) => {
  return (
    <Card className="bg-background border-t mt-4">
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
              d="M16 14a4 4 0 10-8 0m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2v-2m12 4v-6a2 2 0 00-2-2h-1M5 18v-6a2 2 0 012-2h1"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-medium">Data Project</h3>
          <p className="text-sm text-muted-foreground">
            Belum ada project yang ditampilkan.
          </p>
        </div>
      </div>
      <div className="p-6">
        <p className="text-sm text-muted-foreground">
          Tambahkan project untuk mulai mengelola pekerjaan dan
          progres tim.
        </p>
        <div className="mt-4">
          <Button onClick={onCreateProject}>
            Tambah Project
          </Button>
        </div>
      </div>
    </Card>
  )
}
