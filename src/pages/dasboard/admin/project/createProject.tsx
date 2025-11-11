"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon, ChevronsUpDown, ArrowLeft, Check, Plus, Trash2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import * as React from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Swal from "sweetalert2"

// Konstanta API Base URL
const API_BASE = "http://localhost:3000"

// Definisikan Tipe Data
interface ProjectOwner {
    id: number;
    name: string;
    company: string;
    email: string;
}

interface PhaseData {
  name: string;
  startDate?: Date;
  endDate?: Date;
}

// Komponen Utama

export default function CreateProjectPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)

  const [owners, setOwners] = React.useState<ProjectOwner[]>([])
  const [formData, setFormData] = React.useState({
    name: "",
    categories: [] as string[],
    ownerId: undefined as number | undefined,
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    status: "NOT_STARTED", // Default value
    completion: "0", 
    notes: "",
    phases: [] as PhaseData[],
  })

  const [openOwner, setOpenOwner] = React.useState(false)

  // 🔹 Ambil data owner dari API
  React.useEffect(() => {
    const fetchOwners = async () => {
      const token = localStorage.getItem("token")
      if (!token) return; 
      
      try {
        const res = await axios.get(`${API_BASE}/project-owners`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setOwners(res.data || [])
      } catch (err) {
        console.error("Gagal memuat data owners", err)
      }
    }
    fetchOwners()
  }, [])

  // 🔹 Fungsi Utility untuk Phase
  const handleAddPhase = () => {
    setFormData((f) => ({
      ...f,
      phases: [...f.phases, { name: "", startDate: undefined, endDate: undefined }],
    }))
  }

  const handleRemovePhase = (index: number) => {
    setFormData((f) => ({
      ...f,
      phases: f.phases.filter((_, i) => i !== index),
    }))
  }

  const handlePhaseChange = (
    index: number,
    field: keyof PhaseData,
    value: any
  ) => {
    const updatedPhases = [...formData.phases]
    updatedPhases[index] = { ...updatedPhases[index], [field]: value }
    setFormData((f) => ({ ...f, phases: updatedPhases }))
  }
  
  const isInvalidDateRange =
    formData.startDate &&
    formData.endDate &&
    formData.endDate <= formData.startDate

  const invalidPhaseIndex = formData.phases.findIndex(
    (p) => p.startDate && p.endDate && p.endDate <= p.startDate
  )
    
    const isAnyPhaseStartTooEarly = formData.phases.some(p => 
        p.startDate && formData.startDate && p.startDate < formData.startDate
    );
    
    const isAnyPhaseStartTooLate = formData.phases.some(p => 
        p.startDate && formData.endDate && p.startDate > formData.endDate
    );
    
    const isAnyPhaseEndTooLate = formData.phases.some(p => 
        p.endDate && formData.endDate && p.endDate > formData.endDate
    );
    
    const isAnyPhaseInvalid = invalidPhaseIndex !== -1 || isAnyPhaseStartTooEarly || isAnyPhaseEndTooLate || isAnyPhaseStartTooLate;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!formData.name || !formData.ownerId) {
      await Swal.fire({ title: "Gagal", text: "Nama project dan pemilik wajib diisi.", icon: "error" })
      setLoading(false)
      return
    }

    if (!formData.startDate || !formData.endDate) {
      await Swal.fire({ title: "Gagal", text: "Tanggal Mulai dan Tanggal Selesai wajib diisi.", icon: "error" })
      setLoading(false)
      return
    }

    if (formData.categories.length === 0 || formData.categories[0].trim() === "") {
      await Swal.fire({ title: "Gagal", text: "Project wajib memiliki minimal satu Kategori.", icon: "error" })
      setLoading(false)
      return
    }

    if (isInvalidDateRange) {
      await Swal.fire({ title: "Gagal", text: "Tanggal selesai proyek tidak boleh sama atau sebelum tanggal mulai.", icon: "error" })
      setLoading(false)
      return
    }
    
    if (isAnyPhaseStartTooEarly) {
        await Swal.fire({ title: "Gagal", text: "Tanggal mulai fase tidak boleh sebelum tanggal mulai project utama.", icon: "error" });
        setLoading(false);
        return;
    }
    
    if (isAnyPhaseStartTooLate) {
        await Swal.fire({ title: "Gagal", text: "Tanggal mulai fase tidak boleh setelah tanggal selesai project utama.", icon: "error" });
        setLoading(false);
        return;
    }
    
    if (isAnyPhaseEndTooLate) {
        await Swal.fire({ title: "Gagal", text: "Tanggal selesai fase tidak boleh setelah tanggal selesai project utama.", icon: "error" });
        setLoading(false);
        return;
    }

    if (invalidPhaseIndex !== -1) {
      await Swal.fire({ title: "Gagal", text: `Tanggal selesai fase ${invalidPhaseIndex + 1} tidak valid (tidak boleh sama atau sebelum tanggal mulai fase).`, icon: "error" })
      setLoading(false)
      return
    }
    const token = localStorage.getItem("token");
    if (!token) {
        await Swal.fire({ title: "Otorisasi Gagal", text: "Token tidak ditemukan. Silakan login kembali.", icon: "warning" });
        setLoading(false);
        navigate("/login"); 
        return;
    }

    try {
    const raw = typeof formData.completion === "string" ? formData.completion.trim() : String(formData.completion);
    const parsed = raw ? parseFloat(raw.replace(",", ".")) : NaN;
    const completionValue = Number.isFinite(parsed) ? Math.max(0, Math.min(100, parsed)) : 0;
      
      const payload = {
        name: formData.name.trim(),
        categories: formData.categories.filter(c => c.trim() !== ""), 
        ownerId: formData.ownerId,
        startDate: formData.startDate!.toISOString(),
        endDate: formData.endDate!.toISOString(),
        status: formData.status,
        completion: completionValue, 
        notes: formData.notes.trim() || null,
        phases: formData.phases.map((p) => ({
        name: p.name.trim(),
        startDate: p.startDate ? p.startDate.toISOString() : null, 
        endDate: p.endDate ? p.endDate.toISOString() : null,
        })),
      }
      
      await axios.post(`${API_BASE}/projects`, payload, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
        }
      })
      
      await Swal.fire({
        title: "Berhasil!",
        text: `Project "${formData.name}" berhasil dibuat.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      })

      navigate("/admin/dashboard/projects")
      
    } catch (err: any) {
      let errorText = "Gagal membuat project. Terjadi kesalahan jaringan atau server tidak merespons."
      
      if (err.response) {
          const status = err.response.status;
          const data = err.response.data;

          if (status === 401) {
              errorText = "Otorisasi Gagal. Token tidak valid. Silakan login ulang.";
              navigate("/login");
          } else if (status === 400) {
              const zodIssues = data?.issues ? data.issues.map((i: any) => i.message).join(", ") : null;
              errorText = zodIssues || data?.message || "Data tidak valid (Bad Request). Periksa kembali input Anda, terutama pada format ID dan tanggal.";
          } else {
              errorText = data?.message || `Server Error: ${status}.`;
          }
      }
      
      await Swal.fire({
        title: "Gagal",
        text: errorText,
        icon: "error",
      })

    } finally {
      setLoading(false)
    }
  }

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
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
            
          </div>
          <h1 className="text-2xl font-semibold">Tambah Project Baru</h1>
          <p className="text-muted-foreground mb-6">
            Tambah informasi project dan phases di sini.
          </p>
          <Card>
            <CardHeader>
              <CardTitle>Informasi Project</CardTitle>
              <CardDescription>Isi semua data project dengan lengkap.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Nama Project & Kategori */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nama Project */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Project</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Masukkan nama project"
                        required
                        disabled={loading}
                      />
                    </div>

                    {/* Categories (Input Tunggal) */}
                    <div className="space-y-2">
                      <Label htmlFor="category">Kategori</Label>
                      <Input
                        id="category"
                        type="text"
                        // Menggunakan index 0 untuk input tunggal
                        value={formData.categories[0] || ""}
                        onChange={(e) =>
                          setFormData({ 
                                ...formData, 
                                // Menyimpan input sebagai array 1 elemen
                                categories: [e.target.value].filter(c => c.trim() !== "") 
                            })
                        }
                        placeholder="Contoh: Website Development"
                        disabled={loading}
                      />
                      {(formData.categories.length === 0 || formData.categories[0].trim() === "") && (
                        <p className="text-sm text-red-500"></p>
                      )}
                    </div>
                </div>
                
                {/* Client/Owner & OwnerId (Penanggung Jawab) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Owner */}
                    <div className="space-y-2">
                      <Label>Client</Label>
                      <Popover open={openOwner} onOpenChange={setOpenOwner}>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            role="combobox" 
                            className={cn(
                                "w-full justify-between",
                                !formData.ownerId && "text-muted-foreground"
                            )}
                            disabled={loading}
                          >
                            {formData.ownerId
                              ? owners.find((c) => c.id === formData.ownerId)?.company || owners.find((c) => c.id === formData.ownerId)?.name
                              : "Pilih client..."}
                            <ChevronsUpDown className="opacity-50 size-4 ml-2" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-full" align="start">
                          <Command>
                            <CommandInput placeholder="Cari client..." />
                            <CommandList>
                                {/* Jika owner kosong, tampilkan pesan loading/kosong */}
                                {owners.length === 0 && <CommandItem disabled>Tidak ada owner ditemukan.</CommandItem>}
                              {owners.map((c) => (
                                <CommandItem
                                  key={c.id}
                                  onSelect={() => {
                                    setFormData({ ...formData, ownerId: c.id })
                                    setOpenOwner(false)
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      c.id === formData.ownerId ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {c.name} — {c.company}
                                </CommandItem>
                              ))}
                            </CommandList>
                          </Command>
                      </PopoverContent>
                    </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Penanggung Jawab</Label>
                      <Input
                        value={formData.ownerId
                          ? owners.find((c) => c.id === formData.ownerId)?.name
                          : "Pilih client terlebih dahulu"}
                        disabled 
                      />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
{/*                     <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) => setFormData({ ...formData, status: value })}
                          disabled={loading}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih Status Project" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="NOT_STARTED">NOT_STARTED</SelectItem>
                              <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                              <SelectItem value="DONE">DONE</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                    </div> */}
{/*                     <div className="space-y-2">
                        <Label htmlFor="completion">Progress</Label>
                          <Input
                            id="completion"
                            type="text"
                            value={formData.completion}
                            onChange={(e) => setFormData({ ...formData, completion: e.target.value })}
                            placeholder="0 - 100 (boleh desimal, pakai koma atau titik)"
                            disabled={loading}
                          />
                    </div> */}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Start Date Project</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.startDate && "text-muted-foreground"
                          )}
                          disabled={loading}
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
                          onSelect={(date) => setFormData({ ...formData, startDate: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>End Date Project</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.endDate && "text-muted-foreground",
                            isInvalidDateRange && "border-red-500 text-red-600"
                          )}
                          disabled={loading}
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
                          onSelect={(date) => setFormData({ ...formData, endDate: date })}
                          disabled={(date) =>
                            formData.startDate ? date <= formData.startDate : false
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {isInvalidDateRange && (
                        <p className="text-red-600 text-sm">
                            Tanggal selesai tidak boleh sebelum atau sama dengan tanggal mulai project.
                        </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Catatan tambahan"
                        disabled={loading}
                    />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Fase Proyek</Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddPhase}
                      className="flex items-center gap-2"
                      disabled={loading}
                    >
                      <Plus className="size-4" />
                      Tambah Fase
                    </Button>
                  </div>

                  {formData.phases.map((phase, i) => {
                    const isPhaseInvalidInternal =
                      phase.startDate && phase.endDate && phase.endDate <= phase.startDate
                    const isPhaseEarlierThanProjectStart = 
                        formData.startDate && phase.startDate && phase.startDate < formData.startDate;
                    const isPhaseLaterThanProjectEndStart = 
                        formData.endDate && phase.startDate && phase.startDate > formData.endDate;
                    const isPhaseLaterThanProjectEnd = 
                        formData.endDate && phase.endDate && phase.endDate > formData.endDate;
                    const isPhaseInvalid = isPhaseInvalidInternal || isPhaseEarlierThanProjectStart || isPhaseLaterThanProjectEnd || isPhaseLaterThanProjectEndStart;

                    return (
                      <div key={i} className="border rounded-md p-4 space-y-3 bg-muted/20 relative">
                        <div className="flex justify-between items-center">
                          <Label>Fase {i + 1}</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemovePhase(i)}
                            className="text-red-500 hover:text-red-700"
                            disabled={loading}
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
                            disabled={loading}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Tanggal Mulai Fase</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "justify-start text-left font-normal w-full",
                                    !phase.startDate && "text-muted-foreground",
                                    (isPhaseEarlierThanProjectStart || isPhaseLaterThanProjectEndStart) && "border-red-500 text-red-600"
                                  )}
                                  disabled={loading}
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
                                  initialFocus
                                    disabled={(date) => {
                                        const isEarlierThanProjectStart = formData.startDate ? date < formData.startDate : false; 
                                        const isLaterThanProjectEnd = formData.endDate ? date > formData.endDate : false;                     
                                        return isEarlierThanProjectStart || isLaterThanProjectEnd;
                                    }}
                                />
                              </PopoverContent>
                            </Popover>
                            {isPhaseEarlierThanProjectStart && (
                                <p className="text-red-600 text-sm">
                                    Tanggal mulai fase tidak boleh sebelum tanggal mulai project.
                                </p>
                            )}
                            {isPhaseLaterThanProjectEndStart && (
                                <p className="text-red-600 text-sm">
                                    Tanggal mulai fase tidak boleh setelah tanggal selesai project.
                                </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Tanggal Selesai Fase</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "justify-start text-left font-normal w-full",
                                    !phase.endDate && "text-muted-foreground",
                                    isPhaseInvalid && "border-red-500 text-red-600"
                                  )}
                                  disabled={loading}
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
                                  initialFocus
                                  disabled={(date) => {
                                        const isEarlierThanPhaseStart = phase.startDate ? date <= phase.startDate : false;
                                        const isEarlierThanProjectStart = formData.startDate ? date < formData.startDate : false;
                                        const isLaterThanProjectEnd = formData.endDate ? date > formData.endDate : false;
                                        return isEarlierThanPhaseStart || isEarlierThanProjectStart || isLaterThanProjectEnd;
                                     }}
                             
                                />
                              </PopoverContent>
                            </Popover>
                            {isPhaseInvalidInternal && (
                              <p className="text-red-600 text-sm">
                                Tanggal selesai fase tidak boleh sebelum atau sama dengan tanggal mulai fase.
                              </p>
                            )}
                             {isPhaseLaterThanProjectEnd && (
                                <p className="text-red-600 text-sm">
                                    Tanggal selesai fase tidak boleh melebihi tanggal selesai project utama.
                                </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={loading || isInvalidDateRange || isAnyPhaseInvalid}
                  >
                    {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Check className="mr-2 h-4 w-4" />
                    )}
                    {loading ? "Menyimpan..." : "Simpan Project"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}