export const toDateOnly = (value: string | Date | null | undefined): string | null => {
    if (!value) return null
    const normalized = typeof value === 'string' ? value.replace(' ', 'T') : value
    const date = new Date(normalized)
    if (Number.isNaN(date.getTime())) return null
    return date.toISOString().split('T')[0]
}
