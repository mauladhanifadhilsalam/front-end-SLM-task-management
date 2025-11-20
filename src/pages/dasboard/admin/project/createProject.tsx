"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "sonner"

import { format } from "date-fns"
import {
  CalendarIcon,
  ChevronsUpDown,
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  Check,
} from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

const API_BASE = import.meta.env.VITE_API_BASE

interface ProjectOwner {
  id: number
  name: string
  company: string
  email: string
}

interface PhaseData {
  name: string
  startDate?: Date
  endDate?: Date
}

interface AssignmentData {
  userId: number
  roleInProject: string
}

interface User {
  id: number
  fullName: string
  email: string
  role: string
}

export default function CreateProjectPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)
  const [owners, setOwners] = React.useState<ProjectOwner[]>([])
  const [users, setUsers] = React.useState<User[]>([])
  const [openOwner, setOpenOwner] = React.useState(false)

  const [formData, setFormData] = React.useState({
    name: "",
    categories: [] as string[],
    ownerId: undefined as number | undefined,
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    status: "NOT_STARTED",
    completion: "0",
    notes: "",
    phases: [] as PhaseData[],
    assignments: [] as AssignmentData[],
  })

  React.useEffect(() => {
    const fetchOwners = async () => {
      const token = localStorage.getItem("token")
      if (!token) return

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

  React.useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token")
      if (!token) return

      try {
        const res = await axios.get(`${API_BASE}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const filteredUsers = (res.data || []).filter(
          (user: User) => user.role === "PROJECT_MANAGER" || user.role === "DEVELOPER"
        )
        setUsers(filteredUsers)
      } catch (err) {
        console.error("Gagal memuat data users", err)
      }
    }
    fetchUsers()
  }, [])

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

  const handlePhaseChange = (index: number, field: keyof PhaseData, value: any) => {
    const updatedPhases = [...formData.phases]
    updatedPhases[index] = { ...updatedPhases[index], [field]: value }
    setFormData((f) => ({ ...f, phases: updatedPhases }))
  }

  const handleAddAssignment = () => {
    setFormData((f) => ({
      ...f,
      assignments: [...f.assignments, { userId: 0, roleInProject: "" }],
    }))
  }

  const handleRemoveAssignment = (index: number) => {
    setFormData((f) => ({
      ...f,
      assignments: f.assignments.filter((_, i) => i !== index),
    }))
  }

  const handleAssignmentChange = (index: number, field: keyof AssignmentData, value: any) => {
    const updatedAssignments = [...formData.assignments]
    updatedAssignments[index] = { ...updatedAssignments[index], [field]: value }
    setFormData((f) => ({ ...f, assignments: updatedAssignments }))
  }

  const isInvalidDateRange =
    formData.startDate && formData.endDate && formData.endDate <= formData.startDate

  const invalidPhaseIndex = formData.phases.findIndex(
    (p) => p.startDate && p.endDate && p.endDate <= p.startDate
  )

  const isAnyPhaseStartTooEarly = formData.phases.some(
    (p) => p.startDate && formData.startDate && p.startDate < formData.startDate
  )

  const isAnyPhaseStartTooLate = formData.phases.some(
    (p) => p.startDate && formData.endDate && p.startDate > formData.endDate
  )

  const isAnyPhaseEndTooLate = formData.phases.some(
    (p) => p.endDate && formData.endDate && p.endDate > formData.endDate
  )

  const isAnyPhaseInvalid =
    invalidPhaseIndex !== -1 ||
    isAnyPhaseStartTooEarly ||
    isAnyPhaseEndTooLate ||
    isAnyPhaseStartTooLate

  const hasIncompleteAssignment =
    formData.assignments.length > 0 &&
    formData.assignments.some(
      (a) => a.userId === 0 || a.roleInProject.trim() === ""
    )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

      if (!formData.name || !formData.ownerId) {
        toast.warning("Form belum lengkap", {
          description: "Nama project dan pemilik wajib diisi.",
        })
        setLoading(false)
        return
      }

    if (!formData.startDate || !formData.endDate) {
            toast.warning("Form belum lengkap", {
        description: "Tanggal Mulai dan Tanggal Selesai wajib diisi.",
      })
      setLoading(false)
      return
    }

    if (formData.categories.length === 0 || formData.categories[0].trim() === "") {
        toast.warning("Kategori belum diisi", {
          description: "Project wajib memiliki minimal satu kategori.",
        })

      setLoading(false)
      return
    }

    if (isInvalidDateRange) {
            toast.warning("Rentang tanggal project tidak valid", {
        description: "Tanggal selesai tidak boleh sama atau sebelum tanggal mulai project.",
      })

      setLoading(false)
      return
    }

    if (isAnyPhaseStartTooEarly) {
        toast.warning("Tanggal fase tidak valid", {
      description: "Tanggal mulai fase tidak boleh sebelum tanggal mulai project utama.",
    })

      setLoading(false)
      return
    }

    if (isAnyPhaseStartTooLate) {
          toast.warning("Tanggal fase tidak valid", {
      description: "Tanggal mulai fase tidak boleh setelah tanggal selesai project utama.",
    })

      setLoading(false)
      return
    }

    if (isAnyPhaseEndTooLate) {
     toast.warning("Tanggal fase tidak valid", {
         description: "Tanggal selesai fase tidak boleh setelah tanggal selesai project utama.",
})

      setLoading(false)
      return
    }

    if (invalidPhaseIndex !== -1) {
      toast.warning("Tanggal fase tidak valid", {
        description: `Tanggal selesai fase ${
          invalidPhaseIndex + 1
        } tidak boleh sama atau sebelum tanggal mulai fase.`,
      })

      setLoading(false)
      return
    }

    if (hasIncompleteAssignment) {
     toast.warning("Assignment tim belum lengkap", {
      description: "Semua assignment harus memiliki User dan Role yang valid.",
    })

      setLoading(false)
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      toast.error("Otorisasi gagal", {
        description: "Token tidak ditemukan. Silakan login kembali.",
      })
      setLoading(false)
      navigate("/login")
      return
    }


    try {
      const raw =
        typeof formData.completion === "string"
          ? formData.completion.trim()
          : String(formData.completion)
      const parsed = raw ? parseFloat(raw.replace(",", ".")) : NaN
      const completionValue = Number.isFinite(parsed)
        ? Math.max(0, Math.min(100, parsed))
        : 0

      const phases = formData.phases
        .filter((p) => p.name.trim() !== "")
        .map((p) => ({
          name: p.name.trim(),
          startDate: p.startDate ? p.startDate.toISOString() : null,
          endDate: p.endDate ? p.endDate.toISOString() : null,
        }))

      const assignments = formData.assignments
        .filter((a) => a.userId > 0 && a.roleInProject.trim() !== "")
        .map((a) => ({
          userId: a.userId,
          roleInProject: a.roleInProject.trim(),
        }))

      const payload: any = {
        name: formData.name.trim(),
        categories: formData.categories.filter((c) => c.trim() !== ""),
        ownerId: formData.ownerId,
        startDate: formData.startDate!.toISOString(),
        endDate: formData.endDate!.toISOString(),
        status: formData.status,
        completion: completionValue,
        notes: formData.notes.trim() || null,
      }

      if (phases.length > 0) {
        payload.phases = phases
      }

      if (assignments.length > 0) {
        payload.assignments = assignments
      }

      console.log("📦 FINAL PAYLOAD:")
      console.log(JSON.stringify(payload, null, 2))

      const response = await axios.post(`${API_BASE}/projects`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

            toast.success("Project berhasil dibuat", {
          description: `Project "${formData.name}" berhasil dibuat.`,
        })

        navigate("/admin/dashboard/projects")

    } catch (err: any) {
      console.error("❌ FULL ERROR:", err)

      let errorText =
        "Gagal membuat project. Terjadi kesalahan jaringan atau server tidak merespons."

      if (err.response) {
        const status = err.response.status
        const data = err.response.data

        if (status === 401) {
          errorText = "Otorisasi Gagal. Token tidak valid. Silakan login ulang."
          navigate("/login")
        } else if (status === 400) {
          const zodIssues = data?.issues
            ? data.issues.map((i: any) => i.message).join(", ")
            : null
          errorText =
            zodIssues ||
            data?.message ||
            "Data tidak valid (Bad Request). Periksa format ID, tanggal, dan struktur assignment/phase."
        } else if (status === 404) {
          errorText = data?.message || "Resource tidak ditemukan."
        } else {
          errorText = data?.message || `Server Error: ${status}.`
        }
      }

      toast.error("Gagal membuat project", {
          description: errorText,
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
            Tambah informasi project, phases, dan assignment tim di sini.
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Informasi Project</CardTitle>
              <CardDescription>
                Isi semua data project dengan lengkap.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Project</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Masukkan nama project"
                      required
                      disabled={loading}
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
                                  </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            ? owners.find((c) => c.id === formData.ownerId)
                                ?.company ||
                              owners.find((c) => c.id === formData.ownerId)
                                ?.name
                            : "Pilih client..."}
                          <ChevronsUpDown className="opacity-50 size-4 ml-2" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-full" align="start">
                        <Command>
                          <CommandInput placeholder="Cari client..." />
                          <CommandList>
                            {owners.length === 0 && (
                              <CommandItem disabled>
                                Tidak ada owner ditemukan.
                              </CommandItem>
                            )}
                            {owners.map((c) => (
                              <CommandItem
                                key={c.id}
                                onSelect={() => {
                                  setFormData({
                                    ...formData,
                                    ownerId: c.id,
                                  })
                                  setOpenOwner(false)
                                }}
                                className="cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    c.id === formData.ownerId
                                      ? "opacity-100"
                                      : "opacity-0"
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
                      value={
                        formData.ownerId
                          ? owners.find((c) => c.id === formData.ownerId)
                              ?.name || ""
                          : "Pilih client terlebih dahulu"
                      }
                      disabled
                    />
                  </div>
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
                          onSelect={(date) =>
                            setFormData({ ...formData, startDate: date || undefined })
                          }
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
                            isInvalidDateRange &&
                              "border-red-500 text-red-600"
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
                          onSelect={(date) =>
                            setFormData({ ...formData, endDate: date || undefined })
                          }
                          initialFocus
                          disabled={(date) =>
                            formData.startDate ? date <= formData.startDate : false
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    {isInvalidDateRange && (
                      <p className="text-red-600 text-sm">
                        Tanggal selesai tidak boleh sebelum atau sama dengan
                        tanggal mulai project.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
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
                      phase.startDate &&
                      phase.endDate &&
                      phase.endDate <= phase.startDate

                    const isPhaseEarlierThanProjectStart =
                      formData.startDate &&
                      phase.startDate &&
                      phase.startDate < formData.startDate

                    const isPhaseLaterThanProjectEndStart =
                      formData.endDate &&
                      phase.startDate &&
                      phase.startDate > formData.endDate

                    const isPhaseLaterThanProjectEnd =
                      formData.endDate &&
                      phase.endDate &&
                      phase.endDate > formData.endDate

                    return (
                      <div
                        key={i}
                        className="border rounded-md p-4 space-y-3 bg-muted/20"
                      >
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
                            onChange={(e) =>
                              handlePhaseChange(i, "name", e.target.value)
                            }
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
                                    (isPhaseEarlierThanProjectStart ||
                                      isPhaseLaterThanProjectEndStart) &&
                                      "border-red-500 text-red-600"
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
                                  onSelect={(date) =>
                                    handlePhaseChange(
                                      i,
                                      "startDate",
                                      date || undefined
                                    )
                                  }
                                  initialFocus
                                  disabled={(date) => {
                                    const isEarlierThanProjectStart =
                                      formData.startDate
                                        ? date < formData.startDate
                                        : false
                                    const isLaterThanProjectEnd =
                                      formData.endDate
                                        ? date > formData.endDate
                                        : false
                                    return (
                                      isEarlierThanProjectStart ||
                                      isLaterThanProjectEnd
                                    )
                                  }}
                                />
                              </PopoverContent>
                            </Popover>
                            {(isPhaseEarlierThanProjectStart ||
                              isPhaseLaterThanProjectEndStart) && (
                              <p className="text-red-600 text-sm">
                                Tanggal mulai fase harus di antara tanggal
                                mulai dan selesai project.
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
                                    (isPhaseInvalidInternal ||
                                      isPhaseLaterThanProjectEnd) &&
                                      "border-red-500 text-red-600"
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
                                  onSelect={(date) =>
                                    handlePhaseChange(
                                      i,
                                      "endDate",
                                      date || undefined
                                    )
                                  }
                                  initialFocus
                                  disabled={(date) => {
                                    const isEarlierThanPhaseStart = phase.startDate
                                      ? date <= phase.startDate
                                      : false
                                    const isEarlierThanProjectStart =
                                      formData.startDate
                                        ? date < formData.startDate
                                        : false
                                    const isLaterThanProjectEnd =
                                      formData.endDate
                                        ? date > formData.endDate
                                        : false
                                    return (
                                      isEarlierThanPhaseStart ||
                                      isEarlierThanProjectStart ||
                                      isLaterThanProjectEnd
                                    )
                                  }}
                                />
                              </PopoverContent>
                            </Popover>
                            {isPhaseInvalidInternal && (
                              <p className="text-red-600 text-sm">
                                Tanggal selesai fase tidak boleh sebelum atau
                                sama dengan tanggal mulai fase.
                              </p>
                            )}
                            {isPhaseLaterThanProjectEnd && (
                              <p className="text-red-600 text-sm">
                                Tanggal selesai fase tidak boleh melebihi
                                tanggal selesai project utama.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Assignment Tim</Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddAssignment}
                      className="flex items-center gap-2"
                      disabled={loading}
                    >
                      <Plus className="size-4" />
                      Tambah Assignment
                    </Button>
                  </div>

                  {formData.assignments.map((assignment, i) => (
                    <div
                      key={i}
                      className="border rounded-md p-4 space-y-3 bg-muted/20"
                    >
                      <div className="flex justify-between items-center">
                        <Label>Assignment {i + 1}</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAssignment(i)}
                          className="text-red-500 hover:text-red-700"
                          disabled={loading}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>User</Label>
                          <Select
                            value={
                              assignment.userId === 0
                                ? ""
                                : String(assignment.userId)
                            }
                            onValueChange={(value) =>
                              handleAssignmentChange(i, "userId", Number(value))
                            }
                            disabled={loading}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih User..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {users.length === 0 && (
                                  <SelectItem disabled value="0">
                                    Tidak ada user ditemukan.
                                  </SelectItem>
                                )}
                                {users.map((user) => (
                                  <SelectItem
                                    key={user.id}
                                    value={String(user.id)}
                                  >
                                    {user.fullName} (
                                    {user.role.replace("_", " ")})
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Role dalam Project</Label>
                                <Select
                                    value={assignment.roleInProject}
                                    onValueChange={(value) =>
                                    handleAssignmentChange(i, "roleInProject", value)
                                    }
                                    disabled={loading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Role..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
                                            <SelectItem value="BACK_END">Backend Developer</SelectItem>
                                            <SelectItem value="FRONT_END">Frontend Developer</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                 </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    className="w-full md:w-auto"
                    disabled={
                      loading ||
                      isAnyPhaseInvalid ||
                      isInvalidDateRange ||
                      hasIncompleteAssignment
                    }
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Project"
                    )}
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