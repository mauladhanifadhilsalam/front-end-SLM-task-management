"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

export default function ActivityLogPage() {
  const [search, setSearch] = React.useState("")

  // Dummy data activity logs
  const logs = [
    {
      id: 1,
      user: "Admin A",
      role: "ADMIN",
      action: "CREATE",
      entity: "Project",
      description: "Created new project 'Website Redesign'",
      timestamp: new Date("2025-11-03T09:25:00"),
    },
    {
      id: 2,
      user: "Project Manager B",
      role: "PROJECT_MANAGER",
      action: "UPDATE",
      entity: "Ticket",
      description: "Updated ticket status to 'In Progress'",
      timestamp: new Date("2025-11-03T10:05:00"),
    },
    {
      id: 3,
      user: "QA C",
      role: "QA",
      action: "DELETE",
      entity: "Bug Report",
      description: "Deleted a duplicate bug report",
      timestamp: new Date("2025-11-03T10:45:00"),
    },
    {
      id: 4,
      user: "Developer D",
      role: "DEVELOPER",
      action: "ASSIGN",
      entity: "Ticket",
      description: "Assigned ticket #12 to QA C",
      timestamp: new Date("2025-11-03T11:15:00"),
    },
    {
      id: 5,
      user: "Admin A",
      role: "ADMIN",
      action: "LOGIN",
      entity: "System",
      description: "Admin logged into the system",
      timestamp: new Date("2025-11-03T08:00:00"),
    },
  ]

  const filteredLogs = logs.filter(
    (log) =>
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entity.toLowerCase().includes(search.toLowerCase()) ||
      log.description.toLowerCase().includes(search.toLowerCase())
  )

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE":
        return "bg-green-100 text-green-700"
      case "UPDATE":
        return "bg-blue-100 text-blue-700"
      case "DELETE":
        return "bg-red-100 text-red-700"
      case "ASSIGN":
        return "bg-purple-100 text-purple-700"
      case "LOGIN":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1 p-6">
          <Card className="w-full">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-2xl font-semibold">Activity Logs</CardTitle>
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Search by user, action, or entity..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-[250px]"
                  />
                  <Button variant="outline" onClick={() => setSearch("")}>
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">#</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length > 0 ? (
                      filteredLogs.map((log, index) => (
                        <TableRow key={log.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{log.user}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getActionColor(log.action)}>{log.action}</Badge>
                          </TableCell>
                          <TableCell>{log.entity}</TableCell>
                          <TableCell>{log.description}</TableCell>
                          <TableCell>{format(log.timestamp, "dd MMM yyyy, HH:mm")}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-500 py-6">
                          No activity found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
