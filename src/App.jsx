import { Navigate, Route, Routes } from "react-router-dom"
import LoginPage from "./pages/LoginPage"

function App() {
    return (
        <Routes>
            <Route
                path="/"
                element={<Navigate to="/login" replace />}
            />

            <Route
                path="/login"
                element={<LoginPage />}
            />

            <Route
                path="/register"
                element={<div>Registro</div>}
            />

            <Route
                path="/unauthorized"
                element={<div>Acceso no autorizado</div>}
            />
        </Routes>
    )
}

export default App