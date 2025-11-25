import { Fragment } from "react"
import { Route } from "react-router-dom"
import { ProtectedRoute } from "../components/ProtectedRoute"
import PmDashboard from "../pages/dashboard/pm/dashboard"


import ViewProjectOwnerPage from "@/pages/dashboard/pm/project-owners/view-project-owner-page"
import ProjectOwnerPage from "@/pages/dashboard/pm/project-owners/project-owner-page"
import CreateProjectOwnerPage from "@/pages/dashboard/pm/project-owners/create-project-owner-page"
import EditProjectOwnerPage from "@/pages/dashboard/pm/project-owners/edit-project-owner-page"

import ProjectPage from "@/pages/dashboard/pm/project/project-page"
import CreateProjectPage from "@/pages/dashboard/pm/project/create-project-page"
import ViewProjectPage from "@/pages/dashboard/pm/project/view-project-page"
import EditProjectPage from "@/pages/dashboard/pm/project/edit-project-page"

import TicketsPage from "@/pages/dashboard/pm/ticket/ticket-page"

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
        path="/project-manager/dashboard/ticket-issue"
        element={
          <ProtectedRoute allowedRoles={["project_manager"]}>
            < TicketsPage/>
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
