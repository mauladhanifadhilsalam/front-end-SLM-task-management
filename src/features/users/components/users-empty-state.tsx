"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type SearchEmptyStateProps = {
  query: string
  onClear: () => void
  onAddUser: () => void
}

export const UsersSearchEmptyState: React.FC<SearchEmptyStateProps> = ({
  query,
  onClear,
  onAddUser,
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
          <Button onClick={onAddUser}>Tambah User</Button>
        </div>
      </div>
    </Card>
  )
}

type EmptyStateProps = {
  onAddUser: () => void
}

export const UsersEmptyState: React.FC<EmptyStateProps> = ({ onAddUser }) => {
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
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-medium">Data Users</h3>
          <p className="text-sm text-muted-foreground">
            Belum ada data yang ditampilkan.
          </p>
        </div>
      </div>
      <div className="p-6">
        <p className="text-sm text-muted-foreground">
          Tambahkan user untuk mulai mengelola pengguna sistem.
        </p>
        <div className="mt-4">
          <Button onClick={onAddUser}>Tambah User</Button>
        </div>
      </div>
    </Card>
  )
}
