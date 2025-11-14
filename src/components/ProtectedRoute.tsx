import { ReactNode } from "react";
import { UnauthorisedError } from "@/pages/errors/unauthorized-error";
import { ForbiddenError } from "@/pages/errors/forbidden";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || !role) {
    return <UnauthorisedError />;
  }

  if (!allowedRoles.includes(role)) {
    return <ForbiddenError />;
  }

  return <>{children}</>;
}
