import { Link, NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "@/auth/useAuth"
import { Button } from "@/components/ui/button"

// Enlaces visibles para cada rol. Un usuario sin permiso para un módulo
// simplemente no ve el enlace (además de que RoleRoute bloquea el acceso
// directo por URL).
const NAV_POR_ROL = {
    invitado: [
        { to: "/", label: "Inicio" },
        { to: "/tours", label: "Tours" },
        { to: "/guias", label: "Guías" },
    ],
    Cliente: [
        { to: "/", label: "Inicio" },
        { to: "/tours", label: "Tours" },
        { to: "/guias", label: "Guías" },
        { to: "/favoritos", label: "Favoritos" },
        { to: "/reservas", label: "Mis reservas" },
    ],
    Empleado: [
        { to: "/", label: "Inicio" },
        { to: "/tours", label: "Tours" },
        { to: "/guias", label: "Guías" },
        { to: "/reservas", label: "Reservas" },
    ],
    Administrador: [
        { to: "/", label: "Inicio" },
        { to: "/tours", label: "Tours" },
        { to: "/extras", label: "Extras" },
        { to: "/guias", label: "Guías" },
        { to: "/reservas", label: "Reservas" },
        { to: "/agenda", label: "Agenda del día" },
    ],
}

export default function Navbar() {
    const { isAuthenticated, rol, user, logout } = useAuth()
    const navigate = useNavigate()

    const enlaces = NAV_POR_ROL[rol ?? "invitado"] ?? NAV_POR_ROL.invitado

    function handleLogout() {
        logout()
        navigate("/login")
    }

    return (
        <header className="border-b bg-card">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                <Link to="/" className="text-xl font-semibold">
                    Tuanis Trip
                </Link>

                <nav className="hidden items-center gap-6 md:flex">
                    {enlaces.map((enlace) => (
                        <NavLink
                            key={enlace.to}
                            to={enlace.to}
                            className={({ isActive }) =>
                                `text-sm font-medium transition-colors hover:text-primary ${
                                    isActive ? "text-primary" : "text-muted-foreground"
                                }`
                            }
                        >
                            {enlace.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    {isAuthenticated ? (
                        <>
                            <span className="hidden text-sm text-muted-foreground sm:inline">
                                Hola, {user?.nombre}
                            </span>
                            <Button variant="outline" size="sm" onClick={handleLogout}>
                                Cerrar sesión
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" size="sm" asChild>
                                <Link to="/login">Iniciar sesión</Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link to="/registro">Crear cuenta</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}