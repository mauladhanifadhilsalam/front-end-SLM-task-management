import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Swal from "sweetalert2";
import { IconTrash, IconEdit, IconEye, IconLayoutGrid, IconChevronDown } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

type Role = "admin" | "project_manager" | "developer";
export type User = {
  id: number;
  fullName: string;
  email: string;
  passwordHash: string;
  role: Role;
};

export default function AdminUsers() {
    const [users, setUsers] = React.useState<User[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string>("");
    const navigate = useNavigate();

    // filter & columns state
    const [q, setQ] = React.useState<string>("");
    const [roleFilter, setRoleFilter] = React.useState<string>("all");
    const [cols, setCols] = React.useState({
      id: true,
      fullName: true,
      email: true,
      passwordHash: false,
      role: true,
      actions: true,
    });

    const API_BASE = "http://localhost:3000";

    const fetchUsers = async () => {
        try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        const res = await axios.get<User[] | any>(`${API_BASE}/users`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        // Normalisasi kalau backend pakai snake_case
        const raw: any[] = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const normalized: User[] = raw.map((u) => ({
            id: Number(u.id),
            fullName: u.fullName,
            email: u.email,
            passwordHash: u.passwordHash,
            role: (u.role as Role) ?? "developer",
        }));

        const sorted = normalized.slice().sort((a, b) => a.id - b.id);
        setUsers(sorted);
        } catch (e: any) {
        setError(e?.response?.data?.message || "Gagal memuat data users");
        } finally {
        setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        const confirm = await Swal.fire({
            title: "Hapus user?",
            text: `Yakin ingin menghapus user? Tindakan ini tidak dapat dikembalikan.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, hapus",
            cancelButtonText: "Batal",
            reverseButtons: true,
        });

        if (!confirm.isConfirmed) return;

        const prev = users;
        setUsers((u) => u.filter((x) => x.id !== id));

        try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_BASE}/users/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        await Swal.fire({
            title: "Terhapus",
            text: `User #${id} berhasil dihapus.`,
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
        });
        } catch (e: any) {
        // revert state jika gagal
        setUsers(prev);
        const msg = e?.response?.data?.message || `Gagal menghapus user`;
        setError(msg);
        await Swal.fire({
            title: "Gagal",
            text: msg,
            icon: "error",
        });
        }
    };

    React.useEffect(() => {
        fetchUsers();
    }, []);

    const formatDate = (iso: string) => {
        try {
        const d = new Date(iso);
        return d.toLocaleString("id-ID");
        } catch {
        return iso;
        }
    };

    // client-side filtered list
    const filteredUsers = React.useMemo(() => {
      const ql = q.trim().toLowerCase();
      return users.filter((u) => {
        if (roleFilter !== "all" && u.role !== roleFilter) return false;
        if (!ql) return true;
        return (
          String(u.fullName).toLowerCase().includes(ql) ||
          String(u.email).toLowerCase().includes(ql)
        );
      });
    }, [users, q, roleFilter]);

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
                    <div className="flex items-center justify-between">
                        <div>
                        <h1 className="text-2xl font-semibold">Data Users</h1>
                        <p className="text-muted-foreground">Kelola users di sini.</p>
                        </div>
                        <Button
                        size="sm"
                        onClick={() => navigate("/admin/dashboard/users/create")}
                        >
                        <IconPlus className="mr-2 h-4 w-4" />
                        Add User
                        </Button>
                    </div>
                    </div>

                    <div className="px-4 lg:px-6">
                      {/* controls: search, role filter, columns */}
                        <div className="flex gap-3 items-center mb-4">
                            <Input
                            placeholder="Filter by name or email..."
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            className="w-80"
                            />
                            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v)}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Filter by role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All roles</SelectItem>
                                <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
                                <SelectItem value="DEVELOPER">Developer</SelectItem>
                            </SelectContent>
                            </Select>

                            <div className="ml-auto">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" className="flex items-center gap-2">
                                    <IconLayoutGrid className="h-4 w-4" />
                                    <span>Columns</span>
                                    <IconChevronDown className="h-4 w-4 ml-1" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuCheckboxItem
                                    checked={cols.id}
                                    onCheckedChange={(v) => setCols((c) => ({ ...c, id: !!v }))}
                                  >
                                    ID
                                  </DropdownMenuCheckboxItem>
                                  <DropdownMenuCheckboxItem
                                    checked={cols.fullName}
                                    onCheckedChange={(v) => setCols((c) => ({ ...c, fullName: !!v }))}
                                  >
                                    Full name
                                  </DropdownMenuCheckboxItem>
                                  <DropdownMenuCheckboxItem
                                    checked={cols.email}
                                    onCheckedChange={(v) => setCols((c) => ({ ...c, email: !!v }))}
                                  >
                                    Email
                                  </DropdownMenuCheckboxItem>
                                  <DropdownMenuCheckboxItem
                                    checked={cols.passwordHash}
                                    onCheckedChange={(v) => setCols((c) => ({ ...c, passwordHash: !!v }))}
                                  >
                                    Password
                                  </DropdownMenuCheckboxItem>
                                  <DropdownMenuCheckboxItem
                                    checked={cols.role}
                                    onCheckedChange={(v) => setCols((c) => ({ ...c, role: !!v }))}
                                  >
                                    Role
                                  </DropdownMenuCheckboxItem>
                                  <DropdownMenuCheckboxItem
                                    checked={cols.actions}
                                    onCheckedChange={(v) => setCols((c) => ({ ...c, actions: !!v }))}
                                  >
                                    Actions
                                  </DropdownMenuCheckboxItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                        </div>

                        {loading ? (
                            <div className="rounded border p-6">Memuat data...</div>
                        ) : error ? (
                            <div className="rounded border p-6 text-red-600">{error}</div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="rounded border p-6">Belum ada data.</div>
                        ) : (
                            <div className="overflow-x-auto rounded border">
                            <table className="min-w-full text-sm">
                                <thead className="bg-muted/50">
                                <tr className="text-center">
                                    {cols.id && <th className="px-4 py-3 font-medium">ID</th>}
                                    {cols.fullName && <th className="px-4 py-3 font-medium">FullName</th>}
                                    {cols.email && <th className="px-4 py-3 font-medium">Email</th>}
                                    {cols.passwordHash && <th className="px-4 py-3 font-medium">Password</th>}
                                    {cols.role && <th className="px-4 py-3 font-medium">Role</th>}
                                    {cols.actions && <th className="px-4 py-3 font-medium">Actions</th>}
                                </tr>
                                </thead>
                                <tbody>
                                {filteredUsers.map((u) => (
                                    <tr key={u.id} className="border-t text-center">
                                    {cols.id && <td className="px-4 py-3">{u.id}</td>}
                                    {cols.fullName && <td className="px-4 py-3">{u.fullName}</td>}
                                    {cols.email && <td className="px-4 py-3">{u.email}</td>}
                                    {cols.passwordHash && <td className="px-4 py-3">{u.passwordHash}</td>}
                                    {cols.role && (
                                    <td className="px-4 py-3">
                                        <span className="">
                                        {u.role.replace("_", " ")}
                                        </span>
                                    </td>
                                    )}
                                    {cols.actions && (
                                    <td className="px-4 py-3">
                                        <div className="flex">
                                            <Link
                                                to={`/admin/dashboard/users/view/${u.id}`}
                                                className="mr-4"
                                            >
                                                <IconEye className="inline h-4 w-4 mr-1" />
                                            </Link>
                                            <Link
                                                to={`/admin/dashboard/users/edit/${u.id}`}
                                                className=""
                                            >
                                                <IconEdit className="inline h-4 w-4 mr-1" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(u.id)}
                                                className="px-3 text-red-600 cursor-pointer"
                                            >
                                                <IconTrash className="inline h-4 w-4 mr-1" />
                                            </button>
                                        </div>
                                    </td>
                                    )}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
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
