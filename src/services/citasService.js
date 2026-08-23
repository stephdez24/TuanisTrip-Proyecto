// CRUD + consultas especiales del recurso /citas (Reservas). Este es el
// módulo más grande del sistema: integra tours, extras, guías, horarios
// y restricciones en un solo flujo.

import { apiClient } from "@/lib/api-client";

export const citasService = {
    listar: () => apiClient.get("/citas"),

    // "Mis reservas" del Cliente autenticado.
    listarPorCliente: (clienteId) => apiClient.get(`/citas/cliente/${clienteId}`),

    // "Mis reservas asignadas" del Empleado autenticado.
    listarPorEmpleado: (empleadoId) => apiClient.get(`/citas/empleado/${empleadoId}`),

    obtenerPorId: (id) => apiClient.get(`/citas/${id}`),

    // Agenda de un guía en una fecha: horarios ocupados/disponibles/restringidos.
    agendaEmpleado: (empleadoId, fecha) =>
        apiClient.get(`/citas/agenda-empleado/${empleadoId}?fecha=${fecha}`),

    // Agenda de TODOS los guías activos en una fecha — vista del Administrador.
    agendaDiaria: (fecha) => apiClient.get(`/citas/agenda-diaria?fecha=${fecha}`),

    // Verifica disponibilidad SIN crear la cita. citaIdExcluir se usa al
    // editar una cita existente, para que no choque contra sí misma.
    disponibilidad: (datos) => apiClient.post("/citas/disponibilidad", datos),

    // Todos los montos, horas y duración ya vienen calculados desde el
    // FrontEnd (el API los valida pero no los recalcula) — ver reservaSchemas.js
    // y ReservaFormPage.jsx para el cálculo.
    crear: (data) => apiClient.post("/citas", data),

    actualizar: (id, data) => apiClient.put(`/citas/${id}`, data),

    cambiarEstado: (id, estadoCitaId) => apiClient.patch(`/citas/${id}/estado`, { estadoCitaId }),

    cancelar: (id, motivoCancelacion) =>
        apiClient.patch(`/citas/${id}/cancelar`, { motivoCancelacion }),
};