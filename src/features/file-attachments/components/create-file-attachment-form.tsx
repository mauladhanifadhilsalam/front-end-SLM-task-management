"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IconArrowLeft, IconCheck, IconUpload } from "@tabler/icons-react"
import { formatBytes } from "@/utils/format-bytes"
import type { AttachmentTicketOption } from "@/services/file-attachment.service"
import type { FileAttachmentFieldErrors } from "@/features/file-attachments/hooks/use-create-file-attachment-form"
import { ACCEPT_FILE_TYPES } from "@/features/file-attachments/hooks/use-create-file-attachment-form"

type FieldSelectProps = {
  id: string
  label: string
  placeholder: string
  value: string
  onValueChange: (v: string) => void
  disabled?: boolean
  required?: boolean
  description?: string
  options: AttachmentTicketOption[]
  error?: string
}

const FieldSelect: React.FC<FieldSelectProps> = ({
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
}) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1">
        <Label htmlFor={id}>{label}</Label>
        {required && <span className="text-destructive">*</span>}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <Select value={value ?? ""} onValueChange={onValueChange} disabled={disabled}>
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
  )
}

type Props = {
  ticketOptions: AttachmentTicketOption[]
  loadingTickets: boolean
  saving: boolean
  error: string | null
  progress: number
  file: File | null
  preview: string | null
  dragOver: boolean
  fieldErrors: FileAttachmentFieldErrors
  onBack: () => void
  onTicketChange: (ticketId: string) => void
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void
  onClearFile: () => void
  onSubmit: (e: React.FormEvent) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  ticketId: string
  canChangeTicket?: boolean
}

export const CreateFileAttachmentForm: React.FC<Props> = ({
  ticketOptions,
  loadingTickets,
  saving,
  error,
  progress,
  file,
  preview,
  dragOver,
  fieldErrors,
  onBack,
  onTicketChange,
  onFileInputChange,
  onDrop,
  onDragOver,
  onDragLeave,
  onClearFile,
  onSubmit,
  fileInputRef,
  ticketId,
  canChangeTicket = true,
}) => {
  const canSubmit = !!file && !saving

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="mb-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
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
              <form onSubmit={onSubmit} className="space-y-6">
                {error && (
                  <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* Ticket */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                    
                    value={ticketId || ""}
                    onValueChange={onTicketChange}
                    disabled={!canChangeTicket || saving || loadingTickets}
                    options={ticketOptions}
                    error={fieldErrors.ticketId}
                  />
                </div>

                {/* File input + dropzone */}
                <div className="space-y-2">
                  <div className="col-span-full">
                    <label
                      htmlFor="file-upload"
                      className="block text-sm font-medium leading-6"
                    >
                      Attachment <span className="text-destructive">*</span>
                    </label>

                    <div
                      onDrop={onDrop}
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className={[
                        "mt-2 flex cursor-pointer justify-center rounded-lg border border-dashed px-6 py-10 transition-colors",
                        dragOver
                          ? "border-primary/60 bg-primary/5"
                          : "hover:bg-muted/20",
                      ].join(" ")}
                      role="button"
                      aria-label="Upload file dropzone"
                    >
                      <div className="text-center">
                        <IconUpload
                          aria-hidden="true"
                          className="mx-auto size-12 text-gray-600"
                        />
                        <div className="mt-4 flex justify-center text-sm leading-6 text-gray-400">
                          <span className="font-semibold text-indigo-400 hover:text-indigo-300">
                            Click to upload
                          </span>
                          <span className="pl-1">or drag and drop</span>
                        </div>
                        <p className="text-xs leading-5 text-gray-400">
                          Allowed: PNG, JPG, JPEG, WEBP, PDF, TXT. Max size:{" "}
                          {formatBytes(5 * 1024 * 1024)}
                        </p>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          ref={fileInputRef}
                          accept={ACCEPT_FILE_TYPES}
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

                    {/* File meta */}
                    {file && (
                      <div className="mt-3 flex items-start justify-between gap-3 rounded-md border p-3">
                        <div className="text-sm">
                          <div className="font-medium">{file.name}</div>
                          <div className="text-muted-foreground">
                            {file.type || "unknown"} ·{" "}
                            {formatBytes(file.size)}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={onClearFile}
                          disabled={saving}
                        >
                          Clear
                        </Button>
                      </div>
                    )}

                    {/* Preview image */}
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

                {/* Progress bar */}
                {saving && (
                  <div className="h-2 w-full overflow-hidden rounded bg-muted">
                    <div
                      className="h-2 bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!canSubmit}>
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
  )
}
