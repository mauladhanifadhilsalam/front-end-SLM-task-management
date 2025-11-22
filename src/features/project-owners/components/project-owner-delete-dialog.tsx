"use client"

import * as React from "react"
import { IconTrash } from "@tabler/icons-react"
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

type Props = {
  ownerId: number
  ownerName?: string
  triggerVariant?: "icon" | "button"
  triggerLabel?: string
  loading?: boolean
  disabled?: boolean
  onConfirm: () => void
}

export const ProjectOwnerDeleteDialog: React.FC<Props> = ({
  ownerId,
  ownerName,
  triggerVariant = "icon",
  triggerLabel = "Delete",
  loading = false,
  disabled = false,
  onConfirm,
}) => {
  const description = ownerName
    ? `Yakin ingin menghapus "${ownerName}"? Tindakan ini tidak dapat dibatalkan.`
    : "Yakin ingin menghapus owner ini? Tindakan ini tidak dapat dibatalkan."

  const handleClick = () => {
    if (loading) return
    onConfirm()
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {triggerVariant === "icon" ? (
          <button
            className="px-2 py-1 rounded text-red-600 cursor-pointer"
            disabled={disabled || loading}
          >
            <IconTrash className="h-4 w-4" />
          </button>
        ) : (
          <Button
            size="sm"
            variant="destructive"
            className="flex items-center gap-2 cursor-pointer bg-red-600"
            disabled={disabled || loading}
          >
            <IconTrash className="h-4 w-4" />
            {loading ? "Menghapus..." : triggerLabel}
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Hapus project owner?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleClick}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
