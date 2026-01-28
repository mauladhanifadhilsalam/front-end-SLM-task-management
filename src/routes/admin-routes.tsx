import { Fragment } from "react"
import { Route } from "react-router-dom"
import { ProtectedRoute } from "../components/ProtectedRoute"

import AdminDashboard from "../pages/dashboard/admin/dashboard"
import AdminUsers from "../pages/dashboard/admin/users/adminUsers"
import CreateUsers from "../pages/dashboard/admin/users/createUsers"
import ViewUsers from "../pages/dashboard/admin/users/viewUsers"
import EditUsers from "../pages/dashboard/admin/users/editUsers"

import AdminProjectOwners from "../pages/dashboard/admin/projectOwners/adminProjectOwners"
import AdminProjectOwnersCreate from "../pages/dashboard/admin/projectOwners/createProjectOwnerPage"
import EditProjectOwnerPage from "../pages/dashboard/admin/projectOwners/editProjectOwnerPage"
import ViewProjectOwnnerPage from "../pages/dashboard/admin/projectOwners/viewProjectOwnnerPage"

import AdminProjects from "../pages/dashboard/admin/project/adminProject"
import CreateProjectPage from "../pages/dashboard/admin/project/createProject"
import ViewProject from "../pages/dashboard/admin/project/viewProject"
import EditProject from "../pages/dashboard/admin/project/editProject"

import AdminProjectPhases from "../pages/dashboard/admin/projectPhase/adminProjectPhases"
import EditProjectPhases from "../pages/dashboard/admin/projectPhase/editProjectPhases"
import ViewProjectPhases from "../pages/dashboard/admin/projectPhase/viewProjectPhases"
import CreateProjectPhases from "../pages/dashboard/admin/projectPhase/createProjectPhases"

import AdminTickets from "../pages/dashboard/admin/tickets/adminTickets"
import CreateTickets from "../pages/dashboard/admin/tickets/createTickets"
import ViewTickets from "../pages/dashboard/admin/tickets/viewTickets"
import EditTickets from "../pages/dashboard/admin/tickets/editTickets"

import AdminComments from "../pages/dashboard/admin/comments/adminComments"
import CreateComments from "../pages/dashboard/admin/comments/createComments"
import EditComments from "../pages/dashboard/admin/comments/editComments"
import ViewComments from "../pages/dashboard/admin/comments/viewComments"

import TicketAssignee from "../pages/dashboard/admin/ticketAssignee/adminTicketAssignee"
import CreateTicketAssigneePage from "../pages/dashboard/admin/ticketAssignee/createTicketAssignee"
import ViewTicketAssignee from "../pages/dashboard/admin/ticketAssignee/viewTicketAssignee"

import AdminFileAttachments from "../pages/dashboard/admin/fileAttachment/adminFileAttachment"
import CreateFileAttachment from "../pages/dashboard/admin/fileAttachment/createFileAttachment"

import ActivityLogPage from "../pages/dashboard/admin/activity-log/adminActivityLogs"
import AdminNotification from "../pages/dashboard/admin/notification/adminNotification"
import ViewNotification from "../pages/dashboard/admin/notification/viewNotification"
import AdminProjectAssignment from "../pages/dashboard/admin/projectAssignment/adminProjectAssignment"
import CreateProjectAssignment from "../pages/dashboard/admin/projectAssignment/createProjectAssignment"
import AdminTeamUpdates from "../pages/dashboard/admin/team-updates/adminTeamUpdates"
import AdminViewTeamUpdatePage from "../pages/dashboard/admin/team-updates/view-team-update-page"
import AdminCreateTeamUpdatePage from "../pages/dashboard/admin/team-updates/create-team-update-page"
import AdminEditTeamUpdatePage from "../pages/dashboard/admin/team-updates/edit-team-update-page"
import AdminProjectTeamUpdateDetailPage from "../pages/dashboard/admin/team-updates/project-team-update-detail-page"
import AdminDailyCadencePage from "../pages/dashboard/admin/daily-cadence/daily-cadence-page"
import AdminProjectUpdates from "../pages/dashboard/admin/project-updates/admin-project-updates"
import AdminCreateProjectUpdate from "../pages/dashboard/admin/project-updates/create-project-update"
import AdminViewProjectUpdate from "../pages/dashboard/admin/project-updates/view-project-update"
import AdminEditProjectUpdate from "../pages/dashboard/admin/project-updates/edit-project-update"

import AdminProjectRoles from "../pages/dashboard/admin/projectRoles/adminProjectRoles"
import CreateProjectRole from "../pages/dashboard/admin/projectRoles/createProjectRole"
import ViewProjectRole from "../pages/dashboard/admin/projectRoles/viewProjectRole"
import EditProjectRole from "../pages/dashboard/admin/projectRoles/editProjectRole"

export const adminRoutes = (
  <Fragment>
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
      path="/admin/dashboard/project-owners/view/:id"
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <ViewProjectOwnnerPage />
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
      path="/admin-dashboard/project-assignments"
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminProjectAssignment />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/dashboard/project-assignments/create"
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <CreateProjectAssignment />
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
      path="/admin/dashboard/projects/view/:id"
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <ViewProject />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/dashboard/projects/edit/:id"
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
      path="/admin/dashboard/activity-logs"
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <ActivityLogPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/dashboard/team-updates"
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminTeamUpdates />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/dashboard/team-updates/create"
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminCreateTeamUpdatePage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/dashboard/team-updates/view/:id"
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminViewTeamUpdatePage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/dashboard/team-updates/edit/:id"
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminEditTeamUpdatePage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/dashboard/project-team-updates/:id"
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminProjectTeamUpdateDetailPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/dashboard/project-roles"
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminProjectRoles />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/dashboard/project-roles/create"
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <CreateProjectRole />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/dashboard/project-roles/view/:code"
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <ViewProjectRole />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/dashboard/project-roles/edit/:code"
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <EditProjectRole />
        </ProtectedRoute>
      }
    />

    <Route
      path="/admin/dashboard/project-updates"
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminProjectUpdates />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/dashboard/project-updates/create"
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminCreateProjectUpdate />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/dashboard/project-updates/view/:id"
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminViewProjectUpdate />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/dashboard/project-updates/edit/:id"
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminEditProjectUpdate />
        </ProtectedRoute>
      }
    />

    <Route
      path="/admin/dashboard/projects/:projectId/daily-cadence"
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminDailyCadencePage />
        </ProtectedRoute>
      }
    />

  </Fragment>
)
