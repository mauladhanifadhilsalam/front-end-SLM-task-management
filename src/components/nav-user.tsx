//nav-user
import React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useQuery } from "@tanstack/react-query"
import {
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { logout } from "@/services/auth"
import { fetchMyProfile } from "@/services/profile.service"
import { profileKeys } from "@/lib/query-keys"

const DEFAULT_AVATAR = "/default-avatar.png"

export function NavUser() {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()

  const { data: profile } = useQuery({
    queryKey: profileKeys.me(),
    queryFn: fetchMyProfile,
    staleTime: 5 * 60 * 1000,
  })

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Berhasil logout", {
        description: "Anda telah keluar dari sesi.",
      })
    } catch (err: any) {
      toast.error("Logout gagal", {
        description: err?.message || "Coba lagi nanti.",
      })
    } finally {
      navigate("/")
    }
  }

  const goToNotifications = () => {
    const role = localStorage.getItem("role")

    if (role === "project_manager") {
      navigate("/project-manager-dashboard/notifications/me")
    } else if (role === "developer") {
      navigate("/developer-dashboard/notifications/me")
    } else {
      toast.error("Role tidak dikenali")
    }
  }

  const fullName = profile?.fullName ?? ""
  const email = profile?.email ?? ""
  const avatarInitial = fullName ? fullName[0].toUpperCase() : "U"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={DEFAULT_AVATAR} alt={fullName} />
                <AvatarFallback className="rounded-lg">
                  {avatarInitial}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{fullName}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={DEFAULT_AVATAR} alt={fullName} />
                  <AvatarFallback className="rounded-lg">
                    {avatarInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{fullName}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => {
                  const role = localStorage.getItem("role")
                  const to =
                    role === "admin"
                      ? "/admin/dashboard/settings/profile"
                      : role === "project_manager"
                        ? "/project-manager/dashboard/settings/profile"
                        : role === "developer"
                          ? "/developer/dashboard/settings/profile"
                          : "/settings/profile"
                  navigate(to)
                }}
                className="cursor-pointer"
              >
                <IconUserCircle />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={goToNotifications}>
                <IconNotification />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onSelect={(e) => e.preventDefault()}
                >
                  <IconLogout className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Logout dari akun?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Anda akan keluar dari sesi saat ini. Anda bisa login kembali
                    kapan saja menggunakan akun yang sama.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={handleLogout}
                  >
                    Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
