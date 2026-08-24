// src/lib/ThemeContext.jsx
//
// Alterna la clase "dark" en <html>, que es lo que activa las variables
// .dark ya definidas en index.css (@custom-variant dark (&:is(.dark *))).
// Persiste la elección en localStorage; si el usuario nunca eligió nada,
// respeta la preferencia del sistema operativo/navegador.

import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext(null)
const STORAGE_KEY = "tuanisTripTema"

function obtenerTemaInicial() {
    const guardado = localStorage.getItem(STORAGE_KEY)
    if (guardado === "dark" || guardado === "light") return guardado

    const prefiereOscuro = window.matchMedia("(prefers-color-scheme: dark)").matches
    return prefiereOscuro ? "dark" : "light"
}

export function ThemeProvider({ children }) {
    const [tema, setTema] = useState(obtenerTemaInicial)

    useEffect(() => {
        document.documentElement.classList.toggle("dark", tema === "dark")
        localStorage.setItem(STORAGE_KEY, tema)
    }, [tema])

    function alternarTema() {
        setTema((actual) => (actual === "dark" ? "light" : "dark"))
    }

    return (
        <ThemeContext.Provider value={{ tema, alternarTema }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error("useTheme debe usarse dentro de <ThemeProvider>")
    }
    return context
}