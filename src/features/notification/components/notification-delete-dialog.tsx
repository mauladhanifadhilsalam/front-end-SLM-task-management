"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type NotificationDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  loading?: boolean
  title?: string
  description?: string
  confirmLabel?: string
  loadingLabel?: string
  cancelLabel?: string
  onConfirm: () => void
}

export const NotificationDeleteDialog: React.FC<
  NotificationDeleteDialogProps
> = ({
  open,
  onOpenChange,
  loading = false,
  title = "Hapus notifikasi?",
  description = "Notifikasi yang dihapus akan hilang secara permanen dan tidak dapat dikembalikan.",
  confirmLabel = "Hapus",
  loadingLabel,
  cancelLabel = "Batal",
  onConfirm,
}) => {
  const confirmText = loading ? loadingLabel ?? confirmLabel : confirmLabel

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
