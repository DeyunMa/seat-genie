import { apiRequest } from './apiClient'
import type { Room } from '../types'

interface ListRoomsParams {
    q?: string
    sortBy?: string
    sortOrder?: string
    limit?: number
    offset?: number
}

interface CreateRoomPayload {
    name: string
    floor?: number
    capacity: number
    openTime?: string
    closeTime?: string
    activeStatus?: string
}

interface UpdateRoomPayload {
    name?: string
    floor?: number
    capacity?: number
    openTime?: string
    closeTime?: string
    activeStatus?: string
}

export const listRooms = async ({ q, sortBy, sortOrder, limit = 100, offset = 0 }: ListRoomsParams = {}): Promise<Room[]> => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (sortBy) params.set('sortBy', sortBy)
    if (sortOrder) params.set('sortOrder', sortOrder)
    params.set('limit', String(limit))
    params.set('offset', String(offset))

    const result = await apiRequest(`/api/rooms?${params.toString()}`)
    return Array.isArray(result) ? result as Room[] : []
}

export const getRoom = async (id: number): Promise<Room | null> => {
    const result = await apiRequest(`/api/rooms/${id}`) as Record<string, unknown> | null
    return (result?.data ?? null) as Room | null
}

export const createRoom = async (payload: CreateRoomPayload): Promise<Room> => {
    const result = await apiRequest('/api/rooms', {
        method: 'POST',
        body: JSON.stringify(payload)
    }) as Record<string, unknown> | Room
    return ((result as Record<string, unknown>)?.data ?? result) as Room
}

export const updateRoom = async (id: number, payload: UpdateRoomPayload): Promise<Room> => {
    const result = await apiRequest(`/api/rooms/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    }) as Record<string, unknown> | Room
    return ((result as Record<string, unknown>)?.data ?? result) as Room
}

export const deleteRoom = async (id: number): Promise<boolean> => {
    await apiRequest(`/api/rooms/${id}`, { method: 'DELETE' })
    return true
}
