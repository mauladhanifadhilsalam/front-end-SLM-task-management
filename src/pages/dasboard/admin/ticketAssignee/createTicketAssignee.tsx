"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Check } from "lucide-react"
import * as React from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Swal from "sweetalert2"

interface User {
  id: number;
  fullName: string;
  email: string;
}

interface Ticket {
  id: number;
  title: string;
  assignees: {
    id: number;
    user: {
      id: number;
      fullName: string;
      email: string;
    };
  }[];
}

export default function CreateTicketAssigneePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  const [tickets, setTickets] = React.useState<Ticket[]>([])
  const [users, setUsers] = React.useState<User[]>([])
  const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(null)

  const [formData, setFormData] = React.useState({
    ticketId: undefined as number | undefined,
    userIds: [] as number[],
  })

  const API_BASE = "http://localhost:3000"

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token")
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // Fetch data tiket & user
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined

        const [ticketRes, userRes] = await Promise.all([
          axios.get(`${API_BASE}/tickets`, { headers }),
          axios.get(`${API_BASE}/users`, { headers }),
        ])

        setTickets(ticketRes.data || [])
        setUsers(userRes.data || [])
      } catch (err) {
        console.error(err)
        setErrorMsg("Gagal memuat data tiket atau user.")
      }
    }
    fetchData()
  }, [])

  // Fetch detail ticket ketika ticketId berubah
  React.useEffect(() => {
    const fetchTicketDetail = async () => {
      if (!formData.ticketId) {
        setSelectedTicket(null)
        return
      }

      try {
        const res = await axios.get(`${API_BASE}/tickets/${formData.ticketId}`, {
          headers: getAuthHeaders(),
        })
        setSelectedTicket(res.data)
      } catch (err) {
        console.error(err)
      }
    }

    fetchTicketDetail()
  }, [formData.ticketId])

  // Reset userIds ketika ticket berubah
  React.useEffect(() => {
    setFormData(prev => ({ ...prev, userIds: [] }))
  }, [formData.ticketId])

  // Cek apakah user sudah di-assign ke ticket yang dipilih
  const isUserAssigned = (userId: number) => {
    if (!selectedTicket) return false
    return selectedTicket.assignees.some(a => a.user.id === userId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    if (!formData.ticketId || formData.userIds.length === 0) {
      setErrorMsg("Ticket dan minimal satu assignee wajib dipilih.")
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

      // Loop semua userIds → kirim POST satu-satu
      for (const uid of formData.userIds) {
        const payload = { ticketId: formData.ticketId, userId: uid }

        console.log("Mengirim request:", payload)

        await axios.post(
          `${API_BASE}/ticket-assignees`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )
      }

      const ticket = tickets.find((t) => t.id === formData.ticketId)
      const selectedUsers = users
        .filter((u) => formData.userIds.includes(u.id))
        .map((u) => u.fullName)
        .join(", ")

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: `Ticket "${ticket?.title}" berhasil di-assign ke: ${selectedUsers}`,
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      })

      navigate("/admin/dashboard/ticket-assignees")
    } catch (err: any) {
      console.error(err)
      const msg = err?.response?.data?.message || "Gagal assign ticket."
      await Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: msg,
        confirmButtonText: "OK",
      })
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  const toggleUser = (userId: number) => {
    // Jangan toggle jika user sudah di-assign
    if (isUserAssigned(userId)) return

    setFormData((prev) => ({
      ...prev,
      userIds: prev.userIds.includes(userId)
        ? prev.userIds.filter((id) => id !== userId)
        : [...prev.userIds, userId],
    }))
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
        <div className="flex flex-col px-4 lg:px-6 py-6">
        
          {/* Tombol Kembali */}
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
            Pilih ticket & beberapa user untuk ditugaskan.
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Ticket Assignee</CardTitle>
              <CardDescription>Pilih tiket & user yang akan menerima tugas.</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Alert Error */}
                {errorMsg && (
                  <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                    {errorMsg}
                  </div>
                )}

                {/* Ticket Select */}
                <div className="space-y-2">
                  <Label htmlFor="ticket">Ticket *</Label>
                  <Select
                    value={formData.ticketId?.toString()}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, ticketId: parseInt(value) }))
                    }
                    disabled={loading}
                  >
                    <SelectTrigger id="ticket" className="w-[500px]">
                      <SelectValue placeholder="Pilih Ticket" />
                    </SelectTrigger>
                    <SelectContent>
                      {tickets.map((ticket) => (
                        <SelectItem key={ticket.id} value={ticket.id.toString()}>
                          {ticket.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Assignees - Checkbox List */}
<div className="space-y-2">
  <Label>Assignees *</Label>

  <div className="border rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto">

    {/* 🚀 CASE 1 — SEBELUM PILIH TICKET → TAMPILKAN SEMUA USER SECARA NORMAL */}
    {!formData.ticketId && (
      <>
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
            onClick={() => toggleUser(user.id)}
          >
            <input
              type="checkbox"
              checked={formData.userIds.includes(user.id)}
              onChange={() => toggleUser(user.id)}
              className="h-4 w-4"
              disabled={loading}
            />
            <div className="flex-1">
              <div className="font-medium text-sm">{user.fullName}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
          </div>
        ))}
      </>
    )}

    {/* 🚀 CASE 2 — SETELAH TICKET DIPILIH → TAMPILKAN USER + STATUS ASSIGNED */}
    {formData.ticketId &&
      users.length > 0 &&
      users.map((user) => {
        const isAssigned = isUserAssigned(user.id)
        return (
          <div
            key={user.id}
            className={`flex items-center gap-3 p-2 rounded ${
              isAssigned
                ? "opacity-50 cursor-not-allowed bg-muted"
                : "hover:bg-muted/50 cursor-pointer"
            }`}
            onClick={() => toggleUser(user.id)}
          >
            <input
              type="checkbox"
              checked={formData.userIds.includes(user.id) || isAssigned}
              onChange={() => toggleUser(user.id)}
              className="h-4 w-4"
              disabled={loading || isAssigned}
            />

            <div className="flex-1">
              <div className="font-medium text-sm flex items-center gap-2">
                {user.fullName}

                {isAssigned && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    Already Assigned
                  </span>
                )}
              </div>

              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
          </div>
        )
      })}
  </div>

  <p className="text-xs text-muted-foreground">
    {formData.userIds.length} assignee dipilih
  </p>
</div>


                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/admin/dashboard/ticket-assignees")}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
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