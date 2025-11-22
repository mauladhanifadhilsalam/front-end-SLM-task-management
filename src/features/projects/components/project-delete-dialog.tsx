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
  projectId: number
  projectName?: string
  onConfirm: () => void
  disabled?: boolean
  variant?: "icon" | "button"
}

export const ProjectDeleteDialog: React.FC<Props> = ({
  projectId,
  projectName,
  onConfirm,
  disabled,
  variant = "icon",
}) => {
  const description = projectName
    ? `Project "${projectName}" akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.`
    : "Project akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan."

  const trigger =
    variant === "button" ? (
      <Button
        size="sm"
        variant="destructive"
        className="flex items-center gap-2"
        disabled={disabled}
      >
        <IconTrash className="h-4 w-4" />
        Hapus
      </Button>
    ) : (
      <Button
        type="button"
        size="icon"
        variant="none"
        className="cursor-pointer text-red-600 pr-4 "
        disabled={disabled}
      >
        <IconTrash className="h-4 w-4" />
      </Button>
    )

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Project?</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={disabled}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
            disabled={disabled}
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
