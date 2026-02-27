import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const connectionString = (process.env.DATABASE_URL || "file:./dev.db").replace("file:", "")
const adapter = new PrismaBetterSqlite3({ url: connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
    try {
        const slots = await prisma.timetableSlot.findMany({
            where: {
                classroomId: "1"
            },
            include: {
                subject: { select: { name: true, subjectId: true } },
                classroom: { select: { name: true, roomNo: false } }
            }
        });
        console.log("Success:", slots.length)
    } catch (e: any) {
        console.error("DB Error:", e.message)
    }
}

main().finally(() => process.exit())
