// Meeting Notes Repository
export class MeetingRepository {
    constructor(private readonly db: any) { }

    async findAll(userId: string, options?: { search?: string; tag?: string; from?: Date; to?: Date }) {
        const where: any = { userId };

        if (options?.search) {
            where.OR = [
                { title: { contains: options.search, mode: 'insensitive' } },
                { content: { contains: options.search, mode: 'insensitive' } }
            ];
        }

        if (options?.tag) {
            where.tags = { has: options.tag };
        }

        if (options?.from || options?.to) {
            where.date = {};
            if (options.from) where.date.gte = options.from;
            if (options.to) where.date.lte = options.to;
        }

        return this.db.tool_meeting_Meeting.findMany({
            where,
            orderBy: { date: 'desc' }
        });
    }

    async findById(id: string, userId: string) {
        return this.db.tool_meeting_Meeting.findFirst({
            where: { id, userId }
        });
    }

    async create(data: {
        userId: string;
        title: string;
        date: Date;
        duration?: number;
        attendees?: string[];
        tags?: string[];
        content: string;
        summary?: string;
        actionItems?: string[];
    }) {
        return this.db.tool_meeting_Meeting.create({ data });
    }

    async update(id: string, userId: string, data: any) {
        return this.db.tool_meeting_Meeting.updateMany({
            where: { id, userId },
            data
        });
    }

    async delete(id: string, userId: string) {
        return this.db.tool_meeting_Meeting.deleteMany({
            where: { id, userId }
        });
    }

    async getAllTags(userId: string) {
        const meetings = await this.db.tool_meeting_Meeting.findMany({
            where: { userId },
            select: { tags: true }
        });

        const tagSet = new Set<string>();
        meetings.forEach((m: any) => m.tags.forEach((t: string) => tagSet.add(t)));
        return Array.from(tagSet).sort();
    }

    async getRecent(userId: string, limit: number = 5) {
        return this.db.tool_meeting_Meeting.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            take: limit
        });
    }
}
