// src/services/serviciosService.js
//
// CRUD completo del recurso /servicios (Tours, en la temática de Tuanis Trip).
import { apiClient } from "@/lib/api-client";

export const serviciosService = {
  // Todos los tours (activos e inactivos) — para el mantenimiento del Admin.
    listar: () => apiClient.get("/servicios"),

  // Solo los activos — para pantallas donde el usuario elige un tour para
  // reservar (no debe poder seleccionar uno desactivado).
    listarActivos: () => apiClient.get("/servicios/activos"),

    obtenerPorId: (id) => apiClient.get(`/servicios/${id}`),

  // "imagen" siempre viaja null: el API no tiene un endpoint de subida
  // conectado todavía (ver referencia técnica del API). La URL que la
  // persona pega en el formulario se guarda aparte, en localStorage
  // (lib/imagenLocal.js) — este servicio NUNCA la manda al backend, porque
  // el DTO la rechazaría (espera un nombre de archivo, no una URL).
    crear: (data) =>
        apiClient.post("/servicios", {
        nombre: data.nombre,
        descripcion: data.descripcion,
        precioBase: data.precioBase,
        duracionMinutos: data.duracionMinutos,
        especialidadId: data.especialidadId,
        imagen: null,
    }),

  // PUT reemplaza el servicio completo, por eso mandamos todos los campos
  // aunque la persona no haya tocado alguno.
    actualizar: (id, data) =>
        apiClient.put(`/servicios/${id}`, {
        nombre: data.nombre,
        descripcion: data.descripcion,
        precioBase: data.precioBase,
        duracionMinutos: data.duracionMinutos,
        especialidadId: data.especialidadId,
        imagen: null,
    }),

  // El backend rechaza esto con 409 si el tour tiene citas pendientes o
  // confirmadas — ese error se propaga tal cual vía ApiError.message.
    cambiarEstado: (id, activo) => apiClient.patch(`/servicios/${id}/estado`, { activo }),
};