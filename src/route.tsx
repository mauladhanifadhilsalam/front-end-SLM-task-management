import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SigninUserPage from './pages/signin/signinUser'
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
import AdminProjects from './pages/dasboard/admin/adminProject'
import CreateProjectPage from './pages/dasboard/admin/project/createProject'
import ViewProject from './pages/dasboard/admin/project/viewProject'
import EditProject from './pages/dasboard/admin/project/editProject'
import AdminProjectPhases from './pages/dasboard/admin/adminProjectPhases'
import EditProjectPhases from './pages/dasboard/admin/projectPhase/editProjectPhases'
import ViewProjectPhases from './pages/dasboard/admin/projectPhase/viewProjectPhases'
import CreateProjectPhases from './pages/dasboard/admin/projectPhase/createProjectPhases'
import AdminTickets from './pages/dasboard/admin/adminTickets'
import CreateTickets from './pages/dasboard/admin/tickets/createTickets'
import ViewTickets from './pages/dasboard/admin/tickets/viewTickets'
import EditTickets from './pages/dasboard/admin/tickets/editTickets'
import AdminComments from './pages/dasboard/admin/adminComments'
import CreateComments from './pages/dasboard/admin/comments/createComments'
import EditComments from './pages/dasboard/admin/comments/editComments'
import ViewComments from './pages/dasboard/admin/comments/viewComments'
import TicketAssignee from './pages/dasboard/admin/adminTicketAssignee'
import CreateTicketAssigneePage from './pages/dasboard/admin/ticketAssignee/createTicketAssignee'
import ViewTicketAssignee from './pages/dasboard/admin/ticketAssignee/viewTicketAssignee'
import EditTicketAssignee from './pages/dasboard/admin/ticketAssignee/editTicketAssignee'
import AdminFileAttachments from './pages/dasboard/admin/adminFileAttachment'
import CreateFileAttachment from './pages/dasboard/admin/fileAttachment/createFileAttachment'
import ActivityLogPage from './pages/dasboard/admin/adminActivityLogs'
import AdminNotification from './pages/dasboard/admin/adminNotification'
import ViewNotification from './pages/dasboard/admin/notification/viewNotification'
import NotificationPage from './pages/notification/notification'
import NotificationMeRedirect from './pages/notification/notificationRedirect/notificationMeRedirect'
import { NotFoundError } from './pages/errors/not-found-error'

import { ProtectedRoute } from "./components/ProtectedRoute"
import { View } from 'lucide-react'
import { ThemeProvider } from './components/theme-provider'

const rootElement = document.getElementById('root') as HTMLElement;

createRoot(rootElement).render(
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SigninUserPage />} />
          <Route path='/*' element={<NotFoundError />}/>
          <Route path='/notification/me' element={<NotificationMeRedirect />} />
            <Route
              path="/project-manager-dashboard/notifications/me"
              element={
                <ProtectedRoute allowedRoles={["project_manager"]}>
                  <NotificationPage />
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
            path="/admin/dashboard/project-owners"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminProjectOwners />
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
            path="/admin/dashboard/users/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <EditUsers />
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
            path="/admin/dashboard/projects"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminProjects />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard/projects/create"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <CreateProjectPage />
              </ProtectedRoute>
            }
          />

            <Route
              path='/admin/dashboard/projects/view/:id'
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ViewProject />
                </ProtectedRoute>
              }
            />

          <Route
            path='/admin/dashboard/projects/edit/:id'
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <EditProject />
              </ProtectedRoute>
            }
          />


          <Route
            path="/admin/dashboard/project-phases"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminProjectPhases />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard/project-phases/create"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <CreateProjectPhases />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard/project-phases/view/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ViewProjectPhases />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard/project-phases/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <EditProjectPhases />
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
            path="/admin/dashboard/tickets/create"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <CreateTickets />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard/tickets/view/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ViewTickets />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard/tickets/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <EditTickets />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard/comments"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminComments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard/comments/create"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <CreateComments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard/comments/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <EditComments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard/comments/view/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ViewComments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard/ticket-assignees"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <TicketAssignee />
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
            path="/admin/dashboard/ticket-assignees/view/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ViewTicketAssignee />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard/ticket-assignees/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <EditTicketAssignee />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard/file-attachments"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminFileAttachments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard/file-attachments/create"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <CreateFileAttachment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard/notifications"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminNotification />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard/notifications/view/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ViewNotification />
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

          <Route
            path="/admin/dashboard/activity-logs"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ActivityLogPage />
              </ProtectedRoute>
            }
          />

          

        </Routes>
      </BrowserRouter>
    </ThemeProvider>
)
