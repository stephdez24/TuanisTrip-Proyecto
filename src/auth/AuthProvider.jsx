import { useState } from "react"
import { AuthContext } from "./AuthContext"
import {
    loginUser,
    getProfile,
    registerUser
} from "../services/authService"

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(
        localStorage.getItem("token")
    )

    async function login(correo, password) {
        const data = await loginUser(correo, password)

        localStorage.setItem("token", data.token)

        setToken(data.token)
        setUser(data.usuario)

        return data
    }

    async function register(userData) {
        return await registerUser(userData)
    }

    async function loadProfile() {
        if (!token) {
            return
        }

        try {
            const profile = await getProfile(token)
            setUser(profile)
        } catch {
            logout()
        }
    }

    function logout() {
        localStorage.removeItem("token")
        setToken(null)
        setUser(null)
    }

    const value = {
        user,
        token,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        loadProfile
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}