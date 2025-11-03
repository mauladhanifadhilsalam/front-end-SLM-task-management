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
import AdminProjectOwners from './pages/dasboard/admin/adminProjectOwners'
import AdminProjectOwnersCreate from './pages/dasboard/admin/projectOwners/createProjectOwnerPage'
import EditProjectOwnerPage from './pages/dasboard/admin/projectOwners/editProjectOwnerPage'
import ViewProjectOwnnerPage from './pages/dasboard/admin/projectOwners/viewProjectOwnnerPage'
import { ProtectedRoute } from "./components/ProtectedRoute"
import { View } from 'lucide-react'
import CreateTicketAssigneePage from './pages/dasboard/admin/ticketAssignee/createTicketAssignee'
import EditTicketAssignee from './pages/dasboard/admin/ticketAssignee/editTicketAssignee'
import AdminTickets from './pages/dasboard/admin/adminTicketAssignee'
import ViewTicketAssigneePage from './pages/dasboard/admin/ticketAssignee/viewTicketAssignee'
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
          path="/admin/dashboard/tickets"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminTickets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard/project-owners"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminProjectOwners />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard/ticket-assignees/create"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CreateTicketAssigneePage />
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin/dashboard/project-owners/create"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminProjectOwnersCreate />
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
          path="/admin/dashboard/project-owners/view/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ViewProjectOwnnerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard/tickets/view/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ViewTicketAssigneePage />
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
          path="/admin/dashboard/tickets/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EditTicketAssignee />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard/project-owners/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EditProjectOwnerPage />
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
