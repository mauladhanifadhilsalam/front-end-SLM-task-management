"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  IconEye,
  IconFile,
  IconDotsVertical,
  IconTrash,
  IconPlus,
  IconDownload,
} from "@tabler/icons-react"
import type { Attachment } from "@/types/file-attachment.type"
import { formatBytes } from "@/utils/format-bytes"
import { formatDateTime } from "@/utils/format-date-time"
import {
  isImageAttachment,
  getAttachmentImageSrc,
} from "@/utils/attachment-utils"

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
  attachments: Attachment[]
  loading: boolean
  error: string | null
  onCreateClick: () => void
  onPreview: (att: Attachment) => void
  onDelete: (id: number) => void
  onDownload: (att: Attachment) => void
}

export const AdminFileAttachmentsGrid: React.FC<Props> = ({
  attachments,
  loading,
  error,
  onCreateClick,
  onPreview,
  onDelete,
  onDownload,
}) => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="px-4 lg:px-6 flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">File Attachments</h1>
          <p className="text-muted-foreground">
            Daftar file yang diunggah ke ticket.
          </p>
        </div>
        <Button onClick={onCreateClick} className="w-full sm:w-auto">
          <IconPlus className="mr-2 h-4 w-4" />
          Add File Attachment
        </Button>
      </div>

      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Attachment List</CardTitle>
          </CardHeader>

          <CardContent>
            {loading && <p className="text-sm">Loading…</p>}

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 border border-red-200 rounded">
                {error}
              </div>
            )}

            {!loading && attachments.length === 0 && !error && (
              <p className="text-sm text-muted-foreground">
                Belum ada file.
              </p>
            )}

            {!loading && attachments.length > 0 && (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {attachments.map((att) => (
                  <Card key={att.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative">
                            {isImageAttachment(att) ? (
                            <button
                                className="w-full"
                                onClick={() => onPreview(att)}
                            >
                                <img
                                src={getAttachmentImageSrc(att)}
                                className="h-40 w-full object-cover"
                                />
                            </button>
                            ) : (
                          <div className="h-40 bg-muted flex items-center justify-center">
                            <IconFile className="h-10 w-10 text-muted-foreground" />
                          </div>
                        )}

                        <div className="absolute top-2 right-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="secondary">
                                <IconDotsVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="w-44" align="end">
                              {isImageAttachment(att) && (
                                <DropdownMenuItem
                                  onClick={() => onPreview(att)}
                                >
                                  <IconEye className="h-4 w-4 mr-2" />
                                  Preview
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem
                                onClick={() => onDownload(att)}
                              >
                                <IconDownload className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <IconTrash className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Hapus attachment?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      File{" "}
                                      <span className="font-semibold">
                                        {att.fileName}
                                      </span>{" "}
                                      akan dihapus secara permanen. Tindakan ini
                                      tidak dapat dibatalkan.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Batal
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 hover:bg-red-700"
                                      onClick={() => onDelete(att.id)}
                                    >
                                      Hapus
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <div className="p-3 space-y-2">
                        <div className="text-sm font-medium line-clamp-2">
                          {att.fileName}
                        </div>

                        <div className="flex flex-wrap gap-1 text-xs">
                          <Badge variant="outline">{att.mimeType}</Badge>
                          <Badge variant="outline">
                            {formatBytes(att.size)}
                          </Badge>
                        </div>

                        {att.ticketId && (
                          <div className="text-xs text-muted-foreground">
                            Ticket:{" "}
                            <span className="font-medium">
                              #{att.ticketId}
                            </span>
                          </div>
                        )}

                        <div className="text-[11px] text-muted-foreground">
                          Uploaded at: {formatDateTime(att.createdAt)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
