import { useContext } from "react"
import { AuthContext } from "./AuthContext"

// Wrapper de useContext con un mensaje de error claro. Sin esto, si alguien
// usa useAuth() fuera de <AuthProvider>, React solo daría un error críptico
// tipo "Cannot read properties of null" al intentar leer .user, .login, etc.
export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth debe usarse dentro de <AuthProvider>")
    }
    return context
}