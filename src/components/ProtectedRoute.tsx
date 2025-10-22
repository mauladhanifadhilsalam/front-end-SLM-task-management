import { Navigate } from "react-router-dom"
import { ReactNode } from "react"

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles: string[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const token = localStorage.getItem("token")
  const role = localStorage.getItem("role")

  // Kalau belum login → arahkan ke halaman login
  if (!token || !role) {
    return <Navigate to="/" replace />
  }

  // Kalau role tidak diizinkan → redirect ke halaman login
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />
  }

  // Jika valid, render konten dashboard
  return <>{children}</>
}
