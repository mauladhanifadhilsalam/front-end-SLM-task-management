import * as React from "react";
import axios from "axios";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconEye,
  IconPhoto,
  IconAlertCircle,
  IconDotsVertical,
  IconTrash,
  IconPlus,
  IconDownload,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE;

type AttachmentApi = {
  id: number;
  ticketId?: number;
  userId?: number;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  base64?: string;
  user?: {
    id: number;
    fullName: string;
    email?: string;
  };
};

type Attachment = {
  id: number;
  fileName: string;
  mimeType: string;
  size?: number;
  url?: string;
  base64?: string;
  createdAt?: string;
  ticketId?: number;
  uploader?: {
    id: number;
    fullName: string;
    email?: string;
  };
};

const fmtBytes = (bytes?: number) => {
  if (!bytes && bytes !== 0) return "-";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const v = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${v} ${sizes[i]}`;
};

const fmtDate = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
};

const isImage = (att: Attachment) => {
  if (att.mimeType && att.mimeType.startsWith("image/")) return true;
  const name = (att.fileName || "").toLowerCase();
  return (
    name.endsWith(".png") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".webp") ||
    name.endsWith(".gif")
  );
};

// kalau ada base64 → pakai data URL
// kalau tidak, fallback ke url biasa
const getFileSrc = (att: Attachment) => {
  if (att.base64) {
    const mime = att.mimeType || "application/octet-stream";
    return `data:${mime};base64,${att.base64}`;
  }

  if (att.url) return att.url;

  return "";
};

// khusus untuk <img>, tapi sumbernya sama
const getImageSrc = (att: Attachment) => getFileSrc(att);

export default function AdminFileAttachments() {
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewItem, setPreviewItem] = React.useState<Attachment | null>(null);

  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchAttachments = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const res = await axios.get<AttachmentApi[]>(`${API_BASE}/attachments`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const data = res.data;

        const mapped: Attachment[] = data.map((a) => {
          let fileUrl: string | undefined = a.filePath;
          if (fileUrl && !fileUrl.startsWith("http")) {
            fileUrl = fileUrl.startsWith("/")
              ? `${API_BASE}${fileUrl}`
              : `${API_BASE}/${fileUrl}`;
          }

          return {
            id: a.id,
            fileName: a.fileName || `Attachment #${a.id}`,
            mimeType: a.mimeType || "application/octet-stream",
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
          };
        });

        setAttachments(mapped);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat daftar attachment.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttachments();
  }, []);

  const openPreview = (att: Attachment) => {
    if (!isImage(att) || !(att.base64 || att.url)) return;
    setPreviewItem(att);
    setPreviewOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${API_BASE}/attachments/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setAttachments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
      setError("Gagal menghapus attachment.");
    }
  };

  const handleDownload = (att: Attachment) => {
    const src = getFileSrc(att);
    if (!src) {
      console.error("No file source available for download");
      return;
    }

    const link = document.createElement("a");
    link.href = src;
    link.download = att.fileName || "attachment";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          <div className="flex flex-1 flex-col">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6 flex justify-between">
                <div>
                  <h1 className="text-2xl font-semibold">File Attachments</h1>
                  <p className="text-muted-foreground">
                    Daftar file yang diunggah ke ticket. Klik thumbnail untuk
                    melihat gambar lebih besar.
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
                    {loading && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                        Loading attachments...
                      </div>
                    )}

                    {!loading && error && (
                      <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                        <IconAlertCircle className="h-4 w-4 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}

                    {!loading && !error && attachments.length === 0 && (
                      <div className="text-sm text-muted-foreground">
                        Belum ada attachment yang diunggah.
                      </div>
                    )}

                    {!loading && !error && attachments.length > 0 && (
                      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {attachments.map((att) => (
                          <Card key={att.id} className="overflow-hidden">
                            <CardContent className="p-0">
                              <div className="relative">
                                {isImage(att) && (att.base64 || att.url) ? (
                                  <button
                                    type="button"
                                    className="w-full focus:outline-none"
                                    onClick={() => openPreview(att)}
                                  >
                                    <img
                                      src={getImageSrc(att)}
                                      alt={att.fileName}
                                      className="h-40 w-full object-cover"
                                    />
                                  </button>
                                ) : (
                                  <div className="h-40 flex items-center justify-center bg-muted">
                                    <IconPhoto className="h-10 w-10 text-muted-foreground" />
                                  </div>
                                )}

                                <div className="absolute top-2 right-2">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        size="icon"
                                        variant="secondary"
                                        className="h-8 w-8 rounded-full"
                                      >
                                        <IconDotsVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="end"
                                      className="w-40"
                                    >
                                      {isImage(att) && (att.base64 || att.url) && (
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
                                      <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => handleDelete(att.id)}
                                      >
                                        <IconTrash className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>

                              <div className="p-3 space-y-2">
                                <div className="text-sm font-medium line-clamp-2">
                                  {att.fileName}
                                </div>

                                <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                                  <Badge variant="outline">{att.mimeType}</Badge>
                                  {att.size != null && (
                                    <Badge variant="outline">
                                      {fmtBytes(att.size)}
                                    </Badge>
                                  )}
                                </div>

                                {att.ticketId && (
                                  <div className="text-xs text-muted-foreground">
                                    Ticket:{" "}
                                    <span className="font-medium">
                                      #{att.ticketId}
                                    </span>
                                  </div>
                                )}

                                {att.uploader && (
                                  <div className="text-xs text-muted-foreground">
                                    Uploaded by:{" "}
                                    <span className="font-medium">
                                      {att.uploader.fullName}
                                    </span>
                                  </div>
                                )}

                                {att.createdAt && (
                                  <div className="text-[11px] text-muted-foreground">
                                    Uploaded at: {fmtDate(att.createdAt)}
                                  </div>
                                )}
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
          </div>
        </SidebarInset>
      </SidebarProvider>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewItem?.fileName || "Preview"}</DialogTitle>
          </DialogHeader>
          {previewItem &&
            isImage(previewItem) &&
            (previewItem.base64 || previewItem.url) && (
              <div className="w-full max-h-[70vh] overflow-auto flex justify-center">
                <img
                  src={getImageSrc(previewItem)}
                  alt={previewItem.fileName}
                  className="max-h-[70vh] rounded"
                />
              </div>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
