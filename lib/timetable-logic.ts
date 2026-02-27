import prisma from "@/lib/prisma";

export async function checkIsHoliday(date: Date): Promise<{ isHoliday: boolean; reason?: string }> {
    // Check Weekends (Saturday=6, Sunday=0)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        return { isHoliday: true, reason: "Weekend" };
    }

    // Check Database for explicit holidays
    // Strip time from incoming date to match DB date objects
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const holiday = await prisma.holiday.findFirst({
        where: {
            date: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
    });

    if (holiday) {
        return { isHoliday: true, reason: holiday.name };
    }

    return { isHoliday: false };
}
