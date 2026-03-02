import { apiRequest } from './apiClient'
import type { Book } from '../types'

interface CreateBookPayload {
    title: string
    isbn: string
    author: string
    publisher?: string
    category?: string
    location?: string
    published_year?: number
    status?: string
    activeStatus?: string
    authorId?: number
}

interface UpdateBookPayload {
    title?: string
    isbn?: string
    author?: string
    publisher?: string
    category?: string
    location?: string
    published_year?: number
    status?: string
    activeStatus?: string
    authorId?: number
}

interface RawBook extends Partial<Book> {
    active_status?: string
}

const normalizeBook = (book: RawBook): Book => ({
    ...book,
    activeStatus: book.activeStatus || book.active_status || 'Y'
} as Book)

export const listBooks = async (): Promise<Book[]> => {
    const result = await apiRequest('/api/books?limit=100')
    const data = Array.isArray(result) ? (result as RawBook[]) : []
    return data.map(normalizeBook)
}

export const createBook = async (payload: CreateBookPayload): Promise<Book> => {
    const result = await apiRequest('/api/books', {
        method: 'POST',
        body: JSON.stringify(payload)
    }) as Record<string, unknown> | RawBook
    return normalizeBook(((result as Record<string, unknown>)?.data ?? result) as RawBook)
}

export const updateBook = async (id: number, payload: UpdateBookPayload): Promise<Book> => {
    const result = await apiRequest(`/api/books/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    }) as Record<string, unknown> | RawBook
    return normalizeBook(((result as Record<string, unknown>)?.data ?? result) as RawBook)
}

export const deleteBook = async (id: number): Promise<boolean> => {
    await apiRequest(`/api/books/${id}`, { method: 'DELETE' })
    return true
}
