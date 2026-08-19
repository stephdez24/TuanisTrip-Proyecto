import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../auth/useAuth"

function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    const { login } = useAuth()
    const navigate = useNavigate()

    async function handleSubmit(event) {
        event.preventDefault()
        setError("")

        try {
            await login(email, password)
            navigate("/")
        } catch {
            setError("Correo o contraseña incorrectos")
        }
    }

    return (
        <div>
            <h1>Iniciar sesión</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Correo</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Contraseña</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />
                </div>

                {error && <p>{error}</p>}

                <button type="submit">
                    Iniciar sesión
                </button>
            </form>

            <button onClick={() => navigate("/register")}>
                Crear cuenta
            </button>
        </div>
    )
}

export default LoginPage