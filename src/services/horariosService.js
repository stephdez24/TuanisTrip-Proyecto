// Catálogo de solo lectura: el horario general del establecimiento (el
// mismo para todos los guías; las variaciones individuales son las
// Restricciones de Horario, sección aparte). El enunciado prohíbe
// crear/editar/eliminar horarios desde el FrontEnd.
import { apiClient } from "@/lib/api-client";

export const horariosService = {
    listar: () => apiClient.get("/horarios-atencion"),
    obtenerPorId: (id) => apiClient.get(`/horarios-atencion/${id}`),
};