import { Navigate } from "react-router-dom"
import { useAuth } from "./useAuth"

export default function RoleRoute({ children, roles }) {
    const { user, isAuthenticated } = useAuth()

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (!roles.includes(user?.rol)) {
        return <Navigate to="/unauthorized" replace />
    }

    return children
}