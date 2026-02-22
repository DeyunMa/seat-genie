import { apiRequest } from './apiClient'

export const listMembers = async ({ q, sortBy, sortOrder, limit = 100, offset = 0 } = {}) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (sortBy) params.set('sortBy', sortBy)
    if (sortOrder) params.set('sortOrder', sortOrder)
    params.set('limit', String(limit))
    params.set('offset', String(offset))

    const result = await apiRequest(`/api/members?${params.toString()}`)
    return Array.isArray(result?.data) ? result.data : []
}

export const createMember = async (payload) => {
    const result = await apiRequest('/api/members', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    return result?.data ?? result
}
