import { apiRequest } from './apiClient'
import type { Seat } from '../types'

interface ListSeatsParams {
    roomId?: number
    status?: string
    q?: string
    sortBy?: string
    sortOrder?: string
    limit?: number
    offset?: number
}

interface CreateSeatPayload {
    roomId: number
    seatNumber: string
    status?: string
    activeStatus?: string
}

interface UpdateSeatPayload {
    roomId?: number
    seatNumber?: string
    status?: string
    activeStatus?: string
}

export const listSeats = async ({ roomId, status, q, sortBy, sortOrder, limit = 100, offset = 0 }: ListSeatsParams = {}): Promise<Seat[]> => {
    const params = new URLSearchParams()
    if (roomId) params.set('roomId', String(roomId))
    if (status) params.set('status', status)
    if (q) params.set('q', q)
    if (sortBy) params.set('sortBy', sortBy)
    if (sortOrder) params.set('sortOrder', sortOrder)
    params.set('limit', String(limit))
    params.set('offset', String(offset))

    const result = await apiRequest(`/api/seats?${params.toString()}`)
    return Array.isArray(result) ? result as Seat[] : []
}

export const getSeat = async (id: number): Promise<Seat | null> => {
    const result = await apiRequest(`/api/seats/${id}`) as Record<string, unknown> | null
    return (result?.data ?? null) as Seat | null
}

export const createSeat = async (payload: CreateSeatPayload): Promise<Seat> => {
    const result = await apiRequest('/api/seats', {
        method: 'POST',
        body: JSON.stringify(payload)
    }) as Record<string, unknown> | Seat
    return ((result as Record<string, unknown>)?.data ?? result) as Seat
}

export const updateSeat = async (id: number, payload: UpdateSeatPayload): Promise<Seat> => {
    const result = await apiRequest(`/api/seats/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    }) as Record<string, unknown> | Seat
    return ((result as Record<string, unknown>)?.data ?? result) as Seat
}

export const deleteSeat = async (id: number): Promise<boolean> => {
    await apiRequest(`/api/seats/${id}`, { method: 'DELETE' })
    return true
}

export const getSeatsByRoom = async (roomId: number): Promise<Seat[]> => {
    return listSeats({ roomId })
}
