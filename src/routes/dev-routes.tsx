import { Fragment } from "react"
import { Route } from "react-router-dom"
import { ProtectedRoute } from "../components/ProtectedRoute"
import DevDashboard from "../pages/dashboard/dev/dasboard"
import NotificationPage from "../pages/notification/notification"
import DeveloperProjects from "@/pages/dashboard/dev/DeveloperProject/DevProject"
import DevProjectTask from "@/pages/dashboard/dev/DeveloperProject/DevProjectTask"
import DeveloperTaskDetail from "@/pages/dashboard/dev/DeveloperProject/DevDetailTask"
import DevTicketsPage from "@/pages/dashboard/dev/ticket/ticket-page"
import DevTaskTicketsPage from "@/pages/dashboard/dev/ticket/ticket-task-page"
import DevViewTicketIssue from "@/pages/dashboard/dev/ticket/view-ticket-page"
import DevCreateTicketIssue from "@/pages/dashboard/dev/ticket/create-ticket-issue"
import DevEditTicketIssue from "@/pages/dashboard/dev/ticket/edit-ticket-issue"
import DevAddTicketAttachment from "@/pages/dashboard/dev/fileAttachment/add-file-attachment"
import DailyUpdatesPage from "@/pages/dashboard/dev/daily-updates/daily-updates-page"
import CreateDailyUpdatePage from "@/pages/dashboard/dev/daily-updates/create-daily-update-page"
import ViewDailyUpdatePage from "@/pages/dashboard/dev/daily-updates/view-daily-update-page"
import EditDailyUpdatePage from "@/pages/dashboard/dev/daily-updates/edit-daily-update-page"

export const devRoutes = (
  <Fragment>
    <Route
      path="/developer/dashboard"
      element={
        <ProtectedRoute allowedRoles={["developer"]}>
          <DevDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/developer-dashboard/notifications/me"
      element={
        <ProtectedRoute allowedRoles={["developer"]}>
          <NotificationPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/developer-dashboard/projects"
      element={
        <ProtectedRoute allowedRoles={["developer"]}>
          <DeveloperProjects />
        </ProtectedRoute>
      }
    />

    <Route
      path="/developer-dashboard/projects/:projectId"
      element={
        <ProtectedRoute allowedRoles={["developer"]}>
          <DevProjectTask />
        </ProtectedRoute>
      }
    />

    <Route
      path="/developer-dashboard/projects/:projectId/tasks/:taskId"
      element={
        <ProtectedRoute allowedRoles={["developer"]}>
          <DeveloperTaskDetail />
        </ProtectedRoute>
      }
    />
    <Route
      path="/developer-dashboard/ticket-task"
      element={
        <ProtectedRoute allowedRoles={["developer"]}>
          <DevTaskTicketsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/developer-dashboard/ticket-issue"
      element={
        <ProtectedRoute allowedRoles={["developer"]}>
          <DevTicketsPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/developer-dashboard/ticket-issue/view/:id"
      element={
        <ProtectedRoute allowedRoles={["developer"]}>
          <DevViewTicketIssue />
        </ProtectedRoute>
      }
    />

    <Route
      path="/developer-dashboard/ticket-issue/create"
      element={
        <ProtectedRoute allowedRoles={["developer"]}>
          <DevCreateTicketIssue />
        </ProtectedRoute>
      }
    />

    <Route
      path="/developer-dashboard/ticket-issue/edit/:id"
      element={
        <ProtectedRoute allowedRoles={["developer"]}>
          <DevEditTicketIssue />
        </ProtectedRoute>
      }
    />

    <Route
      path="/developer-dashboard/ticket-issue/:id/attachments/new"
      element={
        <ProtectedRoute allowedRoles={["developer"]}>
          <DevAddTicketAttachment />
        </ProtectedRoute>
      }
    />
    <Route
      path="/developer-dashboard/daily-updates"
      element={
        <ProtectedRoute allowedRoles={["developer"]}>
          <DailyUpdatesPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/developer-dashboard/daily-updates/create"
      element={
        <ProtectedRoute allowedRoles={["developer"]}>
          <CreateDailyUpdatePage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/developer-dashboard/daily-updates/view/:id"
      element={
        <ProtectedRoute allowedRoles={["developer"]}>
          <ViewDailyUpdatePage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/developer-dashboard/daily-updates/edit/:id"
      element={
        <ProtectedRoute allowedRoles={["developer"]}>
          <EditDailyUpdatePage />
        </ProtectedRoute>
      }
    />
  </Fragment>
)
