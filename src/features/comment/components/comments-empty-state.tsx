"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type SearchEmptyStateProps = {
  query: string
  onClear: () => void
  onAddComment: () => void
}

export const CommentsSearchEmptyState: React.FC<SearchEmptyStateProps> = ({
  query,
  onClear,
  onAddComment,
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
          <Button onClick={onAddComment}>Tambah Comment</Button>
        </div>
      </div>
    </Card>
  )
}

type EmptyStateProps = {
  onAddComment: () => void
}

export const CommentsEmptyState: React.FC<EmptyStateProps> = ({
  onAddComment,
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-medium">Data Ticket Comments</h3>
          <p className="text-sm text-muted-foreground">
            Belum ada data yang ditampilkan.
          </p>
        </div>
      </div>
      <div className="p-6">
        <p className="text-sm text-muted-foreground">
          Tambahkan comment untuk mulai mengelola komunikasi dan diskusi pada
          ticket.
        </p>
        <div className="mt-4">
          <Button onClick={onAddComment}>Tambah Comment</Button>
        </div>
      </div>
    </Card>
  )
}
