import { Routes, Route } from "react-router-dom"
import SigninUserPage from "../pages/signin/signinUser"
import { NotFoundError } from "../pages/errors/not-found-error"
import NotificationMeRedirect from "../pages/notification/notificationRedirect/notificationMeRedirect"
import ProfileSettingsPage from "@/pages/settings/profile-settings"

import { adminRoutes } from "./admin-routes"
import { pmRoutes } from "./pm-routes"
import { devRoutes } from "./dev-routes"

import { PublicRoute } from "./public-route"
import { ProtectedRoute } from "../components/ProtectedRoute"

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <SigninUserPage />
          </PublicRoute>
        }
      />

      <Route path="/notification/me" element={<NotificationMeRedirect />} />
      <Route
        path="/admin/dashboard/settings/profile"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ProfileSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/project-manager/dashboard/settings/profile"
        element={
          <ProtectedRoute allowedRoles={["project_manager"]}>
            <ProfileSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/developer/dashboard/settings/profile"
        element={
          <ProtectedRoute allowedRoles={["developer"]}>
            <ProfileSettingsPage />
          </ProtectedRoute>
        }
      />

      {adminRoutes}
      {pmRoutes}
      {devRoutes}

      <Route path="/*" element={<NotFoundError />} />
    </Routes>
  )
}
