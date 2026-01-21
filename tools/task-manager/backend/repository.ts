// Task Manager Repository - Data access layer
export class TaskRepository {
    constructor(private readonly db: any) { }

    async findAll(userId: string, filters?: { status?: string; priority?: string }) {
        const where: any = { userId };
        if (filters?.status) where.status = filters.status;
        if (filters?.priority) where.priority = filters.priority;

        return this.db.tool_task_Task.findMany({
            where,
            orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }, { createdAt: 'desc' }]
        });
    }

    async findById(id: string, userId: string) {
        return this.db.tool_task_Task.findFirst({
            where: { id, userId }
        });
    }

    async create(data: {
        userId: string;
        title: string;
        description?: string;
        status?: string;
        priority?: string;
        dueDate?: Date;
        tags?: string[];
    }) {
        return this.db.tool_task_Task.create({ data });
    }

    async update(id: string, userId: string, data: Partial<{
        title: string;
        description: string;
        status: string;
        priority: string;
        dueDate: Date;
        tags: string[];
    }>) {
        return this.db.tool_task_Task.updateMany({
            where: { id, userId },
            data
        });
    }

    async delete(id: string, userId: string) {
        return this.db.tool_task_Task.deleteMany({
            where: { id, userId }
        });
    }

    async getStats(userId: string) {
        const tasks = await this.db.tool_task_Task.findMany({ where: { userId } });
        return {
            total: tasks.length,
            todo: tasks.filter((t: any) => t.status === 'TODO').length,
            inProgress: tasks.filter((t: any) => t.status === 'IN_PROGRESS').length,
            done: tasks.filter((t: any) => t.status === 'DONE').length,
            overdue: tasks.filter((t: any) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE').length
        };
    }
}
