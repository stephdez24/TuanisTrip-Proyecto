// src/services/usuarios.service.js
import { apiClient } from "@/lib/api-client";

export const usuariosService = {
    login: (correo, password) =>
        apiClient.post("/usuarios/login", { correo, password }, { auth: false }),

    registrarCliente: (data) =>
        apiClient.post("/usuarios/registro", data, { auth: false }),

    obtenerPerfil: () => apiClient.get("/usuarios/perfil"),

    listar: (rol) => apiClient.get(rol ? `/usuarios?rol=${encodeURIComponent(rol)}` : "/usuarios"),

    obtenerPorId: (id) => apiClient.get(`/usuarios/${id}`),

    actualizar: (id, data) => apiClient.put(`/usuarios/${id}`, data),
};