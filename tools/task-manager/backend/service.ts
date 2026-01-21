// Task Manager Service - Business logic layer
import { TaskRepository } from './repository';

export class TaskService {
    private repository: TaskRepository;

    constructor(db: any) {
        this.repository = new TaskRepository(db);
    }

    async getTasks(userId: string, filters?: { status?: string; priority?: string }) {
        return this.repository.findAll(userId, filters);
    }

    async getTask(id: string, userId: string) {
        const task = await this.repository.findById(id, userId);
        if (!task) throw new Error('Task not found');
        return task;
    }

    async createTask(userId: string, data: {
        title: string;
        description?: string;
        priority?: string;
        dueDate?: string;
        tags?: string[];
    }) {
        if (!data.title?.trim()) {
            throw new Error('Title is required');
        }

        return this.repository.create({
            userId,
            title: data.title.trim(),
            description: data.description?.trim(),
            priority: data.priority || 'MEDIUM',
            dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
            tags: data.tags || []
        });
    }

    async updateTask(id: string, userId: string, data: {
        title?: string;
        description?: string;
        status?: string;
        priority?: string;
        dueDate?: string;
        tags?: string[];
    }) {
        const updateData: any = {};
        if (data.title) updateData.title = data.title.trim();
        if (data.description !== undefined) updateData.description = data.description;
        if (data.status) updateData.status = data.status;
        if (data.priority) updateData.priority = data.priority;
        if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
        if (data.tags) updateData.tags = data.tags;

        await this.repository.update(id, userId, updateData);
        return this.getTask(id, userId);
    }

    async deleteTask(id: string, userId: string) {
        await this.repository.delete(id, userId);
        return { success: true };
    }

    async getStats(userId: string) {
        return this.repository.getStats(userId);
    }
}
