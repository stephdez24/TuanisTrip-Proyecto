import { z } from "zod"

// Espeja el DTO real del API (createServicioSchema/updateServicioSchema)
// para que los mensajes de error salgan en el formulario antes de gastar
// una llamada al servidor.
export const tourSchema = z.object({
    nombre: z
        .string()
        .trim()
        .min(3, "El nombre debe contener al menos 3 caracteres")
        .max(120, "El nombre no puede superar 120 caracteres"),

    descripcion: z
        .string()
        .trim()
        .min(10, "La descripción debe contener al menos 10 caracteres")
        .max(500, "La descripción no puede superar 500 caracteres"),

    // z.coerce.number(): los <input type="number"> siempre entregan texto,
    // así que convertimos a número ANTES de que Zod valide .positive()/.max().
    precioBase: z.coerce
        .number({ message: "El precio es obligatorio" })
        .positive("El precio debe ser mayor a cero")
        .max(99999999.99, "El precio no puede superar 99,999,999.99"),

    duracionMinutos: z.coerce
        .number({ message: "La duración es obligatoria" })
        .int("La duración debe ser un número entero")
        .min(15, "La duración mínima es de 15 minutos")
        .max(480, "La duración no puede superar 8 horas (480 minutos)"),

    // El <Select> de shadcn entrega el value como string; lo convertimos
    // a número aquí para que coincida con lo que espera el API (especialidadId: number).
    especialidadId: z.coerce
        .number({ message: "Selecciona una categoría" })
        .int()
        .positive("Selecciona una categoría"),

    // Ya NO es un bypass: es el nombre real del archivo que devuelve
    // POST /images/upload (ver imagenesService.js). El DTO del backend
    // permite null, pero el enunciado exige imagen obligatoria — por eso
    // el FrontEnd sí la exige aunque el backend sea más permisivo.
    imagen: z
        .string({ message: "Debes subir una imagen para el tour" })
        .min(1, "Debes subir una imagen para el tour")
        .regex(
            /^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp)$/i,
            "El nombre de la imagen debe corresponder a un archivo JPG, PNG o WEBP"
        ),
})