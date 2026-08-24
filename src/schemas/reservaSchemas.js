import { z } from "zod"

// Espeja createCitaSchema del API. Ojo: precioServicio, costoAdicionales,
// costoTotal, duracionMinutos y horaFin NO los llena la persona a mano —
// los calcula ReservaFormPage.jsx automáticamente y los mete al formulario
// con form.setValue(). Igual los validamos aquí por si algo saliera mal.
export const reservaSchema = z.object({
    clienteId: z.coerce.number({ message: "Selecciona un cliente" }).int().positive(),
    servicioId: z.coerce.number({ message: "Selecciona un tour" }).int().positive(),
    empleadoId: z.coerce.number({ message: "Selecciona un guía" }).int().positive(),

    fecha: z
        .string()
        .min(1, "Selecciona una fecha")
        .refine((valor) => {
            const hoy = new Date()
            hoy.setHours(0, 0, 0, 0)
            return new Date(valor + "T00:00:00") >= hoy
        }, "No se pueden registrar reservas en fechas pasadas"),

    horaInicio: z
        .string()
        .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Selecciona una hora de inicio"),

    adicionalIds: z.array(z.coerce.number()).default([]),

    // El backend exige que esta llave SIEMPRE esté presente en el body:
    // su valor puede ser un string de 3-500 caracteres o null explícito,
    // pero nunca "undefined" (eso borraría la llave del JSON enviado).
    observaciones: z.preprocess(
        (valor) => (typeof valor === "string" && valor.trim() === "" ? null : valor),
        z.union([
            z.string().trim().min(3, "Las observaciones deben contener al menos 3 caracteres").max(500, "Las observaciones no pueden superar 500 caracteres"),
            z.null(),
        ])
    ),

    // Calculados automáticamente — ver ReservaFormPage.jsx.
    duracionMinutos: z.coerce.number().int().positive(),
    horaFin: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    precioServicio: z.coerce.number().nonnegative(),
    costoAdicionales: z.coerce.number().nonnegative(),
    costoTotal: z.coerce.number().nonnegative(),
})