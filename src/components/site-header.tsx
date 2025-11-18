import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "./mode-toggle"
import { IconMail } from "@tabler/icons-react"
import { useNavigate, Link } from "react-router-dom"
import { ProfileDropdown } from "./profile-dropsown"

export function SiteHeader() {
  const navigate = useNavigate()
  const role = localStorage.getItem("role")

  const label = function () {
    if (role === "admin") {
      return "Admin Dashboard"
    } else if (role === "project_manager") {
      return "Project Manager Dashboard"
    } else if (role === "developer") {
      return "Developer Dashboard"
    }
    return "Dashboard"
  }

  const showMailIcon = role === "project_manager" || role === "developer"

  return (
    <header className="flex h-12 sm:h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-3 sm:px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />

        <Separator
          orientation="vertical"
          className="mx-2 hidden h-4 sm:block"
        />

        <h1 className="max-w-[140px] truncate text-sm font-medium sm:max-w-none sm:text-base">
          {label()}
        </h1>

        <Separator
          orientation="vertical"
          className="mx-2 hidden h-4 sm:block"
        />


        <div className="ml-1 sm:ml-0">
          <ModeToggle />
        </div>

        <div className="ml-auto flex items-center gap-3 sm:gap-5 lg:gap-7">
          {showMailIcon && (
            <Link
              to="/notification/me"
              aria-label="Lihat notifikasi"
              className="flex items-center"
            >
              <IconMail
                size={18}
                className="cursor-pointer sm:h-5 sm:w-5"
              />
            </Link>
          )}

          <ProfileDropdown />
        </div>
      </div>
    </header>
  )
}
