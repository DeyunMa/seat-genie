import { apiRequest } from './apiClient'
import type { Campus } from '../types'

export const listCampuses = async (): Promise<Campus[]> => {
    const result = await apiRequest('/api/campuses?limit=100')
    return Array.isArray(result) ? result as Campus[] : []
}

export const createCampus = async (payload: { name: string; address?: string; description?: string }): Promise<Campus> => {
    const result = await apiRequest('/api/campuses', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    return result as Campus
}

export const updateCampus = async (id: number, payload: { name?: string; address?: string; description?: string }): Promise<Campus> => {
    const result = await apiRequest(`/api/campuses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    })
    return result as Campus
}

export const deleteCampus = async (id: number): Promise<boolean> => {
    await apiRequest(`/api/campuses/${id}`, { method: 'DELETE' })
    return true
}
