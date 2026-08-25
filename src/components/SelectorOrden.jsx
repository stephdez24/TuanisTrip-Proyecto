import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// opciones: [{ value: "nombre:asc", label: "Nombre (A-Z)" }, ...]
// El value codifica "campo:direccion" — se separa acá y se le pasa a
// establecerOrden() del hook useOrdenamiento.
export default function SelectorOrden({ opciones, criterios, onCambiar, className }) {
    const valorActual = criterios[0] ? `${criterios[0].campo}:${criterios[0].direccion}` : ""

    function handleChange(value) {
        const [campo, direccion] = value.split(":")
        onCambiar(campo, direccion)
    }

    return (
        <Select value={valorActual} onValueChange={handleChange}>
            <SelectTrigger className={className ?? "w-full sm:w-56"}>
                <SelectValue placeholder="Ordenar por">
                    {(value) => opciones.find((o) => o.value === value)?.label ?? "Ordenar por"}
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                {opciones.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                        {o.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}