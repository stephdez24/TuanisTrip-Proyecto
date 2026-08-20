import { z } from "zod"

// Validaciones espejo del DTO del backend (createServicioAdicionalSchema en
// el API). Repetimos las mismas reglas aquí para que el error se muestre
// en el formulario ANTES de gastar una llamada al servidor, pero el API
// vuelve a validar todo igual del lado de allá (nunca confiamos solo en
// el FrontEnd).
export const extraSchema = z.object({
    nombre: z
        .string()
        .trim() // quita espacios accidentales al inicio/fin
        .min(3, "El nombre debe contener al menos 3 caracteres")
        .max(120, "El nombre no puede superar 120 caracteres"),

    descripcion: z
        .string()
        .trim()
        .min(10, "La descripción debe contener al menos 10 caracteres")
        .max(500, "La descripción no puede superar 500 caracteres"),

    // z.coerce.number() convierte el string que llega del <input type="number">
    // a número antes de validar (los inputs HTML siempre entregan texto).
    precio: z.coerce
        .number({ message: "El precio es obligatorio" })
        .nonnegative("El precio debe ser mayor o igual a cero") // 0 es válido (extra "gratis")
        .max(99999999.99, "El precio no puede superar 99,999,999.99"),
})