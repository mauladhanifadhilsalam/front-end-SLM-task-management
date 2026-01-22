"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type SearchEmptyStateProps = {
  query: string
  onClear: () => void
  onAssignTicket: () => void
}

export const TicketAssigneeSearchEmptyState: React.FC<
  SearchEmptyStateProps
> = ({ query, onClear, onAssignTicket }) => {
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
          <Button onClick={onAssignTicket}>Assign Ticket</Button>
        </div>
      </div>
    </Card>
  )
}

type EmptyStateProps = {
  onAssignTicket: () => void
}

export const TicketAssigneeEmptyState: React.FC<EmptyStateProps> = ({
  onAssignTicket,
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-medium">Data Ticket Assignments</h3>
          <p className="text-sm text-muted-foreground">
            Belum ada data yang ditampilkan.
          </p>
        </div>
      </div>
      <div className="p-6">
        <p className="text-sm text-muted-foreground">
          Assign ticket ke user/developer untuk mulai mengelola penugasan
          ticket.
        </p>
        <div className="mt-4">
          <Button onClick={onAssignTicket}>Assign Ticket</Button>
        </div>
      </div>
    </Card>
  )
}
