import * as React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";

// shadcn combobox primitives
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandList,
  CommandInput,
  CommandEmpty,
  CommandItem,
} from "@/components/ui/command";

import {
  createCommentSchema,
  type CreateCommentValues,
  type CreateCommentField,
} from "@/schemas/comments.schema";

const API_BASE = import.meta.env.VITE_API_BASE;

type TicketLite = {
  id: number;
  title?: string;
  project?: { id: number; name?: string } | null;
};

const normalizeArray = (raw: any): any[] => {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.items)) return raw.items;
  if (Array.isArray(raw?.tickets)) return raw.tickets;
  if (Array.isArray(raw?.data?.items)) return raw.data.items;
  if (Array.isArray(raw?.data?.tickets)) return raw.data.tickets;
  if (raw && typeof raw === "object") return [raw];
  return [];
};

export default function CreateComments() {
    const navigate = useNavigate();

    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // form state (ticketId disimpan string; Zod akan transform -> number)
    const [form, setForm] = React.useState<CreateCommentValues>({
        ticketId: "" as unknown as number,
        message: "",
    });

    const [fieldErrors, setFieldErrors] = React.useState<
        Partial<Record<CreateCommentField, string>>
    >({});

    // tickets for combobox
    const [tickets, setTickets] = React.useState<TicketLite[]>([]);
    const [ticketsLoading, setTicketsLoading] = React.useState<boolean>(false);
    const [ticketsError, setTicketsError] = React.useState<string | null>(null);
    const [cbOpen, setCbOpen] = React.useState<boolean>(false);

    const tokenHeader = React.useMemo(() => {
        const token = localStorage.getItem("token");
        return token ? { Authorization: `Bearer ${token}` } : undefined;
    }, []);

    const fetchTickets = React.useCallback(async () => {
        setTicketsLoading(true);
        setTicketsError(null);
        try {
        const res = await axios.get(`${API_BASE}/tickets`, {
            headers: tokenHeader,
        });
        const arr = normalizeArray(res?.data);
        const list: TicketLite[] = arr.map((t: any) => ({
            id: Number(t.id),
            title: t.title ?? undefined,
            project: t.project
            ? { id: Number(t.project.id), name: t.project.name ?? undefined }
            : null,
        }));
        // sort by id desc (opsional)
        list.sort((a, b) => b.id - a.id);
        setTickets(list);
        } catch (e: any) {
        setTicketsError(e?.response?.data?.message || "Failed to load tickets");
        } finally {
        setTicketsLoading(false);
        }
    }, [tokenHeader]);

    React.useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const handleChange = (field: CreateCommentField, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value as any }));
        if (fieldErrors[field]) {
        const single = (createCommentSchema as any).pick({ [field]: true });
        const normalized =
            field === "ticketId" ? { [field]: Number(value) } : { [field]: value };
        const res = single.safeParse(normalized);
        setFieldErrors((fe) => ({
            ...fe,
            [field]: res.success ? undefined : res.error.issues[0]?.message,
        }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSaving(true);
        setFieldErrors({});

        const parsed = createCommentSchema.safeParse(form);
        if (!parsed.success) {
        const fe: Partial<Record<CreateCommentField, string>> = {};
        for (const issue of parsed.error.issues) {
            const k = issue.path[0] as CreateCommentField;
            if (!fe[k]) fe[k] = issue.message;
        }
        setFieldErrors(fe);
        setSaving(false);
        return;
        }

        try {
        const payload = parsed.data; // { ticketId: number, message: string }

        await axios.post(`${API_BASE}/comments`, payload, {
            headers: {
            "Content-Type": "application/json",
            ...(tokenHeader ?? {}),
            },
        });

        await Swal.fire({
            title: "Success",
            text: "Comment created successfully",
            icon: "success",
            timer: 1400,
            showConfirmButton: false,
        });

        navigate("/admin/dashboard/comments");
        } catch (err: any) {
        const msg = err?.response?.data?.message || "Failed to create comment";
        setError(msg);
        await Swal.fire({ title: "Error", text: msg, icon: "error" });
        } finally {
        setSaving(false);
        }
    };

    // helper untuk label combobox
    const ticketLabel = React.useMemo(() => {
        const idNum = Number(form.ticketId);
        const t = tickets.find((x) => x.id === idNum);
        if (!t) return "";
        const base = t.title ? t.title : `Ticket #${t.id}`;
        const suffix = t.project?.name ? ` — ${t.project?.name}` : "";
        return `#${t.id} · ${base}${suffix}`;
    }, [form.ticketId, tickets]);

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
                <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <div className="px-4 lg:px-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/admin/dashboard/comments")}
                        className="flex items-center gap-2"
                        >
                        <IconArrowLeft className="h-4 w-4" />
                        Back
                        </Button>
                    </div>
                    <h1 className="text-2xl font-semibold">Create Comment</h1>
                    <p className="text-muted-foreground">
                        Add a new comment to a ticket
                    </p>
                    </div>

                    <div className="px-4 lg:px-6">
                    <Card>
                        <CardHeader>
                        <CardTitle>Comment Information</CardTitle>
                        <CardDescription>Choose the ticket and write your message</CardDescription>
                        </CardHeader>
                        <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                            {error && (
                            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                                {error}
                            </div>
                            )}

                            {/* Ticket (Combobox) */}
                            <div className="space-y-2">
                            <Label>Ticket *</Label>
                            <Popover open={cbOpen} onOpenChange={setCbOpen}>
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
                                <Command shouldFilter={true}>
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
                                        }`;
                                        return (
                                        <CommandItem
                                            key={t.id}
                                            value={label}
                                            onSelect={() => {
                                            handleChange("ticketId", String(t.id));
                                            setCbOpen(false);
                                            }}
                                        >
                                            {label}
                                        </CommandItem>
                                        );
                                    })}
                                    </CommandList>
                                </Command>
                                </PopoverContent>
                            </Popover>
                            {fieldErrors.ticketId && (
                                <p className="text-xs text-red-600 mt-1">{fieldErrors.ticketId}</p>
                            )}
                            {ticketsError && !fieldErrors.ticketId && (
                                <p className="text-xs text-red-600 mt-1">{ticketsError}</p>
                            )}
                            </div>

                            {/* Message */}
                            <div className="space-y-2">
                            <Label htmlFor="message">Message *</Label>
                            <Textarea
                                id="message"
                                rows={4}
                                placeholder="Type your comment…"
                                value={form.message}
                                onChange={(e) => handleChange("message", e.target.value)}
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
                                onClick={() => navigate("/admin/dashboard/comments")}
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
                    </div>
                </div>
                </div>
            </div>
            </SidebarInset>
        </SidebarProvider>
        </div>
    );
}
