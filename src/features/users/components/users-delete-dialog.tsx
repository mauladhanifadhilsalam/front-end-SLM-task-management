"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { IconTrash } from "@tabler/icons-react"

type Props = {
  userId: number
  userName?: string
  triggerVariant?: "icon" | "button"
  triggerLabel?: string
  loading?: boolean
  disabled?: boolean
  onConfirm: () => void
}

export const UserDeleteDialog: React.FC<Props> = ({
  userId,
  userName,
  triggerVariant = "icon",
  triggerLabel = "Delete",
  loading = false,
  disabled = false,
  onConfirm,
}) => {
  const description = userName
    ? `Yakin ingin menghapus user "${userName}"? Tindakan ini tidak dapat dikembalikan.`
    : "Yakin ingin menghapus user ini? Tindakan ini tidak dapat dikembalikan."

  const handleClick = () => {
    if (loading) return
    onConfirm()
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {triggerVariant === "icon" ? (
          <button
            className="inline-flex text-red-600 hover:text-red-700 cursor-pointer"
            disabled={disabled || loading}
          >
            <IconTrash className="h-4 w-4" />
          </button>
        ) : (
          <Button
            size="sm"
            variant="destructive"
            className="flex items-center gap-2"
            disabled={disabled || loading}
          >
            <IconTrash className="h-4 w-4" />
            {loading ? "Menghapus..." : triggerLabel}
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus user?</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleClick}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "Menghapus..." : "Ya, hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
