// src/services/empleadosService.js
//
// CRUD de /empleados (Guías turísticos, en la temática de Tuanis Trip),
// más la consulta de agenda que se va a usar en el módulo de Citas.
import { apiClient } from "@/lib/api-client";

export const empleadosService = {
    listar: () => apiClient.get("/empleados"),
    // servicioId es opcional: si se pasa, el API filtra solo los guías
    // activos que además tienen ESE tour asignado — se usa en el
    // formulario de reservas para no dejar elegir un guía que no puede
    // atender el tour seleccionado.
    listarActivos: (servicioId) =>
        apiClient.get(servicioId ? `/empleados/activos?servicioId=${servicioId}` : "/empleados/activos"),
    obtenerPorId: (id) => apiClient.get(`/empleados/${id}`),

    // Agenda de un guía para una fecha específica: horario del establecimiento,
    // restricciones aplicables y las citas ya asignadas ese día. Se usa acá
    // mismo (detalle del guía) y se va a reutilizar en el módulo de Citas.
    obtenerAgenda: (id, fecha) => apiClient.get(`/empleados/${id}/agenda?fecha=${fecha}`),

    // servicioIds va incluido desde la creación: el formulario asigna los
    // tours que puede atender en el mismo paso, no en una pantalla aparte
    // (así lo pide el enunciado).
    crear: (data) => apiClient.post("/empleados", data),

    // PUT reemplaza el empleado completo, incluyendo servicioIds: si se
    // manda un array distinto, el backend reemplaza TODA la asignación de
    // tours, no la combina con la anterior.
    actualizar: (id, data) => apiClient.put(`/empleados/${id}`, data),

    cambiarEstado: (id, activo) => apiClient.patch(`/empleados/${id}/estado`, { activo }),
};