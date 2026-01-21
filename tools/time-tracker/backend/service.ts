// Time Tracker Service
import { TimeRepository } from './repository';

export class TimeService {
    private repository: TimeRepository;

    constructor(db: any) {
        this.repository = new TimeRepository(db);
    }

    async getEntries(userId: string, options?: { from?: string; to?: string }) {
        return this.repository.findAll(userId, {
            from: options?.from ? new Date(options.from) : undefined,
            to: options?.to ? new Date(options.to) : undefined
        });
    }

    async startTimer(userId: string, data: { description?: string; projectId?: string; taskId?: string; tags?: string[] }) {
        // Stop any running timer first
        const running = await this.repository.findRunning(userId);
        if (running) {
            await this.stopTimer(running.id, userId);
        }

        return this.repository.create({
            userId,
            ...data,
            startTime: new Date(),
            isRunning: true
        });
    }

    async stopTimer(id: string, userId: string) {
        const entry = await this.repository.findById(id, userId);
        if (!entry) throw new Error('Entry not found');
        if (!entry.isRunning) throw new Error('Timer is not running');

        const endTime = new Date();
        const duration = Math.round((endTime.getTime() - entry.startTime.getTime()) / 1000);

        await this.repository.update(id, userId, {
            endTime,
            duration,
            isRunning: false
        });

        return this.repository.findById(id, userId);
    }

    async getRunningTimer(userId: string) {
        return this.repository.findRunning(userId);
    }

    async createManualEntry(userId: string, data: {
        description?: string;
        startTime: string;
        endTime: string;
        projectId?: string;
        taskId?: string;
        tags?: string[];
    }) {
        const start = new Date(data.startTime);
        const end = new Date(data.endTime);
        const duration = Math.round((end.getTime() - start.getTime()) / 1000);

        return this.repository.create({
            userId,
            description: data.description,
            projectId: data.projectId,
            taskId: data.taskId,
            tags: data.tags || [],
            startTime: start,
            endTime: end,
            duration,
            isRunning: false
        });
    }

    async deleteEntry(id: string, userId: string) {
        await this.repository.delete(id, userId);
        return { success: true };
    }

    async getSummary(userId: string, type: 'daily' | 'weekly') {
        const now = new Date();
        const days = type === 'weekly' ? 7 : 1;
        const summary: { date: string; duration: number }[] = [];

        for (let i = 0; i < days; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const duration = await this.repository.getDailySummary(userId, date);
            summary.push({
                date: date.toISOString().split('T')[0],
                duration
            });
        }

        return summary;
    }
}
