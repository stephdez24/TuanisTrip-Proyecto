// src/services/usuariosService.js
//
// Todo lo que toca el recurso /usuarios del API: login, registro público,
// perfil del usuario autenticado, y el mantenimiento de usuarios (listar/
// obtener/actualizar) que usa el rol Administrador.

import { apiClient } from "@/lib/api-client";

export const usuariosService = {
    // auth:false -> no manda el header Authorization (todavía no hay token
    // en estos dos casos, apenas se está generando).
    login: (correo, password) =>
        apiClient.post("/usuarios/login", { correo, password }, { auth: false }),

    registrarCliente: (data) =>
        apiClient.post("/usuarios/registro", data, { auth: false }),

    // El backend saca el id del usuario del token JWT, no del parámetro,
    // por eso este endpoint no recibe ningún id.
    obtenerPerfil: () => apiClient.get("/usuarios/perfil"),

    // rol es opcional: filtra por nombre de rol (ej. "Cliente") si se pasa,
    // o trae todos los usuarios si se omite.
    listar: (rol) => apiClient.get(rol ? `/usuarios?rol=${encodeURIComponent(rol)}` : "/usuarios"),

    obtenerPorId: (id) => apiClient.get(`/usuarios/${id}`),

    // PUT reemplaza el usuario completo; el API no permite tocar password ni
    // "activo" desde aquí (por diseño del backend, no es una limitación nuestra).
    actualizar: (id, data) => apiClient.put(`/usuarios/${id}`, data),
};