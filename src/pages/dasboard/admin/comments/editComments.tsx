import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";

import {
  editCommentSchema,
  type EditCommentValues as EditValues,
  type EditCommentField as EditField,
} from "@/schemas/comments.schema";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function EditComments() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState<EditValues>({
    ticketId: 0,
    message: "",
  });

  const [fieldErrors, setFieldErrors] = React.useState<Partial<Record<EditField, string>>>({});

  const tokenHeader = React.useMemo(() => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }, []);

  React.useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      setFieldErrors({});
      try {
        const res = await axios.get(`${API_BASE}/comments/${id}`, { headers: tokenHeader });
        const data = res?.data?.data ?? res?.data ?? {};
        setForm({
          ticketId: Number(data.ticketId ?? data.ticket_id ?? data.ticket?.id ?? 0),
          message: String(data.message ?? ""),
        });
      } catch (err: any) {
        const msg = err?.response?.data?.message || "Failed to load comment";
        setError(msg);
        toast.error("Failed to load comment", {
            description: msg,
          });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, tokenHeader]);

  const handleChange = (field: EditField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value as any }));
    if (fieldErrors[field]) {
      const single = editCommentSchema.pick({ [field]: true } as any);
      const payload = field === "ticketId" ? { ticketId: Number(value) } : { [field]: value };
      const res = single.safeParse(payload);
      setFieldErrors((fe) => ({
        ...fe,
        [field]: res.success ? undefined : res.error.issues[0]?.message,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSaving(true);
    setError(null);
    setFieldErrors({});

    const parsed = editCommentSchema.safeParse(form);
    if (!parsed.success) {
      const fe: Partial<Record<EditField, string>> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as EditField;
        if (!fe[k]) fe[k] = issue.message;
      }
      setFieldErrors(fe);
      setSaving(false);
      return;
    }

    try {
      await axios.patch(`${API_BASE}/comments/${id}`, parsed.data, {
        headers: { "Content-Type": "application/json", ...(tokenHeader ?? {}) },
      });
      toast.success("Comment updated successfully", {
        description: "Your changes have been saved.",
      });
      navigate("/admin/dashboard/comments");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to update comment";
      setError(msg);
       toast.error("Failed to update comment", {
        description: msg,
      });
    } finally {
      setSaving(false);
    }
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
                    <h1 className="text-2xl font-semibold">Edit Comment</h1>
                    <p className="text-muted-foreground">Update comment details</p>
                    </div>

                    <div className="px-4 lg:px-6">
                    <Card>
                        <CardHeader>
                        <CardTitle>Comment Information</CardTitle>
                        <CardDescription>Modify the fields below</CardDescription>
                        </CardHeader>
                        <CardContent>
                        {loading ? (
                            <div className="rounded border p-6">Loading comment...</div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
                                value={String(form.ticketId ?? "")}
                                onChange={(e) => handleChange("ticketId", e.target.value)}
                                disabled={saving}
                                aria-invalid={!!fieldErrors.ticketId}
                                required
                                />
                                {fieldErrors.ticketId && (
                                <p className="text-xs text-red-600 mt-1">{fieldErrors.ticketId}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Message *</Label>
                                <Textarea
                                id="message"
                                rows={6}
                                value={form.message}
                                onChange={(e) => handleChange("message", e.target.value)}
                                placeholder="Write your comment..."
                                disabled={saving}
                                aria-invalid={!!fieldErrors.message}
                                required
                                />
                                {fieldErrors.message && (
                                <p className="text-xs text-red-600 mt-1">{fieldErrors.message}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3">
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
                                {saving ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                            </form>
                        )}
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
