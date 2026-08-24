import { Check, X } from "lucide-react"

// Espeja EXACTO los 4 requisitos de passwordSchema en usuario.dto.ts del
// backend — nada de "carácter especial" u otros requisitos que el API no
// exige, para no confundir al usuario con reglas que no son reales.
const REQUISITOS = [
    { id: "longitud", etiqueta: "Al menos 8 caracteres", cumple: (p) => p.length >= 8 },
    { id: "mayuscula", etiqueta: "Una letra mayúscula", cumple: (p) => /[A-Z]/.test(p) },
    { id: "minuscula", etiqueta: "Una letra minúscula", cumple: (p) => /[a-z]/.test(p) },
    { id: "numero", etiqueta: "Un número", cumple: (p) => /[0-9]/.test(p) },
]

export default function PasswordRequirementsChecklist({ password }) {
    const valor = password ?? ""

    return (
        <ul className="space-y-1 text-sm">
            {REQUISITOS.map((r) => {
                const ok = r.cumple(valor)
                return (
                    <li
                        key={r.id}
                        className={`flex items-center gap-1.5 transition-colors ${
                            ok ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                        }`}
                    >
                        {ok ? (
                            <Check className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                            <X className="h-3.5 w-3.5 shrink-0" />
                        )}
                        {r.etiqueta}
                    </li>
                )
            })}
        </ul>
    )
}