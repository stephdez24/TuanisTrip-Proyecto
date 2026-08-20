// src/services/extrasService.js
//
// Capa de acceso al recurso "servicios-adicionales" del API. No contiene
// lógica de UI ni de validación — solo arma las llamadas HTTP. Los
// componentes (páginas) importan esto y nunca llaman a apiClient
// directamente, para que si el endpoint cambia algún día, solo se
// edita este archivo.

import { apiClient } from "@/lib/api-client";

export const extrasService = {
  // Todos los extras (activos e inactivos) — usado en el mantenimiento del Admin.
    listar: () => apiClient.get("/servicios-adicionales"),

    // Solo los activos — usado cuando el cliente arma su reserva (sección de Citas).
    listarActivos: () => apiClient.get("/servicios-adicionales/activos"),

    obtenerPorId: (id) => apiClient.get(`/servicios-adicionales/${id}`),

    // El API crea el extra siempre como activo: no se manda ese campo aquí.
    crear: (data) => apiClient.post("/servicios-adicionales", data),

    // PUT reemplaza el registro completo, por eso "data" debe traer TODOS
    // los campos editables (nombre, descripcion, precio), no solo los que cambiaron.
    actualizar: (id, data) => apiClient.put(`/servicios-adicionales/${id}`, data),

    // Activar/desactivar es un endpoint aparte (PATCH), no se hace con el PUT normal.
    cambiarEstado: (id, activo) =>
    apiClient.patch(`/servicios-adicionales/${id}/estado`, { activo }),
};