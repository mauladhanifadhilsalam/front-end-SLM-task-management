import { Fragment } from "react"
import { Route } from "react-router-dom"
import { ProtectedRoute } from "../components/ProtectedRoute"
import PmDashboard from "../pages/dasboard/pm/dasboard"
import NotificationPage from "../pages/notification/notification"

export const pmRoutes = (
  <Fragment>
    <Route
      path="/project-manager/dashboard"
      element={
        <ProtectedRoute allowedRoles={["project_manager"]}>
          <PmDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/project-manager-dashboard/notifications/me"
      element={
        <ProtectedRoute allowedRoles={["project_manager"]}>
          <NotificationPage />
        </ProtectedRoute>
      }
    />
  </Fragment>
)
