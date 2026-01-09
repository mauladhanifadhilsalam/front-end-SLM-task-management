import * as React from "react"
import {
  IconFolder,
  IconUsers,
  IconTicket,
  IconUserCheck,
  IconPaperclip,
  IconTimeline,
  IconUserStar,
  IconLayoutDashboard,
  IconMessage,
  IconMessageDots,
  IconActivityHeartbeat,
  IconNotification,
  IconUsersGroup,
  IconFileDescription
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
      url: "/admin/dashboard",
      icon: IconLayoutDashboard,
    },
    {
      title: "Users",
      url: "/admin/dashboard/users",
      icon: IconUsers,
    },
    {
      title: "Project Owners",
      url: "/admin/dashboard/project-owners",
      icon: IconUserStar,
    },
    {
      title: "Projects",
      url: "/admin/dashboard/projects",
      icon: IconFolder,
    },
    {
      title: "Project Phase",
      url: "/admin/dashboard/project-phases",
      icon: IconTimeline,
    },
    {
      title: "Project Assignments",
      url: "/admin-dashboard/project-assignments",
      icon: IconUsersGroup  ,
    },
    {
      title: "Tickets",
      url: "/admin/dashboard/tickets",
      icon: IconTicket,
    },
    {
      title: "Ticket Assignee",
      url: "/admin/dashboard/ticket-assignees",
      icon: IconUserCheck,
    },
    {
      title: "Team Updates",
      url: "/admin/dashboard/team-updates",
      icon: IconMessage,
    },
    {
      title: "Project Updates",
      url: "/admin/dashboard/project-updates",
      icon: IconFileDescription,
    },
    {
      title: "Comments",
      url: "/admin/dashboard/comments",
      icon: IconMessageDots,
    },
    {
      title: "File Attachment",
      url: "/admin/dashboard/file-attachments",
      icon: IconPaperclip,
    },
    {
      title: "Notifications",
      url: "/admin-dashboard/notifications",
      icon: IconNotification,
    },
    {
      title: "Activity Log",
      url: "/admin/dashboard/activity-logs",
      icon: IconActivityHeartbeat,
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
