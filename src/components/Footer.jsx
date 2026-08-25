import { Link } from "react-router-dom"
import { useAuth } from "@/auth/useAuth"

// Enlaces importantes que se muestran en el footer según el rol.
// Se mantienen solamente los módulos principales para no saturar
// el footer con todas las opciones disponibles del menú.
const ENLACES_FOOTER_POR_ROL = {
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
        { to: "/reservas", label: "Mis reservas" },
    ],

    Empleado: [
        { to: "/", label: "Inicio" },
        { to: "/tours", label: "Tours" },
        { to: "/guias", label: "Guías" },
        { to: "/reservas", label: "Reservas" },
        { to: "/mi-agenda", label: "Mi agenda" },
        { to: "/restricciones", label: "Bloqueos y temporadas" },
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

export default function Footer() {
    const { rol } = useAuth()

    // Si no hay sesión, se utiliza el menú de invitado.
    // Si el rol no coincide con ninguno registrado, también se utiliza
    // el menú de invitado como opción segura.
    const enlaces =
        ENLACES_FOOTER_POR_ROL[rol ?? "invitado"] ??
        ENLACES_FOOTER_POR_ROL.invitado

    return (
        <footer className="mt-auto bg-primary text-primary-foreground">
            <div className="mx-auto max-w-6xl px-4 py-10">

                {/* Contenido principal del footer */}
                <div className="grid gap-10 md:grid-cols-3">

                    {/* Información de Tuanis Trip */}
                    <div>
                        <div className="mb-4 flex items-center gap-3">
                            <img
                                src="/images/logoTuanisTrip.png"
                                alt="Tuanis Trip"
                                className="h-18 w-18 object-contain"
                            />

                            <div>
                                <h2 className="text-lg font-bold">
                                    Tuanis Trip
                                </h2>

                                <p className="text-sm text-primary-foreground/70">
                                    Tours & Guías Turísticos
                                </p>
                            </div>
                        </div>

                        <p className="max-w-sm text-base leading-relaxed text-primary-foreground/75">
                            Conectamos viajeros con las mejores
                            experiencias en Costa Rica. Apoyamos a
                            guías locales y al turismo sostenible.
                        </p>
                    </div>

                    {/* Enlaces rápidos según el rol */}
                    <div>
                        <h3 className="mb-5 text-lg font-bold">
                            Enlaces rápidos
                        </h3>

                        <nav className="flex flex-col gap-3">
                            {enlaces.map((enlace) => (
                                <Link
                                    key={enlace.to}
                                    to={enlace.to}
                                    className="w-fit text-base text-primary-foreground/85 transition-colors hover:text-primary-foreground"
                                >
                                    {enlace.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Contacto */}
                    <div>
                        <h3 className="mb-5 text-lg font-bold">
                            Contacto
                        </h3>

                        <div className="flex flex-col gap-5">
                            <p className="text-base text-primary-foreground/80">
                                Correo:{" "}
                                <span className="text-primary-foreground">
                                    contacto@tuanistrip.com
                                </span>
                            </p>

                            <p className="text-base text-primary-foreground/80">
                                Alajuela, Costa Rica
                            </p>

                            <p className="text-base text-primary-foreground/80">
                                Tel:{" "}
                                <span className="text-primary-foreground">
                                    +506 2400 2400
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Línea divisoria */}
                <div className="mt-10 border-t border-primary-foreground/15" />

                {/* Copyright */}
                <div className="pt-7 text-center">
                    <p className="text-sm text-primary-foreground/60">
                        © 2026 Tuanis Trip. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </footer>
    )
}