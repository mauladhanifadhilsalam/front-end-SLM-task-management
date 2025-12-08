import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "./mode-toggle"
import { IconMail } from "@tabler/icons-react"
import { Link } from "react-router-dom"
import { useUnread } from "@/features/notification/hooks/use-unread"

export function SiteHeader() {
  const role = localStorage.getItem("role")
  const { unread } = useUnread() 

  const label = function () {
    if (role === "admin") return "Admin Dashboard"
    if (role === "project_manager") return "Project Manager Dashboard"
    if (role === "developer") return "Developer Dashboard"
    return "Dashboard"
  }

  const showMailIcon = role === "project_manager" || role === "developer"

  return (
    <header className="flex h-12 sm:h-(--header-height) shrink-0 items-center gap-2 border-b">
      <div className="flex w-full items-center gap-1 px-3 sm:px-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />

        <Separator orientation="vertical" className="mx-2 hidden h-4 sm:block" />

        <h1 className="truncate text-sm font-medium sm:text-base">
          {label()}
        </h1>

        <Separator orientation="vertical" className="mx-2 hidden h-4 sm:block" />

        <div className="ml-1 sm:ml-0">
          <ModeToggle />
        </div>

        <div className="ml-auto flex items-center gap-3 sm:gap-5 lg:gap-7">
          {showMailIcon && (
            <Link to="/notification/me" className="relative flex items-center">
              <IconMail size={18} className="cursor-pointer sm:h-5 sm:w-5" />

              {unread > 0 && (
                <span
                  className="
                    absolute -top-1 -right-1
                    flex h-4 min-w-4 items-center justify-center
                    rounded-full bg-red-500 text-[9px] font-semibold
                    text-white px-1 shadow
                  "
                >
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
