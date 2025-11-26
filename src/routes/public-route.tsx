"use client"

import { Navigate } from "react-router-dom"

type Props = {
  children: React.ReactNode
}

export function PublicRoute({ children }: Props) {
  const token = localStorage.getItem("token")
  const role = localStorage.getItem("role") 

  if (token && role) {
    if (role === "admin") return <Navigate to="/admin/dashboard" replace />
    if (role === "project_manager") return <Navigate to="/project-manager/dashboard" replace />
    if (role === "developer") return <Navigate to="/developer/dashboard" replace />
  }

  return <>{children}</>
}
