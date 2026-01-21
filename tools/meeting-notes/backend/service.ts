// Meeting Notes Service
import { MeetingRepository } from './repository';

export class MeetingService {
    private repository: MeetingRepository;

    constructor(db: any) {
        this.repository = new MeetingRepository(db);
    }

    async getMeetings(userId: string, options?: { search?: string; tag?: string; from?: string; to?: string }) {
        return this.repository.findAll(userId, {
            search: options?.search,
            tag: options?.tag,
            from: options?.from ? new Date(options.from) : undefined,
            to: options?.to ? new Date(options.to) : undefined
        });
    }

    async getMeeting(id: string, userId: string) {
        const meeting = await this.repository.findById(id, userId);
        if (!meeting) throw new Error('Meeting not found');
        return meeting;
    }

    async createMeeting(userId: string, data: {
        title: string;
        date: string;
        duration?: number;
        attendees?: string[];
        tags?: string[];
        content: string;
        summary?: string;
        actionItems?: string[];
    }) {
        if (!data.title?.trim()) throw new Error('Title is required');
        if (!data.content?.trim()) throw new Error('Content is required');

        return this.repository.create({
            userId,
            title: data.title.trim(),
            date: new Date(data.date),
            duration: data.duration,
            attendees: data.attendees || [],
            tags: data.tags || [],
            content: data.content,
            summary: data.summary,
            actionItems: data.actionItems || []
        });
    }

    async updateMeeting(id: string, userId: string, data: any) {
        const updateData: any = { ...data };
        if (data.date) updateData.date = new Date(data.date);

        await this.repository.update(id, userId, updateData);
        return this.getMeeting(id, userId);
    }

    async deleteMeeting(id: string, userId: string) {
        await this.repository.delete(id, userId);
        return { success: true };
    }

    async getTags(userId: string) {
        return this.repository.getAllTags(userId);
    }

    async getRecentMeetings(userId: string, limit?: number) {
        return this.repository.getRecent(userId, limit);
    }
}
