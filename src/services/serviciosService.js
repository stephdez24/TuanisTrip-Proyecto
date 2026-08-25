// src/services/serviciosService.js
//
// CRUD completo del recurso /servicios (Tours, en la temática de Tuanis Trip).

import { apiClient } from "@/lib/api-client";

export const serviciosService = {

    // Todos los tours (activos e inactivos)
    // para el mantenimiento del Admin.
    listar: () => apiClient.get("/servicios"),

    // Solo los activos
    // para pantallas donde el usuario elige un tour para reservar.
    listarActivos: () => apiClient.get("/servicios/activos"),

    // Obtener un tour por ID.
    obtenerPorId: (id) =>
        apiClient.get(`/servicios/${id}`),

    // Crear un nuevo tour.
    crear: (data) =>
        apiClient.post("/servicios", {
            nombre: data.nombre,
            descripcion: data.descripcion,
            precioBase: data.precioBase,
            duracionMinutos: data.duracionMinutos,
            especialidadId: data.especialidadId,
            imagen: data.imagen,
        }),

    // Actualizar un tour existente.
    actualizar: (id, data) =>
        apiClient.put(`/servicios/${id}`, {
            nombre: data.nombre,
            descripcion: data.descripcion,
            precioBase: data.precioBase,
            duracionMinutos: data.duracionMinutos,
            especialidadId: data.especialidadId,
            imagen: data.imagen,
        }),

    // Cambiar estado activo/inactivo.
    cambiarEstado: (id, activo) =>
        apiClient.patch(`/servicios/${id}/estado`, {
            activo,
        }),
};