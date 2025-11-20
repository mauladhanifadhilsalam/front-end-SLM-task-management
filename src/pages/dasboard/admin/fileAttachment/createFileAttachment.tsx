import * as React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconArrowLeft, IconCheck, IconUpload } from "@tabler/icons-react";

import {
  fileAttachmentSchema,
  type FileAttachmentField,
  type FileAttachmentValues,
} from "@/schemas/file-attachments.schema";

const API_BASE = import.meta.env.VITE_API_BASE;

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/jpg",
  "application/pdf",
  "text/plain",
];

type Option = { value: string; label: string };

type TicketApi = {
  id: number;
  title?: string;
  subject?: string;
  code?: string;
};

function FieldSelect({
  id,
  label,
  placeholder,
  value,
  onValueChange,
  disabled,
  required = false,
  description,
  options,
  error,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onValueChange: (v: string) => void;
  disabled?: boolean;
  required?: boolean;
  description?: string;
  options: Option[];
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1">
        <Label htmlFor={id}>{label}</Label>
        {required && <span className="text-destructive">*</span>}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

const fmtBytes = (bytes?: number) => {
  if (!bytes && bytes !== 0) return "-";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const v = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${v} ${sizes[i]}`;
};

const ACCEPT_ATTR = ALLOWED_TYPES.join(",");

export default function CreateFileAttachment() {
  const navigate = useNavigate();

  const [ticketOptions, setTicketOptions] = React.useState<Option[]>([]);
  const [loadingTickets, setLoadingTickets] = React.useState<boolean>(false);

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState<number>(0);
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);

  const [form, setForm] = React.useState<FileAttachmentValues>({
    ticketId: "",
    file: undefined as unknown as File, // akan diisi saat user pilih file
  });

  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<FileAttachmentField, string>>
  >({});

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = React.useState(false);

  // fetch ticket dari API
  React.useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoadingTickets(true);
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const ticketRes = await axios.get<TicketApi[]>(
          `${API_BASE}/tickets`,
          { headers }
        );

        const tickets = ticketRes.data || [];

        setTicketOptions(
          tickets.map((t) => {
            const title = t.title || t.subject || t.code || `Ticket #${t.id}`;
            return { value: String(t.id), label: `${title} (#${t.id})` };
          })
        );
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data ticket.");
      } finally {
        setLoadingTickets(false);
      }
    };

    fetchTickets();
  }, []);

  // preview image (kalau file gambar)
  React.useEffect(() => {
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(null);
    }
  }, [file]);

  const handleFilePick = (f: File | null) => {
    if (!f) {
      setFile(null);
      setForm((prev) => ({ ...prev, file: undefined as unknown as File }));
      setFieldErrors((prev) => ({ ...prev, file: undefined }));
      return;
    }

    // validasi basic di client (sinkron dengan schema)
    if (f.size > MAX_FILE_SIZE) {
      setFieldErrors((prev) => ({
        ...prev,
        file: "Ukuran file maksimal 5MB.",
      }));
      setFile(null);
      setForm((prev) => ({ ...prev, file: undefined as unknown as File }));
      return;
    }

    if (!ALLOWED_TYPES.includes(f.type)) {
      setFieldErrors((prev) => ({
        ...prev,
        file:
          "Tipe file tidak diizinkan. Hanya PNG, JPG, JPEG, WEBP, PDF, atau TXT.",
      }));
      setFile(null);
      setForm((prev) => ({ ...prev, file: undefined as unknown as File }));
      return;
    }

    setError(null);
    setFieldErrors((prev) => ({ ...prev, file: undefined }));
    setFile(f);
    setForm((prev) => ({ ...prev, file: f }));
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    handleFilePick(f);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0] || null;
    handleFilePick(f);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const parsed = fileAttachmentSchema.safeParse(form);

    if (!parsed.success) {
      const newFieldErrors: Partial<Record<FileAttachmentField, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as FileAttachmentField;
        if (field && !newFieldErrors[field]) {
          newFieldErrors[field] = issue.message;
        }
      });
      setFieldErrors(newFieldErrors);
      return;
    }

    try {
      setSaving(true);
      setProgress(0);

      const token = localStorage.getItem("token");
      const fd = new FormData();
      fd.append("ticketId", parsed.data.ticketId);
      // userId tidak dikirim, backend ambil dari viewer (user yang login)
      fd.append("file", parsed.data.file);

      await axios.post(`${API_BASE}/attachments`, fd, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        onUploadProgress: (pe) => {
          if (!pe.total) return;
          const pct = Math.round((pe.loaded * 100) / pe.total);
          setProgress(pct);
        },
      });

      toast.success("Attachment uploaded", {
        description: "Attachment berhasil diunggah.",
      });

      navigate("/admin/dashboard/file-attachments");
      } catch (err: any) {
        const msg2 =
          err?.response?.data?.message || "Gagal mengunggah attachment.";
        setError(msg2);
        toast.error("Failed to upload attachment", {
          description: msg2,
        });
      } finally {

      setSaving(false);
      setProgress(0);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setForm((prev) => ({ ...prev, file: undefined as unknown as File }));
    setFieldErrors((prev) => ({ ...prev, file: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = "";
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
              <div className="px-4 lg:px-6">
                <div className="flex items-center gap-4 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      navigate("/admin/dashboard/file-attachments")
                    }
                    className="flex items-center gap-2"
                  >
                    <IconArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                </div>
                <h1 className="text-2xl font-semibold">Upload Attachment</h1>
                <p className="text-muted-foreground">
                  Lampirkan file untuk tiket tertentu.
                </p>
              </div>

              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Attachment Information</CardTitle>
                    <CardDescription>
                      Pilih tiket dan file yang akan diunggah. Uploader akan
                      otomatis mengikuti user yang sedang login.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {error && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                          {error}
                        </div>
                      )}

                      {/* Ticket */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FieldSelect
                          id="ticket"
                          label="Ticket"
                          required
                          placeholder={
                            loadingTickets
                              ? "Memuat data ticket..."
                              : "Select a ticket"
                          }
                          description="Tiket yang akan menerima lampiran."
                          value={form.ticketId}
                          onValueChange={(v) => {
                            setForm((f) => ({ ...f, ticketId: v }));
                            setFieldErrors((prev) => ({
                              ...prev,
                              ticketId: undefined,
                            }));
                          }}
                          disabled={saving || loadingTickets}
                          options={ticketOptions}
                          error={fieldErrors.ticketId}
                        />
                      </div>

                      {/* File input + drop zone */}
                      <div className="space-y-2">
                        <div className="col-span-full">
                          <label
                            htmlFor="file-upload"
                            className="block text-sm leading-6 font-medium"
                          >
                            Attachment <span className="text-destructive">*</span>
                          </label>

                          <div
                            onDrop={onDrop}
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onClick={() => fileInputRef.current?.click()}
                            className={[
                              "mt-2 flex justify-center rounded-lg border border-dashed px-6 py-10 cursor-pointer transition-colors",
                              dragOver
                                ? "border-primary/60 bg-primary/5"
                                : " hover:bg-muted/20",
                            ].join(" ")}
                            role="button"
                            aria-label="Upload file dropzone"
                          >
                            <div className="text-center">
                              <IconUpload
                                aria-hidden="true"
                                className="mx-auto size-12 text-gray-600"
                              />
                              <div className="mt-4 flex text-sm leading-6 text-gray-400 justify-center">
                                <span className="font-semibold text-indigo-400 hover:text-indigo-300">
                                  Click to upload
                                </span>
                                <span className="pl-1">or drag and drop</span>
                              </div>
                              <p className="text-xs leading-5 text-gray-400">
                                Allowed: PNG, JPG, JPEG, WEBP, PDF, TXT. Max
                                size: {fmtBytes(MAX_FILE_SIZE)}
                              </p>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                ref={fileInputRef}
                                accept={ACCEPT_ATTR}
                                onChange={onFileInputChange}
                                disabled={saving}
                              />
                            </div>
                          </div>

                          {fieldErrors.file && (
                            <p className="mt-2 text-xs text-destructive">
                              {fieldErrors.file}
                            </p>
                          )}

                          {/* file meta */}
                          {file && (
                            <div className="mt-3 flex items-start justify-between gap-3 rounded-md border p-3">
                              <div className="text-sm">
                                <div className="font-medium">
                                  {file.name}
                                </div>
                                <div className="text-muted-foreground">
                                  {file.type || "unknown"} ·{" "}
                                  {fmtBytes(file.size)}
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={clearFile}
                                disabled={saving}
                              >
                                Clear
                              </Button>
                            </div>
                          )}

                          {/* preview image */}
                          {preview && (
                            <div className="mt-3">
                              <img
                                src={preview}
                                alt="preview"
                                className="max-h-48 rounded border"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* progress */}
                      {saving && (
                        <div className="w-full bg-muted rounded h-2 overflow-hidden">
                          <div
                            className="bg-primary h-2 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}

                      <div className="flex justify-end gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            navigate("/admin/dashboard/file-attachments")
                          }
                          disabled={saving}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={saving || !file}>
                          <IconCheck className="mr-2 h-4 w-4" />
                          {saving ? "Uploading..." : "Upload Attachment"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
