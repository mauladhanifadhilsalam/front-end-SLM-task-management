import { Fragment } from "react"
import { Route } from "react-router-dom"
import { ProtectedRoute } from "../components/ProtectedRoute"
import DevDashboard from "../pages/dashboard/dev/dasboard"
import NotificationPage from "../pages/notification/notification"

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
  </Fragment>
)
