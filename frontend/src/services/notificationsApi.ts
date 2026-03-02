import { apiRequest } from './apiClient'
import type { Notification } from '../types'

interface ListNotificationsParams {
    type?: string
    sortBy?: string
    sortOrder?: string
    limit?: number
    offset?: number
}

interface CreateNotificationPayload {
    title: string
    content: string
    type: string
    createdBy?: number
    activeStatus?: string
}

interface UpdateNotificationPayload {
    title?: string
    content?: string
    type?: string
    activeStatus?: string
}

export const listNotifications = async ({ type, sortBy, sortOrder, limit = 100, offset = 0 }: ListNotificationsParams = {}): Promise<Notification[]> => {
    const params = new URLSearchParams()
    if (type) params.set('type', type)
    if (sortBy) params.set('sortBy', sortBy)
    if (sortOrder) params.set('sortOrder', sortOrder)
    params.set('limit', String(limit))
    params.set('offset', String(offset))

    const result = await apiRequest(`/api/notifications?${params.toString()}`)
    return Array.isArray(result) ? result as Notification[] : []
}

export const getNotification = async (id: number): Promise<Notification | null> => {
    const result = await apiRequest(`/api/notifications/${id}`) as Record<string, unknown> | null
    return (result?.data ?? null) as Notification | null
}

export const createNotification = async (payload: CreateNotificationPayload): Promise<Notification> => {
    const result = await apiRequest('/api/notifications', {
        method: 'POST',
        body: JSON.stringify(payload)
    }) as Record<string, unknown> | Notification
    return ((result as Record<string, unknown>)?.data ?? result) as Notification
}

export const updateNotification = async (id: number, payload: UpdateNotificationPayload): Promise<Notification> => {
    const result = await apiRequest(`/api/notifications/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    }) as Record<string, unknown> | Notification
    return ((result as Record<string, unknown>)?.data ?? result) as Notification
}

export const deleteNotification = async (id: number): Promise<boolean> => {
    await apiRequest(`/api/notifications/${id}`, { method: 'DELETE' })
    return true
}

export const markAsRead = async (notificationId: number, userId: number): Promise<unknown> => {
    const result = await apiRequest(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        body: JSON.stringify({ userId })
    }) as Record<string, unknown> | null
    return result?.data ?? result
}

export const getReadStatus = async (ids: number[], userId: number): Promise<Record<number, boolean>> => {
    const result = await apiRequest('/api/notifications/read-status', {
        method: 'POST',
        body: JSON.stringify({ ids, userId })
    }) as Record<string, unknown> | null
    return (result?.data ?? result) as Record<number, boolean>
}

export const getUnreadCount = async (userId: number): Promise<number> => {
    const result = await apiRequest(`/api/notifications/unread/count?userId=${userId}`) as Record<string, unknown> | null
    return (result?.data as Record<string, number>)?.count || (result as Record<string, number> | null)?.count || 0
}
