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
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon, ChevronsUpDown, ArrowLeft, Check, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import * as React from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export default function CreateProjectPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

  const [owners, setOwners] = React.useState<{ id: number; name: string; company: string; email: string }[]>([])
  const [formData, setFormData] = React.useState({
    name: "",
    categories: [] as string[],
    ownerId: undefined as number | undefined,
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    status: "NOT_STARTED",
    completion: "",
    notes: "",
    phases: [] as { name: string; startDate?: Date; endDate?: Date }[],
  })

  const [openOwner, setOpenOwner] = React.useState(false)
  const [categoryInput, setCategoryInput] = React.useState("")

  // 🔹 Ambil data owner dari API
  React.useEffect(() => {
    const fetchOwners = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await axios.get("http://localhost:3000/project-owners", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        setOwners(res.data || [])
      } catch (err) {
        console.error("Gagal memuat data owners", err)
      }
    }
    fetchOwners()
  }, [])

  // 🔹 Tambah kategori
  const handleAddCategory = () => {
    const trimmed = categoryInput.trim()
    if (trimmed && !formData.categories.includes(trimmed)) {
      setFormData((f) => ({ ...f, categories: [...f.categories, trimmed] }))
      setCategoryInput("")
    }
  }

  // 🔹 Hapus kategori
  const handleRemoveCategory = (cat: string) => {
    setFormData((f) => ({ ...f, categories: f.categories.filter((c) => c !== cat) }))
  }

  // 🔹 Tambah phase baru
  const handleAddPhase = () => {
    setFormData((f) => ({
      ...f,
      phases: [...f.phases, { name: "", startDate: undefined, endDate: undefined }],
    }))
  }

  // 🔹 Hapus phase
  const handleRemovePhase = (index: number) => {
    setFormData((f) => ({
      ...f,
      phases: f.phases.filter((_, i) => i !== index),
    }))
  }

  // 🔹 Update field dalam satu phase
  const handlePhaseChange = (
    index: number,
    field: keyof (typeof formData.phases)[number],
    value: any
  ) => {
    const updatedPhases = [...formData.phases]
    updatedPhases[index] = { ...updatedPhases[index], [field]: value }
    setFormData((f) => ({ ...f, phases: updatedPhases }))
  }

  // 🔹 Validasi tanggal
  const isInvalidDateRange =
    formData.startDate &&
    formData.endDate &&
    formData.endDate <= formData.startDate

  const invalidPhaseIndex = formData.phases.findIndex(
    (p) => p.startDate && p.endDate && p.endDate <= p.startDate
  )

  // 🔹 Submit project baru
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!formData.name || !formData.ownerId) {
      setErrorMsg("Nama project dan pemilik wajib diisi.")
      setLoading(false)
      return
    }

    if (isInvalidDateRange) {
      setErrorMsg("Tanggal selesai proyek tidak boleh sama atau sebelum tanggal mulai.")
      setLoading(false)
      return
    }

    if (invalidPhaseIndex !== -1) {
      setErrorMsg(`Tanggal selesai fase ${invalidPhaseIndex + 1} tidak valid.`)
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem("token") || ""
      const payload = {
        ...formData,
        startDate: formData.startDate ? formData.startDate.toISOString() : null,
        endDate: formData.endDate ? formData.endDate.toISOString() : null,
        phases: formData.phases.map((p) => ({
          name: p.name,
          startDate: p.startDate ? p.startDate.toISOString() : null,
          endDate: p.endDate ? p.endDate.toISOString() : null,
        })),
      }

      await axios.post("http://localhost:3000/projects", payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })

      setSuccessMsg(`Project "${formData.name}" berhasil dibuat.`)
      setTimeout(() => navigate("/admin/dashboard/projects"), 1000)
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Gagal membuat project.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1 p-6">
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
            <h1 className="text-2xl font-semibold">Tambah Project Baru</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informasi Project</CardTitle>
              <CardDescription>Isi semua data project dengan lengkap.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Alert */}
                {errorMsg && (
                  <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                    {errorMsg}
                  </div>
                )}
                {successMsg && (
                  <div className="rounded border border-green-300 bg-green-50 p-3 text-sm text-green-700">
                    {successMsg}
                  </div>
                )}

                {/* Nama Project */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Project *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Masukkan nama project"
                    required
                  />
                </div>

                {/* Owner */}
                <div className="space-y-2">
                  <Label>Client / Owner *</Label>
                  <Popover open={openOwner} onOpenChange={setOpenOwner}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="justify-between">
                        {formData.ownerId
                          ? owners.find((c) => c.id === formData.ownerId)?.name
                          : "Pilih client..."}
                        <ChevronsUpDown className="opacity-50 size-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <Command>
                        <CommandInput placeholder="Cari client..." />
                        <CommandList>
                          {owners.map((c) => (
                            <CommandItem
                              key={c.id}
                              onSelect={() => {
                                setFormData({ ...formData, ownerId: c.id })
                                setOpenOwner(false)
                              }}
                            >
                              {c.name} — {c.company}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Start & End Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
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
                          onSelect={(date) => setFormData({ ...formData, startDate: date })}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !formData.endDate && "text-muted-foreground",
                            isInvalidDateRange && "border-red-500 text-red-600"
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
                          onSelect={(date) => setFormData({ ...formData, endDate: date })}
                          disabled={(date) =>
                            formData.startDate ? date <= formData.startDate : false
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Fase Proyek */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Fase Proyek</Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddPhase}
                      className="flex items-center gap-2"
                    >
                      <Plus className="size-4" />
                      Tambah Fase
                    </Button>
                  </div>

                  {formData.phases.map((phase, i) => {
                    const isPhaseInvalid =
                      phase.startDate && phase.endDate && phase.endDate <= phase.startDate

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
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Tanggal Mulai</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "justify-start text-left font-normal w-full",
                                    !phase.startDate && "text-muted-foreground"
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
                                />
                              </PopoverContent>
                            </Popover>
                          </div>

                          <div className="space-y-2">
                            <Label>Tanggal Selesai</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
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
                                  disabled={(date) =>
                                    phase.startDate ? date <= phase.startDate : false
                                  }
                                />
                              </PopoverContent>
                            </Popover>
                            {isPhaseInvalid && (
                              <p className="text-red-600 text-sm">
                                Tanggal selesai tidak boleh sebelum atau sama dengan tanggal mulai.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={loading || isInvalidDateRange || invalidPhaseIndex !== -1}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {loading ? "Menyimpan..." : "Simpan Project"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
