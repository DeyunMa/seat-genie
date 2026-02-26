import { apiRequest } from './apiClient'

const normalizeBook = (book) => ({
    ...book,
    activeStatus: book.activeStatus || book.active_status || 'Y'
})

export const listBooks = async () => {
    const result = await apiRequest('/api/books?limit=100')
    const data = Array.isArray(result?.data) ? result.data : []
    return data.map(normalizeBook)
}

export const createBook = async (payload) => {
    const result = await apiRequest('/api/books', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    return normalizeBook(result?.data ?? result)
}

export const updateBook = async (id, payload) => {
    const result = await apiRequest(`/api/books/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    })
    return normalizeBook(result?.data ?? result)
}

export const deleteBook = async (id) => {
    await apiRequest(`/api/books/${id}`, { method: 'DELETE' })
    return true
}
