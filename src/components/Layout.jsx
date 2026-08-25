import { Outlet } from "react-router-dom"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

// Layout "de toda la app": navbar fija arriba, contenido de la página
// en <Outlet/> y footer general al final.
// Como todas las páginas pasan por este Layout, el footer aparece
// automáticamente en toda la aplicación.
export default function Layout() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />

            <main className="flex-1">
                <Outlet />
            </main>

            <Footer />
        </div>
    )
}