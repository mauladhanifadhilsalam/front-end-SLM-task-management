import * as React from "react";
import axios from "axios";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  IconAlertCircle,
  IconDownload,
  IconEye,
  IconFile,
  IconDotsVertical,
} from "@tabler/icons-react";

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
  return d.toLocaleString("id-ID");
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

// file source umum (buat <img> dan download)
const getFileSrc = (att: Attachment) => {
  if (att.base64) {
    const mime = att.mimeType || "application/octet-stream";
    return `data:${mime};base64,${att.base64}`;
  }
  if (att.url) return att.url;
  return "";
};

const getImageSrc = (att: Attachment) => getFileSrc(att);

export default function TicketAttachments({ ticketId }: { ticketId: number }) {
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewItem, setPreviewItem] = React.useState<Attachment | null>(null);

  React.useEffect(() => {
    const fetchAttachments = async () => {
      if (!ticketId) return;

      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const res = await axios.get<AttachmentApi[]>(
          `${API_BASE}/attachments`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            params: { ticketId },
          }
        );

        const payload = (res?.data as any)?.data ?? res?.data ?? [];
        const data: AttachmentApi[] = Array.isArray(payload) ? payload : [];

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
        setError("Gagal memuat file attachment untuk ticket ini.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttachments();
  }, [ticketId]);

  const openPreview = (att: Attachment) => {
    if (!isImage(att) || !(att.base64 || att.url)) return;
    setPreviewItem(att);
    setPreviewOpen(true);
  };

  const handleDownload = (att: Attachment) => {
    const src = getFileSrc(att);
    if (!src) return;

    const link = document.createElement("a");
    link.href = src;
    link.download = att.fileName || "attachment";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">File Attachments</h2>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="animate-spin rounded-full h-3 w-3 border border-primary border-t-transparent" />
          Memuat attachment...
        </div>
      )}

      {!loading && error && (
        <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
          <IconAlertCircle className="h-3 w-3 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && attachments.length === 0 && (
        <div className="text-xs text-muted-foreground">
          Belum ada file yang dilampirkan pada ticket ini.
        </div>
      )}

      {!loading && !error && attachments.length > 0 && (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="border rounded-md overflow-hidden bg-card shadow-sm"
            >
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
                      className="h-32 w-full object-cover"
                    />
                  </button>
                ) : (
                  <div className="h-32 flex items-center justify-center bg-muted">
                    <IconFile className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}

                <div className="absolute top-1.5 right-1.5">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-7 w-7 rounded-full"
                      >
                        <IconDotsVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36 text-xs">
                      {isImage(att) && (att.base64 || att.url) && (
                        <DropdownMenuItem onClick={() => openPreview(att)}>
                          <IconEye className="h-3 w-3 mr-2" />
                          Preview
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleDownload(att)}>
                        <IconDownload className="h-3 w-3 mr-2" />
                        Download
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="p-2.5 space-y-1.5">
                <div className="text-xs font-medium line-clamp-2">
                  {att.fileName}
                </div>

                <div className="flex flex-wrap gap-1 text-[10px] text-muted-foreground">
                  <Badge variant="outline">{att.mimeType}</Badge>
                  {att.size != null && (
                    <Badge variant="outline">{fmtBytes(att.size)}</Badge>
                  )}
                </div>

                {att.uploader && (
                  <div className="text-[10px] text-muted-foreground">
                    Uploaded by{" "}
                    <span className="font-medium">
                      {att.uploader.fullName}
                    </span>
                  </div>
                )}

                {att.createdAt && (
                  <div className="text-[10px] text-muted-foreground">
                    Uploaded at {fmtDate(att.createdAt)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview dialog */}
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
