import { z } from "zod"

// Igual que en usuarioSchemas.js: "" se trata como "no lo llenó", no como
// un valor inválido, para que descripcion (opcional en el API) no dispare
// el error de .min() cuando el campo se deja vacío.
function campoOpcional(min, max, mensajeMin, mensajeMax) {
    return z.preprocess(
        (valor) => (typeof valor === "string" && valor.trim() === "" ? undefined : valor),
        z.string().trim().min(min, mensajeMin).max(max, mensajeMax).optional()
    )
}

// Espeja createEmpleadoSchema/updateEmpleadoSchema del API.
export const guiaSchema = z.object({
    usuarioId: z.coerce
        .number({ message: "Selecciona el usuario del guía" })
        .int()
        .positive("Selecciona el usuario del guía"),

    especialidadId: z.coerce
        .number({ message: "Selecciona una especialidad" })
        .int()
        .positive("Selecciona una especialidad"),

    // El API exige exactamente este patrón: solo letras, números, guion y
    // guion bajo (ej. "GUIA-001"). La regex de aquí es una copia literal
    // de la del backend (codigoEmpleadoSchema en empleado.dto.ts).
    codigoEmpleado: z
        .string()
        .trim()
        .min(3, "El código debe contener al menos 3 caracteres")
        .max(30, "El código no puede superar 30 caracteres")
        .regex(
            /^[A-Za-z0-9_-]+$/,
            "El código solo puede contener letras, números, guiones y guiones bajos"
        ),

    descripcion: campoOpcional(
        3,
        500,
        "La descripción debe contener al menos 3 caracteres",
        "La descripción no puede superar 500 caracteres"
    ),

    // Array de ids de tours que el guía puede atender. El API exige mínimo 1.
    servicioIds: z
        .array(z.coerce.number())
        .min(1, "Selecciona al menos un tour que este guía pueda atender"),

    // BYPASS TEMPORAL, igual que en tourSchemas.js: el modelo de Empleado
    // no tiene campo de imagen en el API. Se guarda aparte, del lado del
    // cliente (lib/imagenLocal.js) — nunca se manda al backend.
    imagenUrl: z
        .string()
        .trim()
        .refine(
            (valor) =>
                valor === "" ||
                valor.startsWith("/") ||
                /^https?:\/\//.test(valor),
            "Debe ser una URL (https://...) o una ruta local que empiece con /"
        )
        .optional(),
})