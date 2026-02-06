const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const buildUrl = (path) => {
    if (!path.startsWith('/')) {
        return `${API_BASE_URL}/${path}`
    }
    return `${API_BASE_URL}${path}`
}

const parseJson = async (response) => {
    const text = await response.text()
    if (!text) {
        return null
    }
    try {
        return JSON.parse(text)
    } catch (error) {
        return null
    }
}

export const apiRequest = async (path, options = {}) => {
    const response = await fetch(buildUrl(path), {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        ...options
    })

    if (!response.ok) {
        const payload = await parseJson(response)
        const error = new Error(payload?.error || '请求失败')
        error.code = payload?.code
        error.details = payload?.details
        throw error
    }

    const payload = await parseJson(response)
    return payload?.data ?? null
}
