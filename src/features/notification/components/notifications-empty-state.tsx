"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type SearchEmptyStateProps = {
  query: string
  onClear: () => void
}

export const NotificationsSearchEmptyState: React.FC<SearchEmptyStateProps> = ({
  query,
  onClear,
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
        <div className="mt-4">
          <Button variant="outline" onClick={onClear}>
            Bersihkan Pencarian
          </Button>
        </div>
      </div>
    </Card>
  )
}

export const NotificationsEmptyState: React.FC = () => {
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
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-medium">Data Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Belum ada data yang ditampilkan.
          </p>
        </div>
      </div>
      <div className="p-6">
        <p className="text-sm text-muted-foreground">
          Notifikasi sistem akan muncul di sini ketika ada aktivitas yang perlu
          dikomunikasikan kepada pengguna.
        </p>
      </div>
    </Card>
  )
}
