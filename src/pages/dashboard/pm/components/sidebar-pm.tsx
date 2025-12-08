import * as React from "react"
import {
  IconLayoutDashboard,
  IconUsers,
  IconUserStar,
  IconFolder,
  IconTimeline,
  IconUsersGroup,
  IconTicket,
  IconUserCheck,
  IconSettings,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Project Management",
    email: "pm@example.com",
    avatar: "/avatars/pm.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/project-manager/dashboard",
      icon: IconLayoutDashboard,
    },
    {
      title: "Developers",
      url: "/project-manager/dashboard/developer-highlight",
      icon: IconUsers,
    },
    {
      title: "Project Owners",
      url: "/project-manager/dashboard/project-owners",
      icon: IconUserStar,
    },
    {
      title: "Projects",
      url: "/project-manager/dashboard/projects",
      icon: IconFolder,
    },
    {
      title: "Ticket Issue",
      url: "/project-manager/dashboard/ticket-issue",
      icon: IconTicket,
    },
  ],
}

export function AppSidebarPm(
  props: React.ComponentProps<typeof Sidebar>,
) {
  return (
        <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
            <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton className="data-[slot=sidebar-menu-button]:!p-1.5" asChild>
                <a href="/project-manager/dashboard">
                    <span className="text-base font-semibold">
                        Project Management
                    </span>
                </a>
                </SidebarMenuButton>
            </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
            <NavMain items={data.navMain} />
        </SidebarContent>

        <SidebarFooter>
            <NavUser />
        </SidebarFooter>
        </Sidebar>
  )
}
