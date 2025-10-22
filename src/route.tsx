import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SigninUserPage from './pages/signin/signinUser'
import SigninAdminPage from './pages/signin/signinAdmin'
import AdminDashboard from './pages/dasboard/admin/dasboard'
import PmDashboard from './pages/dasboard/pm/dasboard'
import DevDashboard from './pages/dasboard/dev/dasboard'
import { ProtectedRoute } from "./components/ProtectedRoute"

const rootElement = document.getElementById('root') as HTMLElement;

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<SigninUserPage />} />
          <Route path='/admin/signin' element={<SigninAdminPage />}></Route>
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
