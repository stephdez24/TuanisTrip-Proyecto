import { useEffect, useState } from "react"
import { AuthContext } from "./AuthContext"
import { usuariosService } from "@/services/usuariosService"
import { getToken, setToken, clearToken } from "@/lib/api-client"

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null) // objeto UsuarioResponse del API (incluye rol, empleado)
    // Inicializador perezoso: si no hay token guardado, "loading" ya nace en false.
    const [loading, setLoading] = useState(() => Boolean(getToken()))

    async function loadProfile() {
        try {
            const response = await usuariosService.obtenerPerfil()
            setUser(response.data)
        } catch (error) {
            console.error(error)
            logout()
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!getToken()) return

        // Sesión guardada de una visita anterior: recuperamos el perfil.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadProfile()
    }, [])

    async function login(correo, password) {
        const response = await usuariosService.login(correo, password)
        setToken(response.data.token)

        // Clave: cargar el perfil AQUÍ, no dejarlo para después.
        // Sin esto, "user" se queda en null tras iniciar sesión.
        const perfil = await usuariosService.obtenerPerfil()
        setUser(perfil.data)

        return perfil.data
    }

    async function register(userData) {
        return await usuariosService.registrarCliente(userData)
    }

    function logout() {
        clearToken()
        setUser(null)
    }

    const value = {
        user, // null si no hay sesión
        rol: user?.rol?.nombre ?? null, // "Administrador" | "Empleado" | "Cliente"
        empleadoId: user?.empleado?.id ?? null,
        isAuthenticated: Boolean(user),
        loading, // true mientras se valida una sesión guardada al montar la app
        login,
        register,
        logout,
        refetchPerfil: loadProfile,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}