// Time Tracker Repository
export class TimeRepository {
    constructor(private readonly db: any) { }

    async findAll(userId: string, options?: { from?: Date; to?: Date }) {
        const where: any = { userId };
        if (options?.from || options?.to) {
            where.startTime = {};
            if (options.from) where.startTime.gte = options.from;
            if (options.to) where.startTime.lte = options.to;
        }

        return this.db.tool_time_Entry.findMany({
            where,
            orderBy: { startTime: 'desc' }
        });
    }

    async findRunning(userId: string) {
        return this.db.tool_time_Entry.findFirst({
            where: { userId, isRunning: true }
        });
    }

    async findById(id: string, userId: string) {
        return this.db.tool_time_Entry.findFirst({
            where: { id, userId }
        });
    }

    async create(data: {
        userId: string;
        description?: string;
        projectId?: string;
        taskId?: string;
        startTime: Date;
        endTime?: Date;
        duration?: number;
        isRunning?: boolean;
        tags?: string[];
    }) {
        return this.db.tool_time_Entry.create({ data });
    }

    async update(id: string, userId: string, data: any) {
        return this.db.tool_time_Entry.updateMany({
            where: { id, userId },
            data
        });
    }

    async delete(id: string, userId: string) {
        return this.db.tool_time_Entry.deleteMany({
            where: { id, userId }
        });
    }

    async getDailySummary(userId: string, date: Date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const entries = await this.db.tool_time_Entry.findMany({
            where: {
                userId,
                startTime: { gte: startOfDay, lte: endOfDay }
            }
        });

        return entries.reduce((total: number, e: any) => total + (e.duration || 0), 0);
    }
}
