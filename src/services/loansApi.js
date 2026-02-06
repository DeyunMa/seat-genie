import { apiRequest } from './apiClient'

export const listLoans = async ({ status, limit = 200, offset = 0 } = {}) => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    params.set('limit', String(limit))
    params.set('offset', String(offset))

    const data = await apiRequest(`/api/loans?${params.toString()}`)
    return Array.isArray(data) ? data : []
}

export const createLoan = async (payload) => {
    const data = await apiRequest('/api/loans', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    return data
}

export const updateLoan = async (id, payload) => {
    const data = await apiRequest(`/api/loans/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    })
    return data
}
