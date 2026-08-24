// src/services/restriccionesHorarioService.js
//
// El backend SÍ expone POST/PUT/PATCH para este recurso, pero el enunciado
// pide que el equipo lo deje solo lectura en el FrontEnd (igual que
// Horarios de Atención). Por eso este servicio solo trae listar/obtener,
// a propósito — no es una limitación del API, es una decisión del proyecto.

import { apiClient } from "@/lib/api-client";

export const restriccionesHorarioService = {
    listar: () => apiClient.get("/restricciones-horario"),
    obtenerPorId: (id) => apiClient.get(`/restricciones-horario/${id}`),
};