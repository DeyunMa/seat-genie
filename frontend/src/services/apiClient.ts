import { useAuthStore } from '../stores/authStore'
import type { ApiRequestOptions } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

interface ApiError extends Error {
    status?: number
    code?: string
    details?: string
}

const buildUrl = (path: string): string => {
    if (!path.startsWith('/')) {
        return `${API_BASE_URL}/${path}`
    }
    return `${API_BASE_URL}${path}`
}

const parseJson = async (response: Response): Promise<Record<string, unknown> | null> => {
    const text = await response.text()
    if (!text) {
        return null
    }
    try {
        return JSON.parse(text) as Record<string, unknown>
    } catch {
        return null
    }
}

export const apiRequest = async (path: string, options: ApiRequestOptions = {}): Promise<unknown> => {
    let token: string | null = null
    try {
        const authState = useAuthStore.getState()
        token = authState.token
    } catch {
        // Store not yet initialized; token remains null
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
    }

    const response = await fetch(buildUrl(path), {
        ...options,
        headers
    })

    if (!response.ok) {
        const payload = await parseJson(response)

        if (response.status === 401) {
            try {
                const authStore = useAuthStore.getState()
                if (authStore.isAuthenticated) {
                    authStore.logout()
                    window.location.href = '/login'
                }
            } catch {
                // ignore store errors during logout
            }
        }

        const error: ApiError = new Error(
            (payload?.error as string) || '请求失败'
        )
        error.status = response.status
        error.code = payload?.code as string | undefined
        error.details = payload?.details as string | undefined
        throw error
    }

    const payload = await parseJson(response)
    return (payload as Record<string, unknown>)?.data ?? null
}
