import { apiRequest } from './apiClient'
import type { Reservation } from '../types'

interface ListReservationsParams {
    userId?: number
    seatId?: number
    date?: string
    status?: string
    sortBy?: string
    sortOrder?: string
    limit?: number
    offset?: number
}

interface CreateReservationPayload {
    userId: number
    seatId: number
    date: string
    startTime: string
    endTime: string
    status?: string
}

interface UpdateReservationPayload {
    date?: string
    startTime?: string
    endTime?: string
    status?: string
}

export const listReservations = async ({ userId, seatId, date, status, sortBy, sortOrder, limit = 100, offset = 0 }: ListReservationsParams = {}): Promise<Reservation[]> => {
    const params = new URLSearchParams()
    if (userId) params.set('userId', String(userId))
    if (seatId) params.set('seatId', String(seatId))
    if (date) params.set('date', date)
    if (status) params.set('status', status)
    if (sortBy) params.set('sortBy', sortBy)
    if (sortOrder) params.set('sortOrder', sortOrder)
    params.set('limit', String(limit))
    params.set('offset', String(offset))

    const result = await apiRequest(`/api/reservations?${params.toString()}`)
    return Array.isArray(result) ? result as Reservation[] : []
}

export const getReservation = async (id: number): Promise<Reservation | null> => {
    const result = await apiRequest(`/api/reservations/${id}`) as Record<string, unknown> | null
    return (result?.data ?? null) as Reservation | null
}

export const createReservation = async (payload: CreateReservationPayload): Promise<Reservation> => {
    const result = await apiRequest('/api/reservations', {
        method: 'POST',
        body: JSON.stringify(payload)
    }) as Record<string, unknown> | Reservation
    return ((result as Record<string, unknown>)?.data ?? result) as Reservation
}

export const updateReservation = async (id: number, payload: UpdateReservationPayload): Promise<Reservation> => {
    const result = await apiRequest(`/api/reservations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    }) as Record<string, unknown> | Reservation
    return ((result as Record<string, unknown>)?.data ?? result) as Reservation
}

export const cancelReservation = async (id: number): Promise<Reservation> => {
    const result = await apiRequest(`/api/reservations/${id}/cancel`, {
        method: 'POST'
    }) as Record<string, unknown> | Reservation
    return ((result as Record<string, unknown>)?.data ?? result) as Reservation
}

export const deleteReservation = async (id: number): Promise<boolean> => {
    await apiRequest(`/api/reservations/${id}`, { method: 'DELETE' })
    return true
}
