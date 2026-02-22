import { apiRequest } from './apiClient'

export const listLoans = async ({ status, limit = 100, offset = 0 } = {}) => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    params.set('limit', String(limit))
    params.set('offset', String(offset))

    const result = await apiRequest(`/api/loans?${params.toString()}`)
    return Array.isArray(result?.data) ? result.data : []
}

export const createLoan = async (payload) => {
    const result = await apiRequest('/api/loans', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    return result?.data ?? result
}

export const updateLoan = async (id, payload) => {
    const result = await apiRequest(`/api/loans/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    })
    return result?.data ?? result
}
