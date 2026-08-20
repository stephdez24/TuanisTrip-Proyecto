// src/services/rolesService.js
//
// Catálogo de solo lectura. No lleva pantalla propia (el enunciado lo pide
// así) — el rol de cada usuario ya viene incluido en la respuesta de
// /usuarios/perfil, así que rara vez hace falta llamar este servicio
// directamente.
import { apiClient } from "@/lib/api-client";

export const rolesService = {
    listar: () => apiClient.get("/roles"),
    obtenerPorId: (id) => apiClient.get(`/roles/${id}`),
};