// Task Manager Controller - HTTP handlers
import { TaskService } from './service';

export class TaskController {
    private service: TaskService;

    constructor(db: any) {
        this.service = new TaskService(db);
    }

    async getTasks(req: any) {
        const userId = req.headers['x-user-id'];
        const { status, priority } = req.query || {};
        const tasks = await this.service.getTasks(userId, { status, priority });
        return { success: true, data: tasks };
    }

    async getTask(req: any) {
        const userId = req.headers['x-user-id'];
        const { id } = req.params;
        const task = await this.service.getTask(id, userId);
        return { success: true, data: task };
    }

    async createTask(req: any) {
        const userId = req.headers['x-user-id'];
        const task = await this.service.createTask(userId, req.body);
        return { success: true, data: task };
    }

    async updateTask(req: any) {
        const userId = req.headers['x-user-id'];
        const { id } = req.params;
        const task = await this.service.updateTask(id, userId, req.body);
        return { success: true, data: task };
    }

    async deleteTask(req: any) {
        const userId = req.headers['x-user-id'];
        const { id } = req.params;
        await this.service.deleteTask(id, userId);
        return { success: true };
    }

    async getStats(req: any) {
        const userId = req.headers['x-user-id'];
        const stats = await this.service.getStats(userId);
        return { success: true, data: stats };
    }
}
