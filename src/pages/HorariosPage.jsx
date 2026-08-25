import { CalendarDays, Clock3 } from "lucide-react"

import { horariosService } from "@/services/horariosService" 
import { useFetch } from "@/lib/useFetch" 
import { Card, CardContent } from "@/components/ui/card" 
import { Badge } from "@/components/ui/badge" 
 
// Solo lectura: el enunciado no permite crear/editar/eliminar horarios 
// desde el FrontEnd. Visible para los 3 roles (a diferencia de 
// Restricciones, que es solo Admin/Empleado) — por eso esta pantalla vive 
// como ruta pública en App.jsx, igual que Tours/Extras/Guías. 
 
export default function HorariosPage() { 
    const { data, loading, error } = useFetch(() => horariosService.listar()) 
 
    const horarios = data ?? [] 
 
    return ( 
        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 lg:px-8">

            {/* ENCABEZADO */}

            <div className="mb-8 border-l-4 border-ring pl-5">

                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-ring">
                    Atención
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                    Temporada de atención
                </h1>

                <p className="mt-2 text-base text-muted-foreground sm:text-lg">
                    Días y horarios en los que el establecimiento recibe reservas.
                </p>

            </div>
 
            {loading && ( 
                <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
                    <Clock3 className="mx-auto mb-3 h-8 w-8 text-ring" />
                    <p className="text-muted-foreground">
                        Cargando horarios...
                    </p>
                </div>
            )} 

            {error && ( 
                <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
                    <p className="text-destructive">
                        No se pudieron cargar los horarios: {error.message}
                    </p>
                </div>
            )} 
 
            {!loading && !error && horarios.length === 0 && ( 
                <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
                    <CalendarDays className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />

                    <p className="text-muted-foreground">
                        Todavía no hay horarios registrados.
                    </p>
                </div>
            )} 
 
            {!loading && !error && horarios.length > 0 && (
                <Card className="overflow-hidden rounded-2xl border-border shadow-sm">

                    <CardContent className="p-0">

                        {/* ENCABEZADO DE LA LISTA */}

                        <div className="hidden border-b border-border bg-muted/40 px-6 py-4 sm:grid sm:grid-cols-[1fr_auto] sm:items-center">
                            <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                Día
                            </span>

                            <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                Horario
                            </span>
                        </div>

                        <div className="divide-y divide-border">

                            {horarios.map((h) => (

                                <div
                                    key={h.id}
                                    className="
                                        flex flex-col gap-4 px-5 py-5
                                        transition-colors
                                        hover:bg-muted/30
                                        sm:flex-row sm:items-center sm:justify-between
                                        sm:px-6
                                    "
                                >

                                    <div className="flex items-center gap-4">

                                        <div
                                            className="
                                                flex h-11 w-11 shrink-0
                                                items-center justify-center
                                                rounded-full
                                                bg-secondary
                                                text-primary
                                            "
                                        >
                                            <CalendarDays className="h-5 w-5" />
                                        </div>

                                        <div>

                                            <div className="flex flex-wrap items-center gap-2">

                                                <span className="text-base font-semibold text-primary sm:text-lg">
                                                    {h.diaSemana?.nombre}
                                                </span>

                                                {!h.activo && ( 
                                                    <Badge variant="destructive">
                                                        Inactivo
                                                    </Badge>
                                                )}

                                            </div>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Horario de atención
                                            </p>

                                        </div>

                                    </div>

                                    <div className="flex items-center sm:justify-end">

                                        {h.activo ? (

                                            <div
                                                className="
                                                    flex w-fit items-center gap-2
                                                    rounded-full
                                                    bg-secondary
                                                    px-4 py-2
                                                    text-sm font-semibold
                                                    text-primary
                                                "
                                            >
                                                <Clock3 className="h-4 w-4 text-primary" />

                                                <span>
                                                    {h.horaInicio} – {h.horaFin}
                                                </span>
                                            </div>

                                        ) : (

                                            <div
                                                className="
                                                    rounded-full
                                                    bg-destructive/10
                                                    px-4 py-2
                                                    text-sm font-semibold
                                                    text-destructive
                                                "
                                            >
                                                Cerrado
                                            </div>

                                        )}

                                    </div>

                                </div>

                            ))}

                        </div>

                    </CardContent>

                </Card>
            )}

        </div> 
    ) 
}