import { Heart } from "lucide-react"
import { useFavoritos } from "@/lib/useFavoritos"

// tipo: "servicio" | "empleado" — coincide con las dos cosas que se
// pueden marcar como favoritas en el sistema (tours y guías).
export default function BotonFavorito({ tipo, id, className, flotante = true }) {
    const { esFavorito, alternar } = useFavoritos()
    const activo = esFavorito(tipo, id)

    function handleClick(e) {
        // Evita que el clic también dispare la navegación de un <Link>
        // que pueda estar envolviendo la tarjeta.
        e.preventDefault()
        e.stopPropagation()
        alternar(tipo, id)
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-pressed={activo}
            aria-label={activo ? "Quitar de favoritos" : "Agregar a favoritos"}
            className={
                className ??
                (flotante
                    ? "flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-destructive shadow-sm backdrop-blur-sm transition-transform hover:scale-110"
                    : "flex items-center gap-1.5 text-sm text-destructive")
            }
        >
            <Heart className={`h-4 w-4 ${activo ? "fill-current" : ""}`} />
            {!flotante && (activo ? "En favoritos" : "Agregar a favoritos")}
        </button>
    )
}