import { useEffect, useState } from "react"
import { Link, NavLink } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { useAuth } from "@/auth/useAuth"
import { Button } from "@/components/ui/button"
import ThemeToggle from "@/components/ThemeToggle"
import UserMenu from "@/components/UserMenu"

// Enlaces visibles para cada rol. Un usuario sin permiso para un módulo
// simplemente no ve el enlace (además de que RoleRoute bloquea el acceso
// directo por URL).
const NAV_POR_ROL = {
    invitado: [
        { to: "/", label: "Inicio" },
        { to: "/tours", label: "Tours" },
        { to: "/guias", label: "Guías" },
        { to: "/horarios", label: "Horarios" },
    ],
    Cliente: [
        { to: "/", label: "Inicio" },
        { to: "/tours", label: "Tours" },
        { to: "/guias", label: "Guías" },
        { to: "/horarios", label: "Horarios" },
        { to: "/favoritos", label: "Favoritos" },
        { to: "/carrito", label: "Mi selección" },
        { to: "/reservas", label: "Mis reservas" },
    ],
    Empleado: [
        { to: "/", label: "Inicio" },
        { to: "/tours", label: "Tours" },
        { to: "/guias", label: "Guías" },
        { to: "/horarios", label: "Horarios" },
        { to: "/reservas", label: "Reservas" },
        { to: "/solicitudes", label: "Solicitudes" },
        { to: "/mi-agenda", label: "Mi agenda" },
        { to: "/restricciones", label: "Bloqueos y temporadas" },
    ],
    Administrador: [
        { to: "/", label: "Inicio" },
        { to: "/tours", label: "Tours" },
        { to: "/extras", label: "Extras" },
        { to: "/guias", label: "Guías" },
        { to: "/horarios", label: "Horarios" },
        { to: "/reservas", label: "Reservas" },
        { to: "/solicitudes", label: "Solicitudes" },
        { to: "/restricciones", label: "Bloqueos y temporadas" },
        { to: "/agenda", label: "Agenda del día" },
    ],
}

export default function Navbar() {
    const { rol } = useAuth()
    //Recordar si el menú hamburguesa está abierto o cerrado
    const [menuAbierto, setMenuAbierto] = useState(false)

    const enlaces = NAV_POR_ROL[rol ?? "invitado"] ?? NAV_POR_ROL.invitado

    // Cierra el menú al navegar, para no dejarlo abierto tapando la
    // pantalla siguiente.
    function handleNavClick() {
        setMenuAbierto(false)
    }

    // Cierra el menú con Escape, igual que cualquier panel/diálogo estándar.
    useEffect(() => {
        if (!menuAbierto) return

        function handleKeyDown(e) {
            if (e.key === "Escape") setMenuAbierto(false)
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [menuAbierto])

    return (
        // bg-primary / text-primary-foreground: en modo claro es el verde
        // oscuro de marca con texto blanco (igual al mini-proyecto original);
        // en modo oscuro, las variables de tema invierten esto a dorado con
        // texto verde oscuro — no hace falta lógica extra, ya se adapta sola.
        <header className="sticky top-0 z-40 bg-primary text-primary-foreground">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">

                <Link
                    to="/"
                    className="flex items-center gap-3 text-xl font-semibold"
                    onClick={handleNavClick}
                >
                    <img
                        src="/images/logoTuanisTrip.png"
                        alt="Tuanis Trip"
                        className="h-18 w-18 object-contain"
                    />

                    <span>Tuanis Trip</span>
                </Link>

                {/* El menú de navegación siempre vive detrás de la hamburguesa,
                    en cualquier tamaño de pantalla — con hasta 8 enlaces para
                    Administrador, un navbar horizontal se veía saturado incluso
                    en escritorio. El header solo muestra: logo, tema, y el
                    menú de usuario (avatar + estado de sesión). */}
                <div className="flex items-center gap-2">

                    {/* Botón para cambiar entre modo claro y modo oscuro. */}
                    <div
                        className="
                            flex h-10 w-10 items-center justify-center
                            rounded-full
                            border border-primary-foreground/20
                            bg-primary-foreground/10
                            shadow-sm
                            transition-all
                            hover:bg-primary-foreground/20
                            hover:border-primary-foreground/40
                            hover:scale-105
                        "
                    >
                        <ThemeToggle />
                    </div>

                    {/* Menú del usuario con avatar y opciones de sesión. */}
                    <div
                        className="
                            flex h-10 min-w-10 items-center justify-center
                            rounded-full
                            border border-primary-foreground/20
                            bg-primary-foreground/10
                            shadow-sm
                            transition-all
                            hover:bg-primary-foreground/20
                            hover:border-primary-foreground/40
                        "
                    >
                        <UserMenu />
                    </div>

                    {/* Botón hamburguesa: SIEMPRE visible, es el único punto de
                        entrada a la navegación (sin lista horizontal aparte). */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="
                            h-10 w-10
                            rounded-full
                            border border-primary-foreground/20
                            bg-primary-foreground/10
                            text-primary-foreground
                            shadow-sm
                            transition-all
                            hover:scale-105
                            hover:bg-primary-foreground/20
                            hover:border-primary-foreground/40
                            hover:text-primary-foreground
                        "
                        onClick={() => setMenuAbierto((abierto) => !abierto)}
                        aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
                        aria-expanded={menuAbierto}
                    >
                        {menuAbierto ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Panel del menú: mismo fondo verde/dorado, con un borde superior
                sutil para separarlo visualmente del header. Se comporta igual
                en cualquier ancho de pantalla. */}
            {menuAbierto && (
                <div className="border-t border-primary-foreground/10 bg-primary">
                    <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
                        {enlaces.map((enlace) => (
                            <NavLink
                                key={enlace.to}
                                to={enlace.to}
                                onClick={handleNavClick}
                                className={({ isActive }) =>
                                    `rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                                        isActive
                                            ? "bg-primary-foreground/15 text-ring shadow-sm"
                                            : "text-primary-foreground/85 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                                    }`
                                }
                            >
                                {enlace.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    )
}