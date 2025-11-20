import * as React from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

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
} from "@/components/ui/alert-dialog";


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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconArrowLeft, IconEdit, IconTrash, IconEye } from "@tabler/icons-react";

const API_BASE = import.meta.env.VITE_API_BASE;

type UserLite = {
  id: number;
  fullName?: string;
  name?: string;
  email?: string;
  role?: string;
};

type TicketLite = {
  id: number;
  title?: string;
  project?: { id: number; name?: string } | null;
};

type CommentDetail = {
  id: number;
  ticketId: number;
  userId: number;
  message: string;
  createdAt?: string;
  updatedAt?: string;
  user?: UserLite | null;
  ticket?: TicketLite | null;
};

function formatDate(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// amanin berbagai bentuk payload
function normalizeComment(raw: any): CommentDetail {
  return {
    id: Number(raw.id),
    ticketId: Number(raw.ticketId ?? raw.ticket_id ?? raw.ticket?.id ?? 0),
    userId: Number(raw.userId ?? raw.user_id ?? raw.user?.id ?? 0),
    message: String(raw.message ?? ""),
    createdAt: raw.createdAt ?? raw.created_at,
    updatedAt: raw.updatedAt ?? raw.updated_at,
    user: raw.user
      ? {
          id: Number(raw.user.id),
          fullName: raw.user.fullName ?? raw.user.name ?? undefined,
          name: raw.user.name ?? undefined,
          email: raw.user.email ?? undefined,
          role: raw.user.role ?? undefined,
        }
      : null,
    ticket: raw.ticket
      ? {
          id: Number(raw.ticket.id),
          title: raw.ticket.title ?? undefined,
          project: raw.ticket.project
            ? {
                id: Number(raw.ticket.project.id),
                name: raw.ticket.project.name ?? undefined,
              }
            : null,
        }
      : { id: Number(raw.ticketId ?? raw.ticket_id ?? 0) },
  };
}

export default function ViewComments() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [comment, setComment] = React.useState<CommentDetail | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [deleting, setDeleting] = React.useState(false);

    const tokenHeader = React.useMemo(() => {
        const token = localStorage.getItem("token");
        return token ? { Authorization: `Bearer ${token}` } : undefined;
    }, []);

    React.useEffect(() => {
        const fetchComment = async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_BASE}/comments/${id}`, {
            headers: tokenHeader,
            });
            const data = res.data?.data ?? res.data;
            setComment(normalizeComment(data));
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to load comment details");
        } finally {
            setLoading(false);
        }
        };
        fetchComment();
    }, [id, tokenHeader]);

   const handleDelete = async () => {
        if (!comment) return;

        setDeleting(true);
        setError(null);

        try {
            await axios.delete(`${API_BASE}/comments/${comment.id}`, {
            headers: tokenHeader,
            });

            toast.success("Comment deleted", {
            description: `Comment #${comment.id} has been deleted successfully.`,
            });

            navigate("/admin/dashboard/comments");
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Failed to delete comment";
            setError(msg);
            toast.error("Failed to delete comment", {
            description: msg,
            });
            setDeleting(false);
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
                    {/* Header */}
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

                        {comment && (
                        <div className="ml-auto flex items-center gap-2">
                            <Link to={`/admin/dashboard/comments/edit/${comment.id}`}>
                            <Button size="sm" variant="outline" className="flex items-center gap-2">
                                <IconEdit className="h-4 w-4" />
                                Edit
                            </Button>
                            </Link>
                                <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                    size="sm"
                                    variant="destructive"
                                    disabled={deleting}
                                    className="flex items-center gap-2"
                                    >
                                    <IconTrash className="h-4 w-4" />
                                    Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Delete comment?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete comment #{comment.id}? This action cannot be undone.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="bg-red-600 focus:ring-red-600 hover:bg-red-700"
                                    >
                                        {deleting ? "Deleting..." : "Delete"}
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                                </AlertDialog>

                        </div>
                        )}
                    </div>

                    <h1 className="text-2xl font-semibold">Comment Details</h1>
                    <p className="text-muted-foreground">View ticket comment information</p>
                    </div>

                    {/* Body */}
                    <div className="px-4 lg:px-6">
                    {loading ? (
                        <Card>
                        <CardContent className="p-6">
                            <div className="animate-pulse space-y-3">
                            <div className="h-6 w-48 bg-muted/30 rounded" />
                            <div className="h-4 w-full bg-muted/30 rounded" />
                            <div className="h-4 w-2/3 bg-muted/30 rounded" />
                            </div>
                        </CardContent>
                        </Card>
                    ) : error ? (
                        <div className="rounded border p-6 text-red-600">{error}</div>
                    ) : !comment ? (
                        <div className="rounded border p-6">Comment not found</div>
                    ) : (
                        <div className="grid gap-4">
                        <Card>
                            <CardHeader>
                            <CardTitle>Comment #{comment.id}</CardTitle>
                            <CardDescription>Comment Information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                            {/* Basic */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                <div className="text-sm text-muted-foreground">Ticket</div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">#{comment.ticketId}</Badge>
                                    {comment.ticket?.title && (
                                    <span className="text-muted-foreground">{comment.ticket.title}</span>
                                    )}
                                    <Link
                                    to={`/admin/dashboard/tickets/view/${comment.ticket?.id ?? comment.ticketId}`}
                                    className="inline-flex ml-1"
                                    title="View Ticket"
                                    >
                                    <IconEye className="h-4 w-4" />
                                    </Link>
                                </div>
                                {comment.ticket?.project?.name && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                    Project: {comment.ticket.project.name}
                                    </div>
                                )}
                                </div>

                                <div>
                                <div className="text-sm text-muted-foreground">User</div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                    {comment.user?.fullName ||
                                        comment.user?.name ||
                                        comment.user?.email ||
                                        `User#${comment.userId}`}
                                    </span>
                                    {comment.user?.role && (
                                    <Badge variant="outline" className="uppercase">
                                        {comment.user.role}
                                    </Badge>
                                    )}
                                </div>
                                {comment.user?.email && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                    {comment.user.email}
                                    </div>
                                )}
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <div className="text-sm text-muted-foreground mb-1">Message</div>
                                <div className="rounded border bg-muted/20 p-3 whitespace-pre-wrap">
                                {comment.message || "-"}
                                </div>
                            </div>

                            {/* Timestamps */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                <div className="text-sm text-muted-foreground">Created At</div>
                                <div className="font-medium">{formatDate(comment.createdAt)}</div>
                                </div>
                                <div>
                                <div className="text-sm text-muted-foreground">Last Updated</div>
                                <div className="font-medium">{formatDate(comment.updatedAt)}</div>
                                </div>
                            </div>
                            </CardContent>
                        </Card>
                        </div>
                    )}
                    </div>
                </div>
                </div>
            </div>
            </SidebarInset>
        </SidebarProvider>
        </div>
    );
}
