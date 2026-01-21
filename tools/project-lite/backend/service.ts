// Project Lite Service
import { ProjectRepository } from './repository';

export class ProjectService {
    private repository: ProjectRepository;

    constructor(db: any) {
        this.repository = new ProjectRepository(db);
    }

    async getProjects(userId: string) {
        return this.repository.findAll(userId);
    }

    async getProject(id: string, userId: string) {
        const project = await this.repository.findById(id, userId);
        if (!project) throw new Error('Project not found');
        return project;
    }

    async createProject(userId: string, data: { name: string; description?: string; color?: string; startDate?: string; endDate?: string }) {
        if (!data.name?.trim()) throw new Error('Project name is required');
        return this.repository.create({
            userId,
            name: data.name.trim(),
            description: data.description,
            color: data.color,
            startDate: data.startDate ? new Date(data.startDate) : undefined,
            endDate: data.endDate ? new Date(data.endDate) : undefined
        });
    }

    async updateProject(id: string, userId: string, data: any) {
        await this.repository.update(id, userId, data);
        return this.getProject(id, userId);
    }

    async deleteProject(id: string, userId: string) {
        await this.repository.delete(id, userId);
        return { success: true };
    }

    // Milestones
    async createMilestone(projectId: string, userId: string, data: { title: string; description?: string; dueDate?: string }) {
        await this.getProject(projectId, userId); // Verify ownership
        return this.repository.createMilestone(projectId, {
            title: data.title,
            description: data.description,
            dueDate: data.dueDate ? new Date(data.dueDate) : undefined
        });
    }

    async updateMilestone(id: string, data: any) {
        return this.repository.updateMilestone(id, data);
    }

    async deleteMilestone(id: string) {
        return this.repository.deleteMilestone(id);
    }

    // Tasks
    async createTask(projectId: string, userId: string, data: { title: string; milestoneId?: string; priority?: string; assigneeId?: string; dueDate?: string }) {
        await this.getProject(projectId, userId);
        return this.repository.createTask(projectId, {
            title: data.title,
            milestoneId: data.milestoneId,
            priority: data.priority || 'MEDIUM',
            assigneeId: data.assigneeId,
            dueDate: data.dueDate ? new Date(data.dueDate) : undefined
        });
    }

    async updateTask(id: string, data: any) {
        return this.repository.updateTask(id, data);
    }

    async deleteTask(id: string) {
        return this.repository.deleteTask(id);
    }

    // Members
    async addMember(projectId: string, userId: string, data: { memberId: string; name: string; email?: string; role?: string }) {
        await this.getProject(projectId, userId);
        return this.repository.addMember(projectId, {
            userId: data.memberId,
            name: data.name,
            email: data.email,
            role: data.role
        });
    }

    async removeMember(projectId: string, userId: string, memberId: string) {
        await this.getProject(projectId, userId);
        return this.repository.removeMember(projectId, memberId);
    }
}
