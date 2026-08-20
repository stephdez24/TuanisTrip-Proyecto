// src/services/estadosCitaService.js
//
// Catálogo de solo lectura. Cada estado ya trae su propio "color",
// "permiteEdicion", "permiteCancelacionCliente" y "bloqueaDisponibilidad"
// desde el backend — se van a usar tal cual en el módulo de Reservas
// (Citas) para no hardcodear esa lógica de negocio en el FrontEnd.
import { apiClient } from "@/lib/api-client";

export const estadosCitaService = {
    listar: () => apiClient.get("/estados-cita"),
    obtenerPorId: (id) => apiClient.get(`/estados-cita/${id}`),
};