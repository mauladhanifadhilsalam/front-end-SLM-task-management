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
import type { ActivityLog } from "@/types/activity-log.type"

type Props = {
  open: boolean
  isDeleting: boolean
  logToDelete: ActivityLog | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export const DeleteActivityLogDialog: React.FC<Props> = ({
  open,
  isDeleting,
  logToDelete,
  onOpenChange,
  onConfirm,
}) => {
  const handleOpenChange = (next: boolean) => {
    if (!next && isDeleting) return
    onOpenChange(next)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Hapus activity log?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Log yang dihapus akan hilang secara permanen dan
            tidak dapat dikembalikan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {logToDelete && (
          <div className="mb-4 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 px-3 py-2 text-xs">
            <p>
              <span className="font-semibold">ID:</span>{" "}
              {logToDelete.id}
            </p>
            <p>
              <span className="font-semibold">Action:</span>{" "}
              {logToDelete.action}
            </p>
            <p>
              <span className="font-semibold">User:</span>{" "}
              {logToDelete.user.fullName}
            </p>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
