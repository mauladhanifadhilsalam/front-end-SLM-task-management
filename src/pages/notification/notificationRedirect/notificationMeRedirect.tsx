import { Navigate } from "react-router-dom"
import { UnauthorisedError } from "@/pages/errors/unauthorized-error"
import NotificationPage from "../notification"

export default function NotificationMeRedirect() {
    const role = localStorage.getItem("role")


    if (role === "project_manager") {
        return (
        <Navigate
            to="/project-manager-dashboard/notifications/me"
            replace
        />
        )
    }

    if (role === "developer") {
        return (
        <Navigate
            to="/developer-dashboard/notifications/me"
            
            replace
        />
        )
    }

    return <UnauthorisedError />
}
