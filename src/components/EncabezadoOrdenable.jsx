import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { TableHead } from "@/components/ui/table"

// Si hay más de un criterio activo, muestra un numerito chiquito con la
// prioridad (1°, 2°...) para que se entienda en qué orden se está
// desempatando — sin eso, ordenar por varias columnas a la vez sería
// invisible para quien lo usa.
export default function EncabezadoOrdenable({ campo, criterios, onClick, children, className }) {
    const indice = criterios.findIndex((c) => c.campo === campo)
    const activo = indice !== -1
    const direccion = activo ? criterios[indice].direccion : null
    const Icono = !activo ? ArrowUpDown : direccion === "desc" ? ArrowUp : ArrowDown

    return (
        <TableHead className={className}>
            <button
                type="button"
                onClick={() => onClick(campo)}
                className="flex items-center gap-1 hover:text-foreground"
                title="Clic para ordenar por esta columna (se puede combinar con otras)"
            >
                {children}
                <Icono
                    className={`h-3.5 w-3.5 ${activo ? "text-foreground" : "text-muted-foreground/50"}`}
                />
                {activo && criterios.length > 1 && (
                    <span className="text-[10px] font-semibold text-muted-foreground">
                        {indice + 1}
                    </span>
                )}
            </button>
        </TableHead>
    )
}