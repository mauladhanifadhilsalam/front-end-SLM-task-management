import * as React from "react"
import {
  IconCamera,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFolder,
  IconSettings,
  IconUsers,
  IconTicket,
  IconUserCheck,
  IconPaperclip,
  IconTimeline,
  IconUserStar,
  IconLayoutDashboard,
  IconMessage,
  IconMessageDots,
  IconActivity,
  IconActivityHeartbeat,
  IconNotification,
  IconHierarchy2,
  IconUsersGroup
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
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
import { title } from "process"
import { url } from "inspector"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/developer/dashboard",
      icon: IconLayoutDashboard,
    },
    {
      title: "Projects",
      url: "/developer-dashboard/projects",
      icon: IconFolder,
    },
    {
      title: "Ticket Issue",
      url: "/developer-dashboard/ticket-issue",
      icon: IconTicket,
    },
  ],
}

export function AppSidebarDev({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <span className="text-base font-semibold">Project Management</span>
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
