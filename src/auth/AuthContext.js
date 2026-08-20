import { createContext } from "react"

// Contexto compartido: AuthProvider.jsx lo llena con valores reales,
// useAuth.js lo consume. Debe ser el ÚNICO AuthContext de todo el proyecto.
export const AuthContext = createContext(null)