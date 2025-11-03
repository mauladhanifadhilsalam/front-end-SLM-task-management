"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
} from "@/components/ui/command"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon, ChevronsUpDown, ArrowLeft, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import * as React from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export default function CreateTicketAssigneePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

  const [tickets, setTickets] = React.useState<{ id: number; title: string }[]>([])
  const [users, setUsers] = React.useState<{ id: number; name: string; email: string }[]>([])

  const [formData, setFormData] = React.useState({
    ticketId: undefined as number | undefined,
    assigneeId: undefined as number | undefined,
    status: "ASSIGNED",
    assignedDate: undefined as Date | undefined,
    dueDate: undefined as Date | undefined,
  })

  const [openTicket, setOpenTicket] = React.useState(false)
  const [openAssignee, setOpenAssignee] = React.useState(false)

  // 🔹 Ambil data tiket & user dari API
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

  // 🔹 Validasi tanggal
  const isInvalidDateRange =
    formData.assignedDate &&
    formData.dueDate &&
    formData.dueDate <= formData.assignedDate

  // 🔹 Submit data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!formData.ticketId || !formData.assigneeId) {
      setErrorMsg("Ticket dan Assignee wajib dipilih.")
      setLoading(false)
      return
    }

    if (isInvalidDateRange) {
      setErrorMsg("Due date tidak boleh sebelum tanggal assign.")
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem("token") || ""
      const payload = {
        ...formData,
        assignedDate: formData.assignedDate ? formData.assignedDate.toISOString() : null,
        dueDate: formData.dueDate ? formData.dueDate.toISOString() : null,
      }

      await axios.post("http://localhost:3000/ticket-assignee", payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })

      setSuccessMsg("Ticket berhasil di-assign.")
      setTimeout(() => navigate("/admin/dashboard/ticket-assignee"), 1000)
    } catch (err: any) {
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
              <CardDescription>Pilih tiket dan user yang akan menerima tugas.</CardDescription>
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
                      <Button variant="outline" role="combobox" className="justify-between">
                        {formData.ticketId
                          ? tickets.find((t) => t.id === formData.ticketId)?.title
                          : "Pilih ticket..."}
                        <ChevronsUpDown className="opacity-50 size-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <Command>
                        <CommandInput placeholder="Cari ticket..." />
                        <CommandList>
                          {tickets.map((t) => (
                            <CommandItem
                              key={t.id}
                              onSelect={() => {
                                setFormData({ ...formData, ticketId: t.id })
                                setOpenTicket(false)
                              }}
                            >
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
                      <Button variant="outline" role="combobox" className="justify-between">
                        {formData.assigneeId
                          ? users.find((u) => u.id === formData.assigneeId)?.name
                          : "Pilih user..."}
                        <ChevronsUpDown className="opacity-50 size-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <Command>
                        <CommandInput placeholder="Cari user..." />
                        <CommandList>
                          {users.map((u) => (
                            <CommandItem
                              key={u.id}
                              onSelect={() => {
                                setFormData({ ...formData, assigneeId: u.id })
                                setOpenAssignee(false)
                              }}
                            >
                              {u.name} — {u.email}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Assigned & Due Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Assigned Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !formData.assignedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 size-4" />
                          {formData.assignedDate
                            ? format(formData.assignedDate, "PPP")
                            : "Pilih tanggal assign"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.assignedDate}
                          onSelect={(date) => setFormData({ ...formData, assignedDate: date })}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !formData.dueDate && "text-muted-foreground",
                            isInvalidDateRange && "border-red-500 text-red-600"
                          )}
                        >
                          <CalendarIcon className="mr-2 size-4" />
                          {formData.dueDate
                            ? format(formData.dueDate, "PPP")
                            : "Pilih due date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.dueDate}
                          onSelect={(date) => setFormData({ ...formData, dueDate: date })}
                          disabled={(date) =>
                            formData.assignedDate ? date <= formData.assignedDate : false
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={loading || isInvalidDateRange}
                  >
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
    