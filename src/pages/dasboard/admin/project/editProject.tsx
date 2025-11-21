"use client";

import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
  CalendarIcon,
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";

interface PhaseData {
  id?: number;
  name: string;
  startDate?: Date;
  endDate?: Date;
}

const PROJECT_STATUSES = [
    "NOT_STARTED", 
    "IN_PROGRESS",
    "ON_HOLD",
    "DONE",
] as const;

type ProjectStatus = typeof PROJECT_STATUSES[number];

interface FormData {
  name: string;
  categories: string[]; 
  ownerId: number | undefined;
  startDate: Date | undefined;
  endDate: Date | undefined;
  status: ProjectStatus;
  completion: string; // ✅ String untuk support desimal input
  notes: string;
  ownerName: string;
  ownerCompany: string;
}

const API_BASE = import.meta.env.VITE_API_BASE;

export default function EditProject() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const [formData, setFormData] = React.useState<FormData>({
    name: "",
    categories: [],
    ownerId: undefined,
    startDate: undefined,
    endDate: undefined,
    status: "NOT_STARTED",
    completion: "0",
    notes: "",
    ownerName: "",
    ownerCompany: "",
  });

  const [phases, setPhases] = React.useState<PhaseData[]>([]);
  const [deletedPhaseIds, setDeletedPhaseIds] = React.useState<number[]>([]);

  const isInvalidProjectDateRange =
    formData.startDate &&
    formData.endDate &&
    formData.endDate <= formData.startDate;

  const getInvalidPhaseIndex = () => {
    const projectStartDate = formData.startDate;
    const projectEndDate = formData.endDate;

    return phases.findIndex((p) => {
      if (p.startDate && p.endDate && p.endDate <= p.startDate) {
        return true;
      }
      if (
        projectStartDate && p.startDate && p.startDate < projectStartDate
      ) {
        return true;
      }
      if (
        projectEndDate && p.endDate && p.endDate > projectEndDate
      ) {
        return true;
      }
      if (
        projectEndDate && p.startDate && p.startDate > projectEndDate
      ) {
        return true; 
      }
      return false;
    });
  };
  const invalidPhaseIndex = getInvalidPhaseIndex();
  const isAnyPhaseInvalid = invalidPhaseIndex !== -1;

  React.useEffect(() => {
    if (!id) return;
    const fetchProject = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        const res = await axios.get(`${API_BASE}/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const d = res.data?.data ?? res.data;
        
        const parseDate = (dateString: string | undefined): Date | undefined => {
            return dateString ? new Date(dateString) : undefined;
        }

        const statusFromApi = d.status as ProjectStatus;
        const safeStatus = PROJECT_STATUSES.includes(statusFromApi) ? statusFromApi : "NOT_STARTED";

        setFormData({
          name: d.name ?? "",
          categories: d.categories || [],
          ownerId: d.ownerId, 
          startDate: parseDate(d.startDate),
          endDate: parseDate(d.endDate),
          status: safeStatus,
          // ✅ Support desimal dari API
          completion: String(d.completion ?? 0),
          notes: d.notes ?? "",
          ownerName: d.owner?.name ?? "Tidak Diketahui",
          ownerCompany: d.owner?.company ?? "Tidak Diketahui",
        });

        setPhases(
          (d.phases || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            startDate: parseDate(p.startDate),
            endDate: parseDate(p.endDate),
          }))
        );
      } catch (err: any) {
        setError(err?.response?.data?.message || "Gagal memuat data project");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, navigate]);

  // ✅ Handler untuk completion dengan support desimal
  const handleChange = (field: keyof FormData, value: string) => {
    if (field === "completion") {
        // Validasi input: hanya angka dan titik desimal
        const sanitized = value.replace(/[^0-9.]/g, '');
        
        // Cegah multiple titik desimal
        const parts = sanitized.split('.');
        let finalValue = parts[0];
        if (parts.length > 1) {
          finalValue = parts[0] + '.' + parts.slice(1).join('');
        }
        
        // Clamp antara 0-100
        const numValue = parseFloat(finalValue);
        if (!isNaN(numValue)) {
          if (numValue > 100) {
            finalValue = "100";
          } else if (numValue < 0) {
            finalValue = "0";
          }
        }
        
        setFormData((prev) => ({ ...prev, [field]: finalValue }));
    } else {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleCategoryChange = (value: string) => {
    const trimmedValue = value.trim();
    setFormData((prev) => ({ 
        ...prev, 
        categories: [trimmedValue].filter(c => c !== "")
    }));
  };
  
  const handleStatusChange = (value: ProjectStatus) => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const handleDateChange = (field: keyof FormData, date: Date | undefined) =>
    setFormData((prev) => ({ ...prev, [field]: date }));

  const handleAddPhase = () =>
    setPhases((prev) => [...prev, { name: "", startDate: undefined, endDate: undefined }]);

  const handleRemovePhase = (index: number) => {
    const phaseToRemove = phases[index];
    if (phaseToRemove.id) {
      setDeletedPhaseIds((prev) => [...prev, phaseToRemove.id!]);
    }
    setPhases((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePhaseChange = (
    index: number,
    field: keyof PhaseData,
    value: any
  ) => {
    setPhases((prev) =>
      prev.map((phase, i) => (i === index ? { ...phase, [field]: value } : phase))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || saving) return;

    if (!formData.name.trim()) {
      toast.warning("Nama project wajib diisi", {
        description: "Harap isi nama project sebelum menyimpan.",
      });
      return;
    }

    if (formData.categories.length === 0 || formData.categories[0].trim() === "") {
      toast.warning("Kategori wajib diisi", {
        description: "Project minimal harus punya satu kategori.",
      });
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      toast.warning("Tanggal belum lengkap", {
        description: "Tanggal mulai dan tanggal selesai wajib diisi.",
      });
      return;
    }

   if (isInvalidProjectDateRange) {
      toast.warning("Tanggal project tidak valid", {
        description: "Tanggal selesai proyek harus setelah tanggal mulai.",
      });
      return;
    }

    if (isAnyPhaseInvalid) {
      toast.warning("Fase tidak valid", {
        description:
          "Ada fase dengan tanggal di luar rentang project atau tanggal mulai/selesai tidak valid. Periksa kembali semua fase.",
      });
      return;
    }


    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Otorisasi gagal", {
          description: "Sesi login berakhir. Silakan login ulang.",
        });
        navigate("/login");
        return;
      }


      if (!formData.ownerId) {
        toast.error("Data project tidak valid", {
          description: "Owner ID tidak ditemukan. Coba muat ulang halaman dulu.",
        });
        return;
      }


      // ✅ Parse sebagai float untuk support desimal
      const completionValue = parseFloat(formData.completion) || 0;
      const safeCompletionValue = Math.max(0, Math.min(100, completionValue));

      const payload: any = {
        name: formData.name.trim(),
        categories: formData.categories.filter(c => c.trim() !== ""),
        ownerId: formData.ownerId,
        startDate: formData.startDate!.toISOString(),
        endDate: formData.endDate!.toISOString(),
        completion: safeCompletionValue,
        status: formData.status,
      };

      if (formData.notes.trim()) {
        payload.notes = formData.notes.trim();
      }

      console.log("📤 Sending PATCH payload:", JSON.stringify(payload, null, 2));

      const projectResponse = await axios.patch(`${API_BASE}/projects/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("✅ Project update response:", projectResponse.data);

      console.log("🗑️ Deleting phases:", deletedPhaseIds);
      for (const deletedId of deletedPhaseIds) {
        try {
          await axios.delete(`${API_BASE}/project-phases/${deletedId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log(`✅ Deleted phase ${deletedId}`);
        } catch (err: any) {
          console.error(`❌ Failed to delete phase ${deletedId}:`, err.response?.data || err.message);
        }
      }

      console.log("🔄 Syncing phases:", phases);
      for (const phase of phases) {
        if (!phase.name.trim() || !phase.startDate || !phase.endDate) {
          console.log(`⏭️ Skipping phase without complete details:`, phase.name);
          continue;
        }

        const phasePayload = {
          name: phase.name.trim(),
          startDate: phase.startDate.toISOString(),
          endDate: phase.endDate.toISOString(),
          projectId: Number(id),
        };

        console.log(`📤 Phase payload (${phase.id ? 'UPDATE' : 'INSERT'}):`, phasePayload);

        try {
          if (phase.id) {
            const res = await axios.patch(`${API_BASE}/project-phases/${phase.id}`, phasePayload, {
              headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`✅ Updated phase ${phase.id}:`, res.data);
          } else {
            const res = await axios.post(`${API_BASE}/project-phases`, phasePayload, {
              headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`✅ Created new phase:`, res.data);
          }
        } catch (err: any) {
          console.error(`❌ Phase sync error:`, err.response?.data || err.message);
          throw err;
        }
      }

      toast.success("Project berhasil diperbarui", {
          description: "Perubahan project dan phases berhasil disimpan.",
        });

        navigate("/admin/dashboard/projects");

    } catch (err: any) {
      console.error("❌ Submit error:", err);
      console.error("Error response:", JSON.stringify(err.response?.data, null, 2));
      
      let errorText = err?.response?.data?.message || "Gagal menyimpan perubahan.";
      if (err?.response?.data?.issues) {
        errorText = err.response.data.issues.map((i: any) => i.message).join(", ");
      }
      
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Data:", JSON.stringify(err.response.data, null, 2));
      }
      
      setError(errorText);
            toast.error("Gagal menyimpan perubahan project", {
        description: `${errorText} (cek console/F12 untuk detail teknis)`,
      });

    } finally {
      setSaving(false);
    }
  };

  return (
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
        <div className="flex flex-1 flex-col px-4 lg:px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/dashboard/projects")}
              className="flex items-center gap-2"
              disabled={saving}
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
          </div>

          <h1 className="text-2xl font-semibold">Edit Project</h1>
          <p className="text-muted-foreground mb-6">
            Ubah informasi project dan phases di sini.
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Informasi Project</CardTitle>
              <CardDescription>
                Ubah data project dan phases lalu simpan perubahan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="rounded border p-6 text-center text-muted-foreground">
                  <Loader2 className="animate-spin inline-block mr-2 h-5 w-5" /> Memuat data...
                </div>
              ) : error && !saving ? (
                <div className="rounded border border-red-300 bg-red-50 p-4 mb-4 text-sm text-red-600">
                  **Error Memuat Data:** {error}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Nama Project</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        disabled={saving}
                      />
                    </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori</Label>
                        <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[42px] bg-#00bcd4">
                            {formData.categories.map((category, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm"
                                >
                                <span>{category}</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                    setFormData({
                                    ...formData,
                                    categories: formData.categories.filter((_, i) => i !== index),
                                        })
                                    }}
                                    disabled={loading}
                                    className="ml-1 hover:bg-primary/80 rounded-sm"
                                    >
                                      <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                             </svg>
                                           </button>
                                         </div>
                                       ))}
                                       <Input
                                         id="category"
                                         type="text"
                                         className="flex-1 border-0 shadow-none focus-visible:ring-0 min-w-[200px] p-0"
                                         placeholder={formData.categories.length === 0 ? "Ketik kategori dan tekan Enter..." : "Tambah kategori..."}
                                         disabled={loading}
                                         onKeyDown={(e) => {
                                           if (e.key === "Enter") {
                                             e.preventDefault()
                                             const value = e.currentTarget.value.trim()
                                             if (value && !formData.categories.includes(value)) {
                                               setFormData({
                                                 ...formData,
                                                 categories: [...formData.categories, value],
                                               })
                                               e.currentTarget.value = ""
                                             }
                                           }
                                        }}
                                />
                          </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Client</Label>
                      <Input value={formData.ownerCompany} disabled />
                    </div>

                    <div className="space-y-2">
                      <Label>Penanggung Jawab</Label>
                      <Input value={formData.ownerName} disabled />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={handleStatusChange as (value: string) => void}
                        disabled={saving}
                      >
                        <SelectTrigger id="status">
                            <SelectValue placeholder="Pilih Status Proyek" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="NOT_STARTED">NOT_STARTED</SelectItem>
                            <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                            <SelectItem value="DONE">DONE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>                    
                     <br />                     
                    <div className="space-y-2">
                      <Label>Start Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            disabled={saving}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 size-4" />
                            {formData.startDate
                              ? format(formData.startDate, "PPP")
                              : "Pilih tanggal mulai"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.startDate}
                            onSelect={(date) => handleDateChange("startDate", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>End Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            disabled={saving}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.endDate && "text-muted-foreground",
                              isInvalidProjectDateRange && "border-red-500 text-red-600"
                            )}
                          >
                            <CalendarIcon className="mr-2 size-4" />
                            {formData.endDate
                              ? format(formData.endDate, "PPP")
                              : "Pilih tanggal selesai"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.endDate}
                            onSelect={(date) => handleDateChange("endDate", date)}
                            disabled={(date) =>
                                formData.startDate ? date <= formData.startDate : false
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {isInvalidProjectDateRange && (
                        <p className="text-red-600 text-sm">
                          Tanggal selesai tidak boleh sebelum atau sama dengan tanggal mulai.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleChange("notes", e.target.value)}
                      placeholder="Catatan tambahan"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <Label>Fase Proyek</Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddPhase}
                        className="flex items-center gap-2"
                        disabled={saving}
                      >
                        <Plus className="size-4" />
                        Tambah Fase
                      </Button>
                    </div>

                    {phases.map((phase, i) => {
                      const isPhaseDateRangeInvalid = phase.startDate && phase.endDate && phase.endDate <= phase.startDate;
                      const isPhaseOutsideProjectRange = 
                          (formData.startDate && phase.startDate && phase.startDate < formData.startDate) ||
                          (formData.endDate && phase.endDate && phase.endDate > formData.endDate) ||
                          (formData.endDate && phase.startDate && phase.startDate > formData.endDate); 
                          
                      const isPhaseInvalid = isPhaseDateRangeInvalid || isPhaseOutsideProjectRange;

                      return (
                        <div key={phase.id || i} className="border rounded-md p-4 space-y-3 bg-muted/20 relative">
                          <div className="flex justify-between items-center">
                            <Label>Fase {i + 1}</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemovePhase(i)}
                              className="text-red-500 hover:text-red-700"
                              disabled={saving}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <Label>Nama Fase</Label>
                            <Input
                              value={phase.name}
                              onChange={(e) => handlePhaseChange(i, "name", e.target.value)}
                              placeholder={`Contoh: Phase ${i + 1}`}
                              disabled={saving}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Tanggal Mulai</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    disabled={saving}
                                    className={cn(
                                      "justify-start text-left font-normal w-full",
                                      !phase.startDate && "text-muted-foreground",
                                      isPhaseInvalid && "border-red-500 text-red-600"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 size-4" />
                                    {phase.startDate
                                      ? format(phase.startDate, "PPP")
                                      : "Pilih tanggal mulai"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={phase.startDate}
                                    onSelect={(date) => handlePhaseChange(i, "startDate", date)}
                                    disabled={(date) => {
                                        const beforeProjectStart = formData.startDate ? date < formData.startDate : false;
                                        const afterProjectEnd = formData.endDate ? date > formData.endDate : false;
                                        return beforeProjectStart || afterProjectEnd;
                                    }}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                                {formData.startDate && phase.startDate && phase.startDate < formData.startDate && (
                                    <p className="text-red-600 text-sm">
                                        Tanggal mulai fase tidak boleh sebelum tanggal mulai project.
                                    </p>
                                )}
                                {formData.endDate && phase.startDate && phase.startDate > formData.endDate && (
                                    <p className="text-red-600 text-sm">
                                        Tanggal mulai fase tidak boleh setelah tanggal selesai project.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                              <Label>Tanggal Selesai</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    disabled={saving}
                                    className={cn(
                                      "justify-start text-left font-normal w-full",
                                      !phase.endDate && "text-muted-foreground",
                                      isPhaseInvalid && "border-red-500 text-red-600"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 size-4" />
                                    {phase.endDate
                                      ? format(phase.endDate, "PPP")
                                      : "Pilih tanggal selesai"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={phase.endDate}
                                    onSelect={(date) => handlePhaseChange(i, "endDate", date)}
                                    disabled={(date) => {
                                        const afterPhaseStart = phase.startDate ? date <= phase.startDate : false;
                                        const afterProjectEnd = formData.endDate ? date > formData.endDate : false;
                                        return afterPhaseStart || afterProjectEnd;
                                    }}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              {isPhaseDateRangeInvalid && (
                                <p className="text-red-600 text-sm">
                                  Tanggal selesai tidak boleh sebelum atau sama dengan tanggal mulai fase.
                                </p>
                              )}
                              {formData.endDate && phase.endDate && phase.endDate > formData.endDate && (
                                    <p className="text-red-600 text-sm">
                                        Tanggal selesai fase tidak boleh setelah tanggal selesai project.
                                    </p>
                                )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      disabled={saving || isInvalidProjectDateRange || isAnyPhaseInvalid || loading}
                    >
                      {saving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      {saving ? "Menyimpan..." : "Simpan Perubahan"}
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