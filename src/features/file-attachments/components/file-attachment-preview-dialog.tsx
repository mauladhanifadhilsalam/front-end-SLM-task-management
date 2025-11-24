"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Attachment } from "@/types/file-attachment.type"
import { isImageAttachment, getAttachmentImageSrc } from "@/utils/attachment-utils"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  attachment: Attachment | null
}

export const FileAttachmentPreviewDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  attachment,
}) => {
  const canPreview = attachment && isImageAttachment(attachment)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{attachment?.fileName}</DialogTitle>
        </DialogHeader>

        {canPreview && (
          <div className="flex justify-center max-h-[70vh] overflow-auto">
            <img
              src={getAttachmentImageSrc(attachment)}
              className="max-h-[70vh] rounded"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
