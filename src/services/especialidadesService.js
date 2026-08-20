// src/services/especialidadesService.js
//
// Catálogo de solo lectura: el enunciado prohíbe crear/editar/eliminar
// especialidades desde el FrontEnd, por eso este servicio solo tiene GETs.
// Se usa principalmente para llenar el <Select> de categoría en el
// formulario de Tours.
import { apiClient } from "@/lib/api-client";

export const especialidadesService = {
    listar: () => apiClient.get("/especialidades"),
    obtenerPorId: (id) => apiClient.get(`/especialidades/${id}`),
};