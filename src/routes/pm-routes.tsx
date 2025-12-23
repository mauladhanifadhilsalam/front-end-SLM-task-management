import { Fragment } from "react"
import { Route } from "react-router-dom"
import { ProtectedRoute } from "../components/ProtectedRoute"
import PmDashboard from "../pages/dashboard/pm/dashboard"
import DeveloperHighlightPage from "@/pages/dashboard/pm/developer/developer-highlight"
import ProjectTaskPage from "@/pages/dashboard/pm/project/project-task-page"
import TeamUpdatePage from "@/pages/dashboard/pm/team-updates/team-update-page"


import ViewProjectOwnerPage from "@/pages/dashboard/pm/project-owners/view-project-owner-page"
import ProjectOwnerPage from "@/pages/dashboard/pm/project-owners/project-owner-page"
import CreateProjectOwnerPage from "@/pages/dashboard/pm/project-owners/create-project-owner-page"
import EditProjectOwnerPage from "@/pages/dashboard/pm/project-owners/edit-project-owner-page"

import ProjectPage from "@/pages/dashboard/pm/project/project-page"
import CreateProjectPage from "@/pages/dashboard/pm/project/create-project-page"
import ViewProjectPage from "@/pages/dashboard/pm/project/view-project-page"
import EditProjectPage from "@/pages/dashboard/pm/project/edit-project-page"
import PmProjectTaskDetailPage from "@/pages/dashboard/pm/project/view-task-page"

import TicketsPage from "@/pages/dashboard/pm/ticket/ticket-page"
import ViewTickets from "@/pages/dashboard/pm/ticket/view-ticket-page"
import CreateTicketIssue from "@/pages/dashboard/pm/ticket/create-ticket-issue"
import EditTicketIssuePage from "@/pages/dashboard/pm/ticket/edit-ticket-issue"
import PmTaskTicketsPage from "@/pages/dashboard/pm/ticket/ticket-task-page"


import AddTicketAttachment from "@/pages/dashboard/pm/fileAttachment/add-file-attachment"

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
      path="/project-manager/dashboard/developer-highlight"
      element={
        <ProtectedRoute allowedRoles={["project_manager"]}>
          <DeveloperHighlightPage />
        </ProtectedRoute>
      }
    />
    <Route
        path="/project-manager/dashboard/project-owners"
        element={
          <ProtectedRoute allowedRoles={["project_manager"]}>
            <ProjectOwnerPage />
          </ProtectedRoute>
        }
      />
    <Route
        path="/project-manager/dashboard/project-owners/view/:id"
        element={
          <ProtectedRoute allowedRoles={["project_manager"]}>
            <ViewProjectOwnerPage />
          </ProtectedRoute>
        }
      />
    <Route
        path="/project-manager/dashboard/project-owners/edit/:id"
        element={
          <ProtectedRoute allowedRoles={["project_manager"]}>
            <EditProjectOwnerPage />
          </ProtectedRoute>
        }
      />
    <Route
        path="/project-manager/dashboard/project-owners/create"
        element={
          <ProtectedRoute allowedRoles={["project_manager"]}>
            <CreateProjectOwnerPage />
          </ProtectedRoute>
        }
      />
    <Route
        path="/project-manager/dashboard/projects"
        element={
          <ProtectedRoute allowedRoles={["project_manager"]}>
            <ProjectPage />
          </ProtectedRoute>
        }
      />
    <Route
        path="/project-manager/dashboard/projects/tasks/:projectId"
        element={
          <ProtectedRoute allowedRoles={["project_manager"]}>
            <ProjectTaskPage />
          </ProtectedRoute>
        }
      />
    <Route
        path="/project-manager/dashboard/projects/create"
        element={
          <ProtectedRoute allowedRoles={["project_manager"]}>
            <CreateProjectPage />
          </ProtectedRoute>
        }
      />
    <Route
        path="/project-manager/dashboard/projects/view/:id"
        element={
          <ProtectedRoute allowedRoles={["project_manager"]}>
            < ViewProjectPage/>
          </ProtectedRoute>
        }
      />
    <Route
        path="/project-manager/dashboard/projects/edit/:id"
        element={
          <ProtectedRoute allowedRoles={["project_manager"]}>
            < EditProjectPage/>
          </ProtectedRoute>
        }
      />
    <Route
        path="/project-manager/dashboard/projects/:projectId/tasks/:taskId"
        element={
          <ProtectedRoute allowedRoles={["project_manager"]}>
            < PmProjectTaskDetailPage/>
          </ProtectedRoute>
        }
      />
    <Route
      path="/project-manager/dashboard/ticket-task"
      element={
        <ProtectedRoute allowedRoles={["project_manager"]}>
          <PmTaskTicketsPage />
        </ProtectedRoute>
      }
    />
    <Route
        path="/project-manager/dashboard/ticket-issue"
        element={
          <ProtectedRoute allowedRoles={["project_manager"]}>
            < TicketsPage/>
          </ProtectedRoute>
        }
      />
    <Route
        path="/project-manager/dashboard/ticket-issue/view/:id"
        element={
          <ProtectedRoute allowedRoles={["project_manager"]}>
            < ViewTickets/>
          </ProtectedRoute>
        }
      />
    <Route
        path="/project-manager/dashboard/ticket-issue/create"
        element={
          <ProtectedRoute allowedRoles={["project_manager"]}>
            < CreateTicketIssue/>
          </ProtectedRoute>
        }
      />
    <Route
        path="/project-manager/dashboard/ticket-issue/edit/:id"
        element={
          <ProtectedRoute allowedRoles={["project_manager"]}>
            < EditTicketIssuePage/>
          </ProtectedRoute>
        }
      />
    <Route
        path="/project-manager/dashboard/ticket-issue/:id/attachments/new"
        element={
          <ProtectedRoute allowedRoles={["project_manager"]}>
            < AddTicketAttachment/>
          </ProtectedRoute>
        }
      />
    <Route
      path="/project-manager/dashboard/team-update"
      element={
        <ProtectedRoute allowedRoles={["project_manager"]}>
          <TeamUpdatePage />
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
