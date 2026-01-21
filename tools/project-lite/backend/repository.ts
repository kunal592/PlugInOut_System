// Project Lite Repository
export class ProjectRepository {
    constructor(private readonly db: any) { }

    async findAll(userId: string) {
        return this.db.tool_project_Project.findMany({
            where: { userId },
            include: { milestones: true, tasks: true, members: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findById(id: string, userId: string) {
        return this.db.tool_project_Project.findFirst({
            where: { id, userId },
            include: { milestones: true, tasks: true, members: true }
        });
    }

    async create(data: { userId: string; name: string; description?: string; color?: string; startDate?: Date; endDate?: Date }) {
        return this.db.tool_project_Project.create({ data });
    }

    async update(id: string, userId: string, data: any) {
        return this.db.tool_project_Project.updateMany({ where: { id, userId }, data });
    }

    async delete(id: string, userId: string) {
        return this.db.tool_project_Project.deleteMany({ where: { id, userId } });
    }

    // Milestones
    async createMilestone(projectId: string, data: { title: string; description?: string; dueDate?: Date }) {
        return this.db.tool_project_Milestone.create({ data: { projectId, ...data } });
    }

    async updateMilestone(id: string, data: any) {
        return this.db.tool_project_Milestone.update({ where: { id }, data });
    }

    async deleteMilestone(id: string) {
        return this.db.tool_project_Milestone.delete({ where: { id } });
    }

    // Tasks
    async createTask(projectId: string, data: any) {
        return this.db.tool_project_Task.create({ data: { projectId, ...data } });
    }

    async updateTask(id: string, data: any) {
        return this.db.tool_project_Task.update({ where: { id }, data });
    }

    async deleteTask(id: string) {
        return this.db.tool_project_Task.delete({ where: { id } });
    }

    async getTasksByProject(projectId: string) {
        return this.db.tool_project_Task.findMany({
            where: { projectId },
            orderBy: [{ status: 'asc' }, { priority: 'desc' }]
        });
    }

    // Members
    async addMember(projectId: string, data: { userId: string; name: string; email?: string; role?: string }) {
        return this.db.tool_project_Member.create({ data: { projectId, ...data } });
    }

    async removeMember(projectId: string, userId: string) {
        return this.db.tool_project_Member.deleteMany({ where: { projectId, userId } });
    }
}
