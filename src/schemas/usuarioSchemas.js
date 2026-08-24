import { z } from "zod"

// Convierte "" en undefined antes de validar. Sin esto, un campo opcional
// vacío (ej. dejar el teléfono en blanco) dispararía el error de .min()
// como si fuera un valor inválido en vez de "no lo llenó". Refleja el mismo
// comportamiento "opcional" que tienen segundoApellido/telefono en el DTO
// real del API (registerClienteSchema).
function campoOpcional(min, max, mensajeMin, mensajeMax) {
    return z.preprocess(
        (valor) => (typeof valor === "string" && valor.trim() === "" ? undefined : valor),
        z
            .string()
            .trim()
            .min(min, mensajeMin)
            .max(max, mensajeMax)
            .optional()
    )
}

export const registroSchema = z.object({
    nombre: z
        .string()
        .trim()
        .min(2, "El nombre debe contener al menos 2 caracteres")
        .max(100, "El nombre no puede superar 100 caracteres"),

    primerApellido: z
        .string()
        .trim()
        .min(2, "El primer apellido debe contener al menos 2 caracteres")
        .max(100, "El primer apellido no puede superar 100 caracteres"),

    segundoApellido: campoOpcional(
        2,
        100,
        "El segundo apellido debe contener al menos 2 caracteres",
        "El segundo apellido no puede superar 100 caracteres"
    ),

    correo: z
        .email("El correo electrónico no tiene un formato válido")
        .trim()
        .max(150, "El correo no puede superar 150 caracteres"),

    telefono: campoOpcional(
        8,
        25,
        "El teléfono debe contener al menos 8 caracteres",
        "El teléfono no puede superar 25 caracteres"
    ),

    // Espeja passwordSchema del API exactamente (usuario.dto.ts): no
    // basta con el largo, también exige mayúscula + minúscula + número.
    password: z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .max(100, "La contraseña no puede superar 100 caracteres")
        .regex(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula")
        .regex(/[a-z]/, "La contraseña debe contener al menos una letra minúscula")
        .regex(/[0-9]/, "La contraseña debe contener al menos un número"),
})

// Reglas más simples que el registro: el login no valida formato de
// contraseña (eso ya se validó al crear la cuenta), solo que no venga vacía.
export const loginSchema = z.object({
    correo: z.email("El correo electrónico no tiene un formato válido"),
    password: z.string().min(1, "La contraseña es obligatoria"),
})