// Project Lite Controller
import { ProjectService } from './service';

export class ProjectController {
    private service: ProjectService;

    constructor(db: any) {
        this.service = new ProjectService(db);
    }

    async getProjects(req: any) {
        const userId = req.headers['x-user-id'];
        const projects = await this.service.getProjects(userId);
        return { success: true, data: projects };
    }

    async getProject(req: any) {
        const userId = req.headers['x-user-id'];
        const project = await this.service.getProject(req.params.id, userId);
        return { success: true, data: project };
    }

    async createProject(req: any) {
        const userId = req.headers['x-user-id'];
        const project = await this.service.createProject(userId, req.body);
        return { success: true, data: project };
    }

    async updateProject(req: any) {
        const userId = req.headers['x-user-id'];
        const project = await this.service.updateProject(req.params.id, userId, req.body);
        return { success: true, data: project };
    }

    async deleteProject(req: any) {
        const userId = req.headers['x-user-id'];
        await this.service.deleteProject(req.params.id, userId);
        return { success: true };
    }

    // Milestones
    async createMilestone(req: any) {
        const userId = req.headers['x-user-id'];
        const milestone = await this.service.createMilestone(req.params.projectId, userId, req.body);
        return { success: true, data: milestone };
    }

    async updateMilestone(req: any) {
        const milestone = await this.service.updateMilestone(req.params.id, req.body);
        return { success: true, data: milestone };
    }

    async deleteMilestone(req: any) {
        await this.service.deleteMilestone(req.params.id);
        return { success: true };
    }

    // Tasks
    async createTask(req: any) {
        const userId = req.headers['x-user-id'];
        const task = await this.service.createTask(req.params.projectId, userId, req.body);
        return { success: true, data: task };
    }

    async updateTask(req: any) {
        const task = await this.service.updateTask(req.params.id, req.body);
        return { success: true, data: task };
    }

    async deleteTask(req: any) {
        await this.service.deleteTask(req.params.id);
        return { success: true };
    }

    // Members
    async addMember(req: any) {
        const userId = req.headers['x-user-id'];
        const member = await this.service.addMember(req.params.projectId, userId, req.body);
        return { success: true, data: member };
    }

    async removeMember(req: any) {
        const userId = req.headers['x-user-id'];
        await this.service.removeMember(req.params.projectId, userId, req.params.memberId);
        return { success: true };
    }
}
