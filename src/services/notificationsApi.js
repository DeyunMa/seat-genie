import { apiRequest } from './apiClient'

export const listNotifications = async ({ type, sortBy, sortOrder, limit = 100, offset = 0 } = {}) => {
    const params = new URLSearchParams()
    if (type) params.set('type', type)
    if (sortBy) params.set('sortBy', sortBy)
    if (sortOrder) params.set('sortOrder', sortOrder)
    params.set('limit', String(limit))
    params.set('offset', String(offset))

    const data = await apiRequest(`/api/notifications?${params.toString()}`)
    return Array.isArray(data) ? data : []
}

export const getNotification = async (id) => {
    return await apiRequest(`/api/notifications/${id}`)
}

export const createNotification = async (payload) => {
    return await apiRequest('/api/notifications', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
}

export const updateNotification = async (id, payload) => {
    return await apiRequest(`/api/notifications/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    })
}

export const deleteNotification = async (id) => {
    await apiRequest(`/api/notifications/${id}`, { method: 'DELETE' })
    return true
}

export const markAsRead = async (notificationId, userId) => {
    return await apiRequest(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        body: JSON.stringify({ userId })
    })
}

export const getReadStatus = async (ids, userId) => {
    return await apiRequest('/api/notifications/read-status', {
        method: 'POST',
        body: JSON.stringify({ ids, userId })
    })
}

export const getUnreadCount = async (userId) => {
    const data = await apiRequest(`/api/notifications/unread/count?userId=${userId}`)
    return data?.count || 0
}
