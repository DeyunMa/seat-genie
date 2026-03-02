import { describe, it, expect } from 'vitest'
import { toDateOnly } from './dateUtils'

describe('toDateOnly', () => {
    it('should return null for null or undefined input', () => {
        expect(toDateOnly(null)).toBeNull()
        expect(toDateOnly(undefined)).toBeNull()
    })

    it('should correctly format a valid date string', () => {
        const dateStr = '2023-10-05T14:48:00.000Z'
        expect(toDateOnly(dateStr)).toBe('2023-10-05')
    })

    it('should correctly format a date string with spaces instead of T', () => {
        const dateStr = '2023-10-05 14:48:00.000Z'
        expect(toDateOnly(dateStr)).toBe('2023-10-05')
    })

    it('should return null for an invalid date string', () => {
        expect(toDateOnly('invalid-date')).toBeNull()
    })

    it('should correctly format a Date object', () => {
        const date = new Date('2023-10-05T14:48:00.000Z')
        expect(toDateOnly(date)).toBe('2023-10-05')
    })
})
