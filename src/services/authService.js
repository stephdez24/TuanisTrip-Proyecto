const API_URL = import.meta.env.VITE_API_URL

export async function loginUser(correo, password) {
    const response = await fetch(`${API_URL}/usuarios/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            correo,
            password
        })
    })

    if (!response.ok) {
        const data = await response.json().catch(() => null)

        throw new Error(
            data?.message || "Correo o contraseña incorrectos."
        )
    }

    return await response.json()
}

export async function getProfile(token) {
    const response = await fetch(`${API_URL}/usuarios/perfil`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    if (!response.ok) {
        throw new Error(
            "No se pudo obtener el perfil del usuario."
        )
    }

    return await response.json()
}

export async function registerUser(userData) {
    const response = await fetch(`${API_URL}/usuarios/registro`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nombre: userData.nombre,
            primerApellido: userData.primerApellido,
            segundoApellido: userData.segundoApellido,
            correo: userData.correo,
            telefono: userData.telefono,
            password: userData.password
        })
    })

    if (!response.ok) {
        const data = await response.json().catch(() => null)

        throw new Error(
            data?.message || "No se pudo registrar el usuario."
        )
    }

    return await response.json()
}