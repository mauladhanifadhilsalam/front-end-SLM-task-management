"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  CommandEmpty,
} from "@/components/ui/command"
import { ArrowLeft, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import * as React from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

// Define interface for User data to match API response (using fullName)
interface User {
  id: number;
  fullName: string; // <<< PERUBAHAN DI SINI: Menggunakan 'fullName' >>>
  email: string;
}

export default function CreateTicketAssigneePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

  const [tickets, setTickets] = React.useState<{ id: number; title: string }[]>([])
  // <<< PERUBAHAN DI SINI: Menggunakan 'fullName' untuk tipe data User >>>
  const [users, setUsers] = React.useState<User[]>([]) 

  const [formData, setFormData] = React.useState({
    ticketId: undefined as number | undefined,
    userId: undefined as number | undefined,
  })

  const [openTicket, setOpenTicket] = React.useState(false)
  const [openAssignee, setOpenAssignee] = React.useState(false)

  // Ambil data tiket & user dari API
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined

        const [ticketRes, userRes] = await Promise.all([
          axios.get("http://localhost:3000/tickets", { headers }),
          axios.get("http://localhost:3000/users", { headers }),
        ])

        setTickets(ticketRes.data || [])
        setUsers(userRes.data || []) // Data API sudah cocok dengan tipe User
      } catch (err) {
        console.error("Gagal memuat data tiket/assignee", err)
      }
    }
    fetchData()
  }, [])

  // Submit data ke backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!formData.ticketId || !formData.userId) {
      setErrorMsg("Ticket dan Assignee wajib dipilih.")
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setErrorMsg("Token tidak ditemukan. Silakan login ulang.")
        setLoading(false)
        return
      }

      const payload = {
        ticketId: formData.ticketId,
        userId: formData.userId,
      }

      console.log("Payload dikirim:", payload)

      await axios.post("http://localhost:3000/ticket-assignees", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      setSuccessMsg("Ticket berhasil di-assign.")
      setTimeout(() => navigate("/admin/dashboard/ticket-assignee"), 1000)
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err?.response?.data?.message || "Gagal membuat penugasan.")
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
              onClick={() => navigate("/admin/dashboard/ticket-assignee")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
            <h1 className="text-2xl font-semibold">Assign Ticket</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ticket Assignee</CardTitle>
              <CardDescription>
                Pilih tiket dan user yang akan menerima tugas.
              </CardDescription>
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

                {/* Ticket */}
                <div className="space-y-2">
                  <Label>Ticket *</Label>
                  <Popover open={openTicket} onOpenChange={setOpenTicket}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="justify-between w-full">
                        {formData.ticketId
                          ? tickets.find((t) => t.id === formData.ticketId)?.title
                          : "Pilih ticket..."}
                        <ChevronsUpDown className="opacity-50 size-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-full" align="start">
                      <Command>
                        <CommandInput placeholder="Cari ticket..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>Tidak ada ticket</CommandEmpty>
                          {tickets.map((t) => (
                            <CommandItem
                              key={t.id}
                              value={t.title}
                              onSelect={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  ticketId: t.id,
                                }))
                                setOpenTicket(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.ticketId === t.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {t.title}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Assignee */}
                <div className="space-y-2">
                  <Label>Assignee *</Label>
                  <Popover open={openAssignee} onOpenChange={setOpenAssignee}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="justify-between w-full">
                        {/* <<< PERUBAHAN DI SINI: Mengakses 'fullName' untuk menampilkan nama Assignee >>> */}
                        {formData.userId
                          ? users.find((u) => u.id === formData.userId)?.fullName 
                          : "Pilih user..."}
                        <ChevronsUpDown className="opacity-50 size-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-full" align="start">
                      <Command>
                        <CommandInput placeholder="Cari user..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>Tidak ada user</CommandEmpty>
                          {users.map((u) => (
                            <CommandItem
                              key={u.id}
                              // Menggabungkan fullName dan email untuk pencarian
                              value={`${u.fullName} ${u.email}`} 
                              onSelect={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  userId: u.id,
                                }))
                                setOpenAssignee(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.userId === u.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                {/* <<< PERUBAHAN DI SINI: Mengakses 'fullName' untuk menampilkan nama di CommandItem >>> */}
                                <span className="font-medium">{u.fullName}</span> 
                                <span className="text-xs text-muted-foreground">
                                  {u.email}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    <Check className="mr-2 h-4 w-4" />
                    {loading ? "Menyimpan..." : "Assign Ticket"}
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