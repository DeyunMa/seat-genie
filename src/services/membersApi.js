import { apiRequest } from './apiClient'

export const listMembers = async ({ q, sortBy, sortOrder, limit = 200, offset = 0 } = {}) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (sortBy) params.set('sortBy', sortBy)
    if (sortOrder) params.set('sortOrder', sortOrder)
    params.set('limit', String(limit))
    params.set('offset', String(offset))

    const data = await apiRequest(`/api/members?${params.toString()}`)
    return Array.isArray(data) ? data : []
}

export const createMember = async (payload) => {
    const data = await apiRequest('/api/members', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    return data
}
