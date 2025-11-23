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
import { Textarea } from "@/components/ui/textarea"
import { IconCheck } from "@tabler/icons-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import {
  Command,
  CommandList,
  CommandInput,
  CommandEmpty,
  CommandItem,
} from "@/components/ui/command"
import type { TicketLite } from "@/types/ticket-type"
import type { CreateCommentField } from "../hooks/use-create-comment-form"

type FormState = {
  ticketId: string
  message: string
}

type FieldErrors = Partial<Record<CreateCommentField, string>>

type Props = {
  form: FormState
  fieldErrors: FieldErrors
  saving: boolean
  error: string | null
  tickets: TicketLite[]
  ticketsLoading: boolean
  ticketsError: string | null
  comboboxOpen: boolean
  onComboboxOpenChange: (open: boolean) => void
  ticketLabel: string
  onChange: (field: CreateCommentField, value: string) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export const CreateCommentForm: React.FC<Props> = ({
  form,
  fieldErrors,
  saving,
  error,
  tickets,
  ticketsLoading,
  ticketsError,
  comboboxOpen,
  onComboboxOpenChange,
  ticketLabel,
  onChange,
  onSubmit,
  onCancel,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comment Information</CardTitle>
        <CardDescription>
          Choose the ticket and write your message
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label>Ticket *</Label>
            <Popover open={comboboxOpen} onOpenChange={onComboboxOpenChange}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between"
                  disabled={ticketsLoading || saving}
                  aria-invalid={!!fieldErrors.ticketId}
                >
                  {ticketsLoading
                    ? "Loading tickets…"
                    : ticketLabel || "Select a ticket"}
                  <span className="opacity-60">▾</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                <Command shouldFilter>
                  <CommandInput placeholder="Search ticket by id/title/project…" />
                  <CommandList>
                    <CommandEmpty>
                      {ticketsLoading
                        ? "Loading…"
                        : ticketsError || "No tickets found"}
                    </CommandEmpty>
                    {tickets.map((t) => {
                      const label = `#${t.id} · ${t.title ?? "Untitled"}${
                        t.project?.name ? ` — ${t.project?.name}` : ""
                      }`
                      return (
                        <CommandItem
                          key={t.id}
                          value={label}
                          onSelect={() => {
                            onChange("ticketId", String(t.id))
                            onComboboxOpenChange(false)
                          }}
                        >
                          {label}
                        </CommandItem>
                      )
                    })}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {fieldErrors.ticketId && (
              <p className="text-xs text-red-600 mt-1">
                {fieldErrors.ticketId}
              </p>
            )}
            {ticketsError && !fieldErrors.ticketId && (
              <p className="text-xs text-red-600 mt-1">
                {ticketsError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              rows={4}
              placeholder="Type your comment…"
              value={form.message}
              onChange={(e) => onChange("message", e.target.value)}
              disabled={saving}
              aria-invalid={!!fieldErrors.message}
              required
            />
            <div className="flex items-center justify-between">
              {fieldErrors.message ? (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.message}
                </p>
              ) : (
                <span className="text-xs text-muted-foreground mt-1">
                  Max 2000 characters
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
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
              {saving ? "Creating..." : "Create Comment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
