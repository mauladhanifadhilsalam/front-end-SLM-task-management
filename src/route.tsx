import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SigninUserPage from './pages/signin/signinUser'
import SigninAdminPage from './pages/signin/signinAdmin'
import AdminDashboard from './pages/dasboard/admin/dashboard'
import PmDashboard from './pages/dasboard/pm/dasboard'
import DevDashboard from './pages/dasboard/dev/dasboard'
import AdminUsers from './pages/dasboard/admin/adminUsers'
import CreateUsers from './pages/dasboard/admin/users/createUsers'
import ViewUsers from './pages/dasboard/admin/users/viewUsers'
import EditUsers from './pages/dasboard/admin/users/editUsers'
import { ProtectedRoute } from "./components/ProtectedRoute"

const rootElement = document.getElementById('root') as HTMLElement;

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SigninUserPage />} />
        <Route path="/admin/signin" element={<SigninAdminPage />} />

        {/* === DASHBOARD ROUTES === */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard/users/create"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CreateUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard/users/view/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ViewUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard/users/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EditUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/project-manager/dashboard"
          element={
            <ProtectedRoute allowedRoles={["project_manager"]}>
              <PmDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/developer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["developer"]}>
              <DevDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
