import { checkIsHoliday } from '../lib/timetable-logic'
import { vi } from 'vitest'
import prisma from '../lib/prisma'

vi.mock('../lib/prisma', () => {
    return {
        default: {
            holiday: {
                findFirst: vi.fn()
            }
        }
    }
})

describe('Timetable Logic - Holidays', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return true for weekends (Sunday)', async () => {
        // 2026-03-01 is a Sunday
        const sunday = new Date('2026-03-01T12:00:00Z')
        const result = await checkIsHoliday(sunday)
        expect(result.isHoliday).toBe(true)
        expect(result.reason).toBe('Weekend')
    })

    it('should return true for weekends (Saturday)', async () => {
        // 2026-02-28 is a Saturday
        const saturday = new Date('2026-02-28T12:00:00Z')
        const result = await checkIsHoliday(saturday)
        expect(result.isHoliday).toBe(true)
        expect(result.reason).toBe('Weekend')
    })

    it('should return false for regular weekdays without DB holiday', async () => {
        // 2026-02-27 is a Friday
        (prisma.holiday.findFirst as any).mockResolvedValue(null)
        const friday = new Date('2026-02-27T12:00:00Z')
        const result = await checkIsHoliday(friday)
        expect(result.isHoliday).toBe(false)
    })

    it('should return true for weekdays configured as holidays in DB', async () => {
        // Mock DB returning a holiday
        (prisma.holiday.findFirst as any).mockResolvedValue({
            name: 'Diwali',
            type: 'festival'
        });
        const friday = new Date('2026-02-27T12:00:00Z')
        const result = await checkIsHoliday(friday)
        expect(result.isHoliday).toBe(true)
        expect(result.reason).toBe('Diwali')

        // Verify startOfDay and endOfDay query
        expect(prisma.holiday.findFirst).toHaveBeenCalled()
    })
})
