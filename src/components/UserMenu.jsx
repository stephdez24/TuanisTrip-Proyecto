import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { LogIn, LogOut, UserPlus, UserRound, ChevronDown } from "lucide-react"
import { useAuth } from "@/auth/useAuth"

// Hecho a mano en vez de usar un <DropdownMenu> de shadcn: el proyecto usa
// el preset de Base UI, y no tenemos confirmado que ese componente ya esté
// generado — mismo criterio que se usó antes con components/ui/form.jsx.
//
// Navegación por teclado tipo menú ARIA:
//   - Tab / Shift+Tab: sale del menú siguiendo el orden normal del documento
//   - Flecha abajo/arriba: mueve el foco entre opciones, con wrap-around
//   - Home/End: salta a la primera/última opción
//   - Escape: cierra y devuelve el foco al botón que abrió el menú
//   - Enter/Espacio: activa la opción enfocada (comportamiento nativo de <a>/<button>)

function inicialDe(nombre) {
    return nombre ? nombre.trim().charAt(0).toUpperCase() : "?"
}

export default function UserMenu() {
    const { isAuthenticated, rol, user, logout } = useAuth()
    const navigate = useNavigate()
    const [abierto, setAbierto] = useState(false)
    const contenedorRef = useRef(null)
    const botonRef = useRef(null)
    const itemRefs = useRef([])

    function handleLogout() {
        cerrar()
        logout()
        navigate("/login")
    }

    const opciones = isAuthenticated
        ? [
              { to: "/perfil", label: "Mi perfil", icono: UserRound },
              { label: "Cerrar sesión", icono: LogOut, onClick: handleLogout, destructivo: true },
          ]
        : [
              { to: "/login", label: "Iniciar sesión", icono: LogIn },
              { to: "/registro", label: "Registrarme", icono: UserPlus },
          ]

    function cerrar() {
        setAbierto(false)
    }

    function cerrarYDevolverFoco() {
        cerrar()
        botonRef.current?.focus()
    }

    // Cierre por clic afuera, y al abrir, enfoca la primera opción para que
    // las flechas funcionen de inmediato sin necesitar un Tab primero.
    useEffect(() => {
        if (!abierto) return

        function handleClickAfuera(e) {
            if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
                cerrar()
            }
        }
        window.addEventListener("mousedown", handleClickAfuera)

        const primerItem = itemRefs.current[0]
        primerItem?.focus()

        return () => window.removeEventListener("mousedown", handleClickAfuera)
    }, [abierto])

    function handleKeyDown(e) {
        const total = itemRefs.current.length
        const actual = itemRefs.current.findIndex((el) => el === document.activeElement)

        switch (e.key) {
            case "Escape":
                e.preventDefault()
                cerrarYDevolverFoco()
                break
            case "ArrowDown":
                e.preventDefault()
                itemRefs.current[(actual + 1) % total]?.focus()
                break
            case "ArrowUp":
                e.preventDefault()
                itemRefs.current[(actual - 1 + total) % total]?.focus()
                break
            case "Home":
                e.preventDefault()
                itemRefs.current[0]?.focus()
                break
            case "End":
                e.preventDefault()
                itemRefs.current[total - 1]?.focus()
                break
            case "Tab":
                // Deja que el Tab siga su curso normal (sale del menú), pero
                // lo cerramos para que no quede flotando sobre el resto de la página.
                cerrar()
                break
            default:
                break
        }
    }

    const nombreMostrado = isAuthenticated ? user?.nombre : "Invitado"

    return (
        <div className="relative" ref={contenedorRef}>
            <button
                ref={botonRef}
                type="button"
                onClick={() => setAbierto((a) => !a)}
                aria-haspopup="menu"
                aria-expanded={abierto}
                className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 text-sm text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/15 font-semibold">
                    {inicialDe(nombreMostrado)}
                </span>
                <ChevronDown
                    className={`h-4 w-4 transition-transform ${abierto ? "rotate-180" : ""}`}
                />
            </button>

            {abierto && (
                <div
                    role="menu"
                    aria-label="Menú de cuenta"
                    onKeyDown={handleKeyDown}
                    className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg"
                >
                    {/* Encabezado: quién es, y si tiene sesión real o no */}
                    <div className="flex items-center gap-3 border-b border-border p-4">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                            {inicialDe(nombreMostrado)}
                        </span>
                        <div className="min-w-0">
                            <p className="truncate font-semibold">{nombreMostrado}</p>
                            <p className="text-xs text-muted-foreground">
                                {isAuthenticated ? "Cuenta autenticada" : "Sin sesión"}
                            </p>
                            {isAuthenticated && (
                                <p className="text-xs text-muted-foreground">{rol}</p>
                            )}
                        </div>
                    </div>

                    {/* Opciones */}
                    <div className="p-1">
                        {opciones.map((opcion, i) => {
                            const Icono = opcion.icono
                            const claseComun =
                                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm outline-none focus-visible:bg-secondary " +
                                (opcion.destructivo
                                    ? "text-destructive hover:bg-destructive/10 focus-visible:bg-destructive/10"
                                    : "hover:bg-secondary")

                            const ref = (el) => {
                                itemRefs.current[i] = el
                            }

                            if (opcion.to) {
                                return (
                                    <Link
                                        key={opcion.label}
                                        ref={ref}
                                        role="menuitem"
                                        to={opcion.to}
                                        onClick={cerrar}
                                        className={claseComun}
                                    >
                                        <Icono className="h-4 w-4" />
                                        {opcion.label}
                                    </Link>
                                )
                            }

                            return (
                                <button
                                    key={opcion.label}
                                    ref={ref}
                                    type="button"
                                    role="menuitem"
                                    onClick={opcion.onClick}
                                    className={claseComun}
                                >
                                    <Icono className="h-4 w-4" />
                                    {opcion.label}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}