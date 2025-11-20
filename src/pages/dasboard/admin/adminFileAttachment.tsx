import * as React from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  IconEye,
  IconPhoto,
  IconDotsVertical,
  IconTrash,
  IconPlus,
  IconDownload,
} from "@tabler/icons-react"

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

const API_BASE = import.meta.env.VITE_API_BASE

type AttachmentApi = {
  id: number
  ticketId?: number
  userId?: number
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  createdAt: string
  base64?: string
  user?: {
    id: number
    fullName: string
    email?: string
  }
}

type Attachment = {
  id: number
  fileName: string
  mimeType: string
  size?: number
  url?: string
  base64?: string
  createdAt?: string
  ticketId?: number
  uploader?: {
    id: number
    fullName: string
    email?: string
  }
}

const fmtBytes = (bytes?: number) => {
  if (!bytes && bytes !== 0) return "-"
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const v = parseFloat((bytes / Math.pow(k, i)).toFixed(2))
  return `${v} ${sizes[i]}`
}

const fmtDate = (iso?: string) => {
  if (!iso) return "-"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "-"

  return d.toLocaleString("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const isImage = (att: Attachment) => {
  if (att.mimeType && att.mimeType.startsWith("image/")) return true
  const name = (att.fileName || "").toLowerCase()
  return (
    name.endsWith(".png") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".webp") ||
    name.endsWith(".gif")
  )
}

const getFileSrc = (att: Attachment) => {
  if (att.base64) {
    return `data:${att.mimeType};base64,${att.base64}`
  }
  return att.url || ""
}

const getImageSrc = (att: Attachment) => getFileSrc(att)

export default function AdminFileAttachments() {
  const [attachments, setAttachments] = React.useState<Attachment[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [previewOpen, setPreviewOpen] = React.useState(false)
  const [previewItem, setPreviewItem] = React.useState<Attachment | null>(null)

  const navigate = useNavigate()

  React.useEffect(() => {
    const fetchAttachments = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = localStorage.getItem("token")
        const res = await axios.get<AttachmentApi[]>(`${API_BASE}/attachments`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })

        const mapped: Attachment[] = res.data.map((a) => {
          let fileUrl: string | undefined = a.filePath
          if (fileUrl && !fileUrl.startsWith("http")) {
            fileUrl = fileUrl.startsWith("/")
              ? `${API_BASE}${fileUrl}`
              : `${API_BASE}/${fileUrl}`
          }

          return {
            id: a.id,
            fileName: a.fileName,
            mimeType: a.mimeType,
            size: a.fileSize,
            url: fileUrl,
            base64: a.base64,
            createdAt: a.createdAt,
            ticketId: a.ticketId,
            uploader: a.user
              ? {
                  id: a.user.id,
                  fullName: a.user.fullName,
                  email: a.user.email,
                }
              : undefined,
          }
        })

        setAttachments(mapped)
      } catch (err) {
        console.error(err)
        setError("Gagal memuat daftar attachment.")
      } finally {
        setLoading(false)
      }
    }

    fetchAttachments()
  }, [])

  const openPreview = (att: Attachment) => {
    if (!isImage(att)) return
    setPreviewItem(att)
    setPreviewOpen(true)
  }

  // 🔥 DELETE attachment + toast
  const handleDelete = async (id: number) => {
    const target = attachments.find((a) => a.id === id)
    const prev = attachments

    // optimistic update
    setAttachments((p) => p.filter((a) => a.id !== id))

    try {
      const token = localStorage.getItem("token")
      await axios.delete(`${API_BASE}/attachments/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      toast.success("Attachment dihapus", {
        description: target?.fileName
          ? `File "${target.fileName}" berhasil dihapus.`
          : "File berhasil dihapus.",
      })
    } catch (err) {
      console.error(err)
      setAttachments(prev)
      const msg = "Gagal menghapus attachment."
      setError(msg)
      toast.error("Gagal menghapus attachment", {
        description: msg,
      })
    }
  }

  const handleDownload = (att: Attachment) => {
    const src = getFileSrc(att)
    if (!src) {
      toast.error("Tidak dapat mengunduh file", {
        description: "Sumber file tidak ditemukan.",
      })
      return
    }
    const link = document.createElement("a")
    link.href = src
    link.download = att.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />

          {/* CONTENT */}
          <div className="flex flex-1 flex-col">
            <div className="px-4 lg:px-6 flex justify-between py-4">
              <div>
                <h1 className="text-2xl font-semibold">File Attachments</h1>
                <p className="text-muted-foreground">
                  Daftar file yang diunggah ke ticket.
                </p>
              </div>
              <Button onClick={() => navigate("/admin/dashboard/file-attachments/create")}>
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
                              {isImage(att) ? (
                                <button
                                  className="w-full"
                                  onClick={() => openPreview(att)}
                                >
                                  <img
                                    src={getImageSrc(att)}
                                    className="h-40 w-full object-cover"
                                  />
                                </button>
                              ) : (
                                <div className="h-40 bg-muted flex items-center justify-center">
                                  <IconPhoto className="h-10 w-10 text-muted-foreground" />
                                </div>
                              )}

                              {/* MENU */}
                              <div className="absolute top-2 right-2">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="icon" variant="secondary">
                                      <IconDotsVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>

                                  <DropdownMenuContent className="w-44" align="end">
                                    {isImage(att) && (
                                      <DropdownMenuItem
                                        onClick={() => openPreview(att)}
                                      >
                                        <IconEye className="h-4 w-4 mr-2" />
                                        Preview
                                      </DropdownMenuItem>
                                    )}

                                    <DropdownMenuItem
                                      onClick={() => handleDownload(att)}
                                    >
                                      <IconDownload className="h-4 w-4 mr-2" />
                                      Download
                                    </DropdownMenuItem>

                                    {/* 🔻 Delete pakai AlertDialog + toast */}
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
                                            akan dihapus secara permanen. Tindakan
                                            ini tidak dapat dibatalkan.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>
                                            Batal
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            className="bg-red-600 hover:bg-red-700"
                                            onClick={() => handleDelete(att.id)}
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

                            {/* INFO */}
                            <div className="p-3 space-y-2">
                              <div className="text-sm font-medium line-clamp-2">
                                {att.fileName}
                              </div>

                              <div className="flex flex-wrap gap-1 text-xs">
                                <Badge variant="outline">{att.mimeType}</Badge>
                                <Badge variant="outline">
                                  {fmtBytes(att.size)}
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
                                Uploaded at: {fmtDate(att.createdAt)}
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
        </SidebarInset>
      </SidebarProvider>

      {/* PREVIEW POPUP */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewItem?.fileName}</DialogTitle>
          </DialogHeader>

          {previewItem && isImage(previewItem) && (
            <div className="flex justify-center max-h-[70vh] overflow-auto">
              <img
                src={getImageSrc(previewItem)}
                className="max-h-[70vh] rounded"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
