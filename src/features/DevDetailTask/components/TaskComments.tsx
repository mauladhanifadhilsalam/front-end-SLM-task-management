// src/features/DevDetailTask/components/TaskComments.tsx
import * as React from "react";
import axios from "axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IconDotsVertical, IconPencil, IconTrash } from "@tabler/icons-react";

const API_BASE = import.meta.env.VITE_API_BASE;
const unwrap = (res: any) => res?.data?.data ?? res?.data ?? null;

type UserLite = {
  id: number;
  fullName?: string;
  name?: string;
  email?: string;
  role?: string;
};

export type TaskComment = {
  id: number;
  ticketId: number;
  userId: number;
  message: string;
  createdAt: string;
  updatedAt?: string | null;
  user?: UserLite;
};

function safeUpper(x: unknown): string | null {
  if (typeof x === "string") return x.trim().toUpperCase();
  if (typeof x === "number") return String(x).trim().toUpperCase();
  return null;
}

function getCurrentUserInfo() {
  const tryParseJson = (key: string) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const obj =
    tryParseJson("user") ??
    tryParseJson("profile") ??
    tryParseJson("auth") ??
    tryParseJson("currentUser");

  const jsonId =
    obj?.id ??
    obj?.user?.id ??
    obj?.profile?.id ??
    obj?.data?.id ??
    obj?.data?.user?.id ??
    null;
  const jsonRole =
    obj?.role ??
    obj?.user?.role ??
    obj?.data?.role ??
    obj?.data?.user?.role ??
    null;

  const rawIdKey = localStorage.getItem("id");
  const rawRoleKey = localStorage.getItem("role");

  const idNum = Number(jsonId ?? rawIdKey);
  const roleStr = safeUpper(jsonRole ?? rawRoleKey);

  const meId = Number.isFinite(idNum) ? idNum : null;
  const meRole = roleStr;

  return { id: meId, role: meRole };
}

const fmtHumanTime = (iso?: string | null) => {
  if (!iso) return "-";
  const date = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60) return "baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 172800) return "kemarin";
  if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
  return date.toLocaleDateString("id-ID");
};

export default function TaskComments({ taskId }: { taskId: number }) {
  const { id: meId, role: meRole } = React.useMemo(() => getCurrentUserInfo(), []);
  const tokenHeader = React.useMemo(() => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }, []);

  const [comments, setComments] = React.useState<TaskComment[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [newMessage, setNewMessage] = React.useState("");
  const [posting, setPosting] = React.useState(false);
  const [deleting, setDeleting] = React.useState<number | null>(null);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editingValue, setEditingValue] = React.useState("");
  const [savingId, setSavingId] = React.useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<{ open: boolean; id: number; ownerId: number } | null>(null);

  const fetchComments = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/comments`, {
        params: { ticketId: taskId },
        headers: tokenHeader,
      });

      const rawPayload = unwrap(res);
      const list: any[] = Array.isArray(rawPayload) ? rawPayload : [];

      const normalized: TaskComment[] = list.map((c) => ({
        id: Number(c.id),
        ticketId: Number(c.ticketId ?? taskId),
        userId: Number(c.userId ?? 0),
        message: String(c.message ?? ""),
        createdAt: String(c.createdAt ?? new Date().toISOString()),
        updatedAt: c.updatedAt ?? null,
        user: c.user
          ? {
              id: Number(c.user.id),
              fullName: c.user.fullName ?? c.user.name ?? undefined,
              name: c.user.name ?? undefined,
              email: c.user.email ?? undefined,
              role: safeUpper(c.user.role ?? undefined) ?? undefined,
            }
          : undefined,
      }));

      normalized.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setComments(normalized);
    } catch (err: any) {
      console.error("Error fetching comments:", err?.response?.data || err);
      setError(err?.response?.data?.message || err?.message || "Gagal memuat komentar");
    } finally {
      setLoading(false);
    }
  }, [taskId, tokenHeader]);

  React.useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAdd = async () => {
    const msg = newMessage.trim();
    if (!msg) {
      toast.error("Komentar kosong", {
        description: "Tulis sesuatu di komentar"
      });
      return;
    }
    if (meId == null) {
      toast.error("Belum login", {
        description: "User ID tidak ditemukan di localStorage."
      });
      return;
    }

    const tempId = Date.now();
    const optimistic: TaskComment = {
      id: tempId,
      ticketId: taskId,
      userId: meId,
      message: msg,
      createdAt: new Date().toISOString(),
      user: { id: meId, fullName: "You", role: meRole ?? undefined },
    };

    setComments((prev) => [optimistic, ...prev]);
    setNewMessage("");
    setPosting(true);
    try {
      const payload = {
        ticketId: taskId,
        message: msg,
      };

      const res = await axios.post(`${API_BASE}/comments`, payload, {
        headers: tokenHeader,
      });

      const saved = unwrap(res) ?? {};
      setComments((prev) =>
        prev.map((c) =>
          c.id === tempId
            ? {
                ...c,
                id: Number(saved.id ?? tempId),
                createdAt: String(saved.createdAt ?? c.createdAt),
                updatedAt: saved.updatedAt ?? null,
                userId: Number(saved.userId ?? c.userId),
                user: saved.user ?? c.user,
              }
            : c
        )
      );
    } catch (err: any) {
      console.error("Failed to post comment:", err?.response?.data || err);
      const errorMsg = err?.response?.data?.message || err?.message || "Tidak bisa kirim komentar";
      toast.error("Gagal mengirim komentar", {
        description: errorMsg
      });
      setComments((prev) => prev.filter((c) => c.id !== tempId));
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id: number, ownerId: number) => {
    // Permission check dihapus sementara untuk test
    setDeleteConfirm({ open: true, id, ownerId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    const { id } = deleteConfirm;
    setDeleting(id);
    setDeleteConfirm(null);
    
    try {
      await axios.delete(`${API_BASE}/comments/${id}`, { headers: tokenHeader });
      setComments((prev) => prev.filter((c) => c.id !== id));
      toast.success("Komentar berhasil dihapus");
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Tidak bisa menghapus komentar";
      toast.error("Gagal menghapus komentar", {
        description: errorMsg
      });
      fetchComments();
    } finally {
      setDeleting(null);
    }
  };

  const startEdit = (c: TaskComment) => {
    // Permission check dihapus sementara untuk test
    setEditingId(c.id);
    setEditingValue(c.message);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue("");
  };

  const saveEdit = async (c: TaskComment) => {
    const msg = editingValue.trim();
    if (!msg) {
      toast.error("Komentar kosong", {
        description: "Isi komentar sebelum menyimpan."
      });
      return;
    }
    setSavingId(c.id);
    const prevMsg = c.message;
    setComments((prev) => prev.map((x) => (x.id === c.id ? { ...x, message: msg } : x)));
    try {
      const res = await axios.patch(
        `${API_BASE}/comments/${c.id}`,
        { message: msg },
        { headers: tokenHeader }
      );
      const saved = unwrap(res) ?? {};
      setComments((prev) =>
        prev.map((x) =>
          x.id === c.id
            ? {
                ...x,
                message: saved.message ?? msg,
                updatedAt: saved.updatedAt ?? new Date().toISOString(),
              }
            : x
        )
      );
      toast.success("Komentar berhasil diperbarui");
      cancelEdit();
    } catch (err: any) {
      setComments((prev) => prev.map((x) => (x.id === c.id ? { ...x, message: prevMsg } : x)));
      const errorMsg = err?.response?.data?.message || err?.message || "Tidak bisa menyimpan perubahan";
      toast.error("Gagal menyimpan perubahan", {
        description: errorMsg
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleCancelAdd = () => {
    setNewMessage("");
  };

  const bubbleColor = "bg-card border border-border text-card-foreground shadow-sm";
  const accentColor = "text-foreground";
  const roleBadgeVariant = "outline";

  return (
    <div className="mt-6">
      <Separator className="my-3" />
      <div className="flex items-center justify-between mb-2">
        <div className={`text-sm font-medium ${accentColor}`}>
          Diskusi Task {comments.length ? `(${comments.length})` : ""}
        </div>
      </div>

      <div className="mb-3">
        <Textarea
          placeholder="Tambahkan catatan progress atau diskusi..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          rows={3}
        />
        <div className="mt-2 flex gap-2 justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancelAdd}
            className="cursor-pointer"
          >
            Batal
          </Button>
          <Button size="sm" onClick={handleAdd} disabled={posting} className="cursor-pointer">
            {posting ? "Posting…" : "Posting"}
          </Button>
        </div>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Memuat komentar...</div>}
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {!loading && comments.length === 0 && (
        <div className="text-sm text-muted-foreground">Belum ada diskusi.</div>
      )}

      <div className="space-y-3">
        {comments.map((c) => {
          const name = c.user?.fullName || c.user?.name || c.user?.email || `User#${c.userId}`;
          const isAdmin = meRole === "ADMIN";
          const isOwner = meId != null && Number(meId) === Number(c.userId);
          const canModify = isAdmin || isOwner;

          return (
            <div
              key={c.id}
              className={`rounded-md p-3 flex flex-col gap-2 ${bubbleColor} hover:shadow transition-shadow`}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-2 items-center flex-1">
                  <span className="font-medium text-sm">{name}</span>
                  {c.user?.role && (
                    <Badge variant={roleBadgeVariant} className="uppercase">
                      {c.user.role}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {fmtHumanTime(c.updatedAt || c.createdAt)}
                    {c.updatedAt && c.updatedAt !== c.createdAt ? " • (diedit)" : ""}
                  </span>

                  {/* TEMPORARY: Selalu tampilkan untuk test - nanti kita kembalikan kondisinya */}
                  {editingId !== c.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button 
                          className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 flex-shrink-0"
                          aria-label="Actions"
                        >
                          <IconDotsVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => startEdit(c)} className="cursor-pointer gap-2">
                          <IconPencil className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(c.id, c.userId)}
                          className="cursor-pointer gap-2 text-red-600"
                          disabled={deleting === c.id}
                        >
                          <IconTrash className="h-4 w-4" />
                          {deleting === c.id ? "Menghapus..." : "Hapus"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              {editingId === c.id ? (
                <div className="flex flex-col gap-2">
                  <Textarea
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={cancelEdit} disabled={savingId === c.id}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={() => saveEdit(c)} disabled={savingId === c.id}>
                      {savingId === c.id ? "Saving…" : "Save"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm whitespace-pre-wrap leading-relaxed">{c.message}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm?.open ?? false} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus komentar?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini tidak dapat dibatalkan. Komentar akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Ya, hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
