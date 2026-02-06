import { apiRequest } from './apiClient'

const normalizeBook = (book) => ({
    ...book,
    activeStatus: book.activeStatus || book.active_status || 'Y'
})

export const listBooks = async () => {
    const data = await apiRequest('/api/books?limit=100')
    return Array.isArray(data) ? data.map(normalizeBook) : []
}

export const createBook = async (payload) => {
    const data = await apiRequest('/api/books', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    return normalizeBook(data)
}

export const updateBook = async (id, payload) => {
    const data = await apiRequest(`/api/books/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    })
    return normalizeBook(data)
}

export const deleteBook = async (id) => {
    await apiRequest(`/api/books/${id}`, { method: 'DELETE' })
    return true
}
