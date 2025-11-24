import * as React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { IconCheck } from "@tabler/icons-react"
import type { EditCommentField } from "../hooks/use-edit-comment-form"

type FormState = {
  ticketId: string
  message: string
}

type FieldErrors = Partial<Record<EditCommentField, string>>

type Props = {
  loading: boolean
  saving: boolean
  error: string | null
  form: FormState
  fieldErrors: FieldErrors
  onChange: (field: EditCommentField, value: string) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export const EditCommentForm: React.FC<Props> = ({
  loading,
  saving,
  error,
  form,
  fieldErrors,
  onChange,
  onSubmit,
  onCancel,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comment Information</CardTitle>
        <CardDescription>Modify the fields below</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="rounded border p-6">
            Loading comment...
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6" noValidate>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="ticketId">Ticket ID *</Label>
              <Input
                id="ticketId"
                type="number"
                min={1}
                value={form.ticketId}
                onChange={(e) => onChange("ticketId", e.target.value)}
                disabled={saving}
                aria-invalid={!!fieldErrors.ticketId}
                required
              />
              {fieldErrors.ticketId && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.ticketId}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                rows={6}
                value={form.message}
                onChange={(e) => onChange("message", e.target.value)}
                placeholder="Write your comment..."
                disabled={saving}
                aria-invalid={!!fieldErrors.message}
                required
              />
              {fieldErrors.message && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                <IconCheck className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
