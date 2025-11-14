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
import Swal from "sweetalert2"

// Define interface for User data to match API response (using fullName)
interface User {
  id: number;
  fullName: string;
  email: string;
}

export default function CreateTicketAssigneePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  const [tickets, setTickets] = React.useState<{ id: number; title: string }[]>([])
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
        setUsers(userRes.data || [])
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

      // Tampilkan SweetAlert2 untuk sukses
      const selectedTicket = tickets.find((t) => t.id === formData.ticketId)
      const selectedUser = users.find((u) => u.id === formData.userId)

    await Swal.fire({
      icon: "success",
      title: "Berhasil!",
      text: `Ticket "${selectedTicket?.title}" berhasil di-assign ke ${selectedUser?.fullName}`,
      showConfirmButton: false,   // hilangkan tombol OK
      timer: 1500,                // auto close setelah 1.5 detik
      timerProgressBar: true,     // opsional: tampilkan progress bar
    })


      // Redirect setelah SweetAlert ditutup
      navigate("/admin/dashboard/ticket-assignees")
    } catch (err: any) {
      console.error(err)
      const errorMessage = err?.response?.data?.message || "Gagal membuat penugasan."
      
      // Tampilkan SweetAlert2 untuk error
      await Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: errorMessage,
        confirmButtonText: "OK",
        confirmButtonColor: "#ef4444",
      })
      
      setErrorMsg(errorMessage)
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
              onClick={() => navigate("/admin/dashboard/ticket-assignees")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
          </div>
          
          <h1 className="text-2xl font-semibold">Assign Ticket</h1>
          <p className="text-muted-foreground mb-6">
            Buat penugasan tiket baru dengan memilih tiket dan user yang akan ditugaskan.
          </p>
          
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}