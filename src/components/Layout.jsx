import { Outlet } from "react-router-dom"
import Navbar from "@/components/Navbar"

// Layout "de toda la app": navbar fija arriba, y <Outlet/> es donde React
// Router inyecta la página que corresponda a la ruta activa. Se usa como
// elemento contenedor en App.jsx: <Route element={<Layout />}> ... </Route>
export default function Layout() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    )
}