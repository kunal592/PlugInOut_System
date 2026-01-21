// Attendance Repository
export class AttendanceRepository {
    constructor(private readonly db: any) { }

    async findByDate(userId: string, date: Date) {
        const dateOnly = new Date(date.toISOString().split('T')[0]);
        return this.db.tool_attendance_Record.findFirst({
            where: { userId, date: dateOnly }
        });
    }

    async findByRange(userId: string, from: Date, to: Date) {
        return this.db.tool_attendance_Record.findMany({
            where: {
                userId,
                date: { gte: from, lte: to }
            },
            orderBy: { date: 'desc' }
        });
    }

    async upsert(userId: string, date: Date, data: any) {
        const dateOnly = new Date(date.toISOString().split('T')[0]);
        return this.db.tool_attendance_Record.upsert({
            where: { userId_date: { userId, date: dateOnly } },
            create: { userId, date: dateOnly, ...data },
            update: data
        });
    }

    async getMonthlyReport(userId: string, year: number, month: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        return this.db.tool_attendance_Record.findMany({
            where: {
                userId,
                date: { gte: startDate, lte: endDate }
            },
            orderBy: { date: 'asc' }
        });
    }

    async createLeave(data: {
        userId: string;
        startDate: Date;
        endDate: Date;
        type: string;
        reason?: string;
    }) {
        return this.db.tool_attendance_Leave.create({ data });
    }

    async getLeaves(userId: string) {
        return this.db.tool_attendance_Leave.findMany({
            where: { userId },
            orderBy: { startDate: 'desc' }
        });
    }
}
