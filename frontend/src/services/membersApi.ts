import { apiRequest } from './apiClient'
import type { Member } from '../types'

interface ListMembersParams {
    q?: string
    sortBy?: string
    sortOrder?: string
    limit?: number
    offset?: number
}

interface CreateMemberPayload {
    name: string
    email: string
    phone?: string
}

export const listMembers = async ({ q, sortBy, sortOrder, limit = 100, offset = 0 }: ListMembersParams = {}): Promise<Member[]> => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (sortBy) params.set('sortBy', sortBy)
    if (sortOrder) params.set('sortOrder', sortOrder)
    params.set('limit', String(limit))
    params.set('offset', String(offset))

    const result = await apiRequest(`/api/members?${params.toString()}`)
    return Array.isArray(result) ? result as Member[] : []
}

export const createMember = async (payload: CreateMemberPayload): Promise<Member> => {
    const result = await apiRequest('/api/members', {
        method: 'POST',
        body: JSON.stringify(payload)
    }) as Record<string, unknown> | Member
    return ((result as Record<string, unknown>)?.data ?? result) as Member
}
