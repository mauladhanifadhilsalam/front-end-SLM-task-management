"use client"

import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

import {
  IconLogout,
  IconSettings,
  IconUser,
} from "@tabler/icons-react"

const API_BASE = import.meta.env.VITE_API_BASE

type Me = {
  id: number
  fullName?: string
  name?: string
  email?: string
  avatarUrl?: string | null
}

function getInitials(name?: string, email?: string) {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  if (email) return email.slice(0, 2).toUpperCase()
  return "US"
}

export function ProfileDropdown() {
  const [me, setMe] = React.useState<Me | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [openLogoutDialog, setOpenLogoutDialog] = React.useState(false)
  const navigate = useNavigate()

  React.useEffect(() => {
    const fetchMe = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        const res = await axios.get(`${API_BASE}/auth/profile`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        const data = res.data?.data ?? res.data
        setMe(data)
      } catch (e: any) {
        const msg = e?.response?.data?.message || "Gagal memuat profil"
        setError(msg)
        toast.error("Gagal memuat profil", { description: msg })
      } finally {
        setLoading(false)
      }
    }
    fetchMe()
  }, [])

  const confirmLogout = () => {
    setOpenLogoutDialog(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")

    toast.success("Berhasil logout", {
      description: "Anda telah keluar dari sesi.",
    })

    navigate("/")
  }

  const displayName = me?.fullName || me?.name || "User"
  const displayEmail = me?.email || "-"

  return (
    <>
      {/* Dropdown */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-8 w-8 rounded-full p-0"
          >
            <Avatar className="h-8 w-8">
              {me?.avatarUrl ? (
                <AvatarImage src={me.avatarUrl} />
              ) : (
                <AvatarFallback>{getInitials(displayName, displayEmail)}</AvatarFallback>
              )}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium">{loading ? "Loading..." : displayName}</p>
              <p className="text-xs text-muted-foreground">{loading ? "" : displayEmail}</p>
              {error && <span className="text-[10px] text-red-500">{error}</span>}
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link to="/settings/profile" className="flex items-center gap-2">
                <IconUser className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center gap-2">
                <IconSettings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={confirmLogout}
          >
            <IconLogout className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Logout Confirmation AlertDialog */}
      <AlertDialog open={openLogoutDialog} onOpenChange={setOpenLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout?</AlertDialogTitle>
            <AlertDialogDescription>
              Kamu yakin ingin keluar? Kamu harus login kembali untuk mengakses dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
              Keluar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
