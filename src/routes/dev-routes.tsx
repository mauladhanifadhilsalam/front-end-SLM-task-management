import { Fragment } from "react"
import { Route } from "react-router-dom"
import { ProtectedRoute } from "../components/ProtectedRoute"
import DevDashboard from "../pages/dashboard/dev/dasboard"
import NotificationPage from "../pages/notification/notification"
import DeveloperProjects from "@/pages/dashboard/dev/DeveloperProject/DevProject"
import DevProjectTask from "@/pages/dashboard/dev/DeveloperProject/DevProjectTask"
import DeveloperTaskDetail from "@/pages/dashboard/dev/DeveloperProject/DevDetailTask"
import DevProjectIssue from "@/pages/dashboard/dev/DeveloperProject/DevProjectIssue"
import DevProjectIssueDetail from "@/pages/dashboard/dev/DeveloperProject/DevDetailIssue"

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
        path="/developer-dashboard/issues/:projectId"
        element={
          <ProtectedRoute allowedRoles={["developer"]}>
            <DevProjectIssue />
          </ProtectedRoute>
        }
      />

      <Route
        path="/developer-dashboard/projects/:projectId/issues/:issueId"
        element={
          <ProtectedRoute allowedRoles={["developer"]}>
            <DevProjectIssueDetail />
          </ProtectedRoute>
        }
      />
  </Fragment>
)
