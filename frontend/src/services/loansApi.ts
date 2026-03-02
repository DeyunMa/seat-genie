import { apiRequest } from './apiClient'
import type { Loan } from '../types'

interface ListLoansParams {
    status?: string
    limit?: number
    offset?: number
}

interface CreateLoanPayload {
    bookId: number
    memberId: number
    dueAt: string
}

interface UpdateLoanPayload {
    returnedAt?: string
    dueAt?: string
}

export const listLoans = async ({ status, limit = 100, offset = 0 }: ListLoansParams = {}): Promise<Loan[]> => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    params.set('limit', String(limit))
    params.set('offset', String(offset))

    const result = await apiRequest(`/api/loans?${params.toString()}`)
    return Array.isArray(result) ? result as Loan[] : []
}

export const createLoan = async (payload: CreateLoanPayload): Promise<Loan> => {
    const result = await apiRequest('/api/loans', {
        method: 'POST',
        body: JSON.stringify(payload)
    }) as Record<string, unknown> | Loan
    return ((result as Record<string, unknown>)?.data ?? result) as Loan
}

export const updateLoan = async (id: number | string, payload: UpdateLoanPayload): Promise<Loan> => {
    const result = await apiRequest(`/api/loans/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    }) as Record<string, unknown> | Loan
    return ((result as Record<string, unknown>)?.data ?? result) as Loan
}
