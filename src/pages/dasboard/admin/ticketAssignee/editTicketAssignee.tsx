"use client";

import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
// import axios from "axios"; // ❌ Dihapus karena menggunakan data dummy
import Swal from "sweetalert2";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";

// Definisikan tipe untuk data yang akan diambil/dikirim
interface TicketForm {
  title: string;
  currentAssigneeId: string; // ID Penanggung Jawab saat ini
  status: string;           // Status Tiket saat ini
  notes: string;            // Catatan tambahan jika perlu
}

// Data dummy/contoh untuk pilihan Assignee dan Status (Ini tetap digunakan)
const ASSIGNEE_OPTIONS = [
  { id: "1", name: "Budi Santoso" },
  { id: "2", name: "Dewi Lestari" },
  { id: "3", name: "Ahmad Malik" },
];

const STATUS_OPTIONS = [
  "Open",
  "In Progress",
  "Testing",
  "Closed",
  "Need Info",
];

// --- DATA DUMMY TIKET UNTUK SIMULASI PENGAMBILAN DATA ---
const DUMMY_TICKET_DATA = [
    {
        id: "1",
        title: "Bug: Gagal Login di Chrome Mobile",
        assigneeId: "user-1", // Awalnya ditugaskan ke Budi
        status: "In Progress", // Status awal
        notes: "Tim sudah mulai melakukan debugging pada bagian autentikasi.",
    },
    {
        id: "2",
        title: "Permintaan Fitur: Export Laporan PDF",
        assigneeId: "user-2", // Awalnya ditugaskan ke Dewi
        status: "Open",
        notes: "Fitur ini memiliki prioritas tinggi di Q4.",
    },
    {
        id: "3",
        title: "Database Server Low Memory",
        assigneeId: "user-3", // Awalnya ditugaskan ke Ahmad
        status: "Testing",
        notes: "Sudah dilakukan scaling, perlu monitoring selama 24 jam.",
    },
];
// --- AKHIR DATA DUMMY TIKET ---


export default function TicketAssignee() {
  const { id } = useParams<{ id: string }>(); // ID Tiket
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const [form, setForm] = React.useState<TicketForm>({
    title: "",
    currentAssigneeId: "",
    status: "",
    notes: "",
  });

//   const API_BASE = "http://localhost:3000"; // ❌ Dihapus

  // 🔄 Fetch ticket data by ID (Menggunakan Data Dummy)
  React.useEffect(() => {
    const fetchTicket = async () => {
      if (!id) return;
      try {
        setLoading(true);

        // Simulasikan penundaan API
        await new Promise(resolve => setTimeout(resolve, 500));

        const d = DUMMY_TICKET_DATA.find(t => t.id === id);

        if (d) {
             // Memetakan data dummy ke state form
            setForm({
              title: d.title,
              currentAssigneeId: d.assigneeId,
              status: d.status,
              notes: d.notes,
            });
        } else {
             setError(`Tiket dengan ID ${id} tidak ditemukan di data dummy.`);
        }

      } catch (err: any) {
        // Ini hanya untuk error saat proses fetching dummy gagal (jarang terjadi)
        setError("Gagal memuat data tiket dari dummy.");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  // 🔹 Handle input changes
  const handleChange = (field: keyof TicketForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // 💾 Submit form (Simulasi)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSaving(true);
    setError("");

    try {
        // Simulasikan penundaan API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Cek data yang dikirim (hanya untuk debugging dummy)
        console.log(`SIMULASI UPDATE TIKET #${id}:`, form);

        await Swal.fire({
          title: "Berhasil (Simulasi)",
          text: `Penanggung jawab tiket "${form.title}" berhasil diubah secara lokal.`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        // Kembali ke halaman daftar tiket atau detail tiket
        navigate("/admin/dashboard/tickets");
    } catch (err: any) {
        // Simulasikan error jika perlu
        setError("Gagal menyimpan perubahan secara simulasi. Cek konsol untuk detail form.");
        await Swal.fire({
          title: "Gagal (Simulasi)",
          text: "Terjadi kesalahan saat menyimpan perubahan tiket dummy.",
          icon: "error",
        });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col px-4 lg:px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/dashboard/tickets")}
              className="flex items-center gap-2"
            >
              <IconArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
          </div>

          <h1 className="text-2xl font-semibold">Kelola Tiket 🎫 (Data Dummy): {form.title}</h1>
          <p className="text-muted-foreground mb-6">
            Ubah penanggung jawab dan status tiket di sini.
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Penugasan Tiket</CardTitle>
              <CardDescription>
                Pilih penanggung jawab baru dan perbarui status tiket.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="rounded border p-6">Memuat data tiket dummy...</div>
              ) : error ? (
                <div className="rounded border p-4 mb-4 text-sm text-red-600">
                  {error}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Ticket Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Nama Tiket</Label>
                      <Input value={form.title} disabled />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="assignee">Penanggung Jawab *</Label>
                      <Select
                        value={form.currentAssigneeId}
                        onValueChange={(value) => handleChange("currentAssigneeId", value)}
                        disabled={saving}
                      >
                        <SelectTrigger id="assignee">
                          <SelectValue placeholder="Pilih Penanggung Jawab" />
                        </SelectTrigger>
                        <SelectContent>
                          {ASSIGNEE_OPTIONS.map((assignee) => (
                            <SelectItem key={assignee.id} value={assignee.id}>
                              {assignee.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status Tiket *</Label>
                      <Select
                        value={form.status}
                        onValueChange={(value) => handleChange("status", value)}
                        disabled={saving}
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Pilih Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label>Catatan / Notes Update</Label>
                    <Textarea
                      value={form.notes}
                      onChange={(e) => handleChange("notes", e.target.value)}
                      placeholder="Tambahkan catatan terkait perubahan status/assignee..."
                      disabled={saving}
                    />
                  </div>


                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/admin/dashboard/tickets")}
                      disabled={saving}
                    >
                      Batal
                    </Button>
                    <Button type="submit" disabled={saving}>
                      <IconCheck className="mr-2 h-4 w-4" />
                      {saving ? "Menyimpan..." : "Simpan Perubahan (Simulasi)"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}