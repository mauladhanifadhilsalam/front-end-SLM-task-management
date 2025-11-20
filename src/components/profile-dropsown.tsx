"use client"

import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"

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
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase()
    }
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }

  if (email && email.length > 0) {
    return email.slice(0, 2).toUpperCase()
  }

  return "US"
}

export function ProfileDropdown() {
    const [me, setMe] = React.useState<Me | null>(null)
    const [loading, setLoading] = React.useState<boolean>(true)
    const [error, setError] = React.useState<string | null>(null)
    const navigate = useNavigate()

    React.useEffect(() => {
        const fetchMe = async () => {
        try {
            setLoading(true)
            setError(null)

            const token = localStorage.getItem("token")
            const res = await axios.get(`${API_BASE}/auth/profile`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            })

            const data = (res.data?.data ?? res.data) as Me
            setMe(data)
        } catch (e: any) {
            setError(e?.response?.data?.message || "Failed to load profile")
        } finally {
            setLoading(false)
        }
        }

        fetchMe()
    }, [])

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("role")
        navigate("/") 
    }

    const displayName = me?.fullName || me?.name || "User"
    const displayEmail = me?.email || "-"

    return (
        <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild className="cursor-pointer">
            <Button
            variant="ghost"
            className="relative h-8 w-8 rounded-full p-0"
            aria-label="User menu"
            >
            <Avatar className="h-8 w-8">
                {me?.avatarUrl && (
                <AvatarImage src={me.avatarUrl} alt={displayName} />
                )}
                <AvatarFallback className="text-xs font-medium">
                {getInitials(displayName, displayEmail)}
                </AvatarFallback>
            </Avatar>
            </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1.5">
                <p className="text-sm font-medium leading-none">
                {loading ? "Loading..." : displayName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                {loading ? "" : displayEmail}
                </p>
                {error && (
                <span className="text-[10px] text-red-500">
                    {error}
                </span>
                )}
            </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
            <DropdownMenuItem asChild>
                <Link to="/settings/profile" className="flex items-center gap-2">
                <IconUser className="h-4 w-4" />
                <span>Profile</span>
                </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center gap-2">
                <IconSettings className="h-4 w-4" />
                <span>Settings</span>
                </Link>
            </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={handleLogout}
            >
            <IconLogout className="mr-2 h-4 w-4" />
            <span>Sign out</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
    )
}
