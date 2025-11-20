import { Routes, Route } from "react-router-dom"
import SigninUserPage from "../pages/signin/signinUser"
import { NotFoundError } from "../pages/errors/not-found-error"
import NotificationMeRedirect from "../pages/notification/notificationRedirect/notificationMeRedirect"

import { adminRoutes } from "./admin-routes"
import { pmRoutes } from "./pm-routes"
import { devRoutes } from "./dev-routes"

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SigninUserPage />} />
      <Route path="/notification/me" element={<NotificationMeRedirect />} />
      <Route path="/*" element={<NotFoundError />} />

      {adminRoutes}
      {pmRoutes}
      {devRoutes}
    </Routes>
  )
}
