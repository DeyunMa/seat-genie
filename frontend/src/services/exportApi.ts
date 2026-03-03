import { useAuthStore } from '../stores/authStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const getAuthHeaders = (): Record<string, string> => {
    const token = useAuthStore.getState().token
    return token ? { Authorization: `Bearer ${token}` } : {}
}

const downloadExcel = async (endpoint: string, filename: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/export/${endpoint}`, {
        headers: getAuthHeaders()
    })

    if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`)
    }

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

export const exportBooks = (): Promise<void> => downloadExcel('books', 'books.xlsx')
export const exportUsers = (): Promise<void> => downloadExcel('users', 'users.xlsx')
export const exportReservations = (): Promise<void> => downloadExcel('reservations', 'reservations.xlsx')
export const exportLoans = (): Promise<void> => downloadExcel('loans', 'loans.xlsx')

export const importBooks = async (file: File): Promise<{ success: number; failed: number; errors: string[] }> => {
    const buffer = await file.arrayBuffer()
    const response = await fetch(`${API_BASE_URL}/api/export/books/import`, {
        method: 'POST',
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        body: buffer
    })

    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error((err as Record<string, string>).error || 'Import failed')
    }

    const result = await response.json()
    return result.data
}
