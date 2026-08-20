import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "./useAuth"

// Uso como ruta contenedora (protege TODAS las rutas anidadas dentro):
//
//   <Route element={<RoleRoute />}>                              -> requiere solo estar logueado
//     <Route path="/perfil" element={<PerfilPage />} />
//   </Route>
//
//   <Route element={<RoleRoute roles={["Administrador"]} />}>    -> requiere rol específico
//     <Route path="/extras" element={<ExtrasPage />} />
//     <Route path="/extras/nuevo" element={<ExtrasFormPage />} />
//   </Route>
export default function RoleRoute({ roles }) {
    const { user, isAuthenticated, loading } = useAuth()

    if (loading) {
        // Evita redirigir a /login por un instante mientras se valida
        // una sesión guardada del localStorage.
        return null
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    const userRole = user?.rol?.nombre

    if (roles && !roles.includes(userRole)) {
        return <Navigate to="/unauthorized" replace />
    }

    return <Outlet />
}