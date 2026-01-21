// OKR Service
import { OkrRepository } from './repository';

export class OkrService {
    private repository: OkrRepository;

    constructor(db: any) {
        this.repository = new OkrRepository(db);
    }

    async getObjectives(userId: string, period?: string) {
        return this.repository.findObjectives(userId, period);
    }

    async getObjective(id: string, userId: string) {
        const obj = await this.repository.findObjectiveById(id, userId);
        if (!obj) throw new Error('Objective not found');
        return obj;
    }

    async createObjective(userId: string, data: { title: string; description?: string; period: string; startDate?: string; endDate?: string }) {
        if (!data.title?.trim()) throw new Error('Title is required');
        if (!data.period) throw new Error('Period is required');

        return this.repository.createObjective({
            userId,
            title: data.title.trim(),
            description: data.description,
            period: data.period,
            startDate: data.startDate ? new Date(data.startDate) : undefined,
            endDate: data.endDate ? new Date(data.endDate) : undefined
        });
    }

    async updateObjective(id: string, userId: string, data: any) {
        await this.repository.updateObjective(id, userId, data);
        return this.getObjective(id, userId);
    }

    async deleteObjective(id: string, userId: string) {
        await this.repository.deleteObjective(id, userId);
        return { success: true };
    }

    // Key Results
    async addKeyResult(objectiveId: string, userId: string, data: { title: string; targetValue?: number; unit?: string }) {
        await this.getObjective(objectiveId, userId);
        return this.repository.createKeyResult(objectiveId, data);
    }

    async updateKeyResult(id: string, data: any) {
        const kr = await this.repository.updateKeyResult(id, data);
        // Recalculate parent objective progress
        await this.repository.recalculateObjectiveProgress(kr.objectiveId);
        return kr;
    }

    async deleteKeyResult(id: string) {
        return this.repository.deleteKeyResult(id);
    }

    // Check-ins
    async addCheckIn(keyResultId: string, data: { value: number; notes?: string }) {
        const checkIn = await this.repository.createCheckIn(keyResultId, data);
        // Get key result to find objective and recalculate
        const kr = await this.repository.db?.tool_okr_KeyResult.findUnique({ where: { id: keyResultId } });
        if (kr) {
            await this.repository.recalculateObjectiveProgress(kr.objectiveId);
        }
        return checkIn;
    }

    async getCurrentPeriod() {
        const now = new Date();
        const quarter = Math.ceil((now.getMonth() + 1) / 3);
        return `Q${quarter}-${now.getFullYear()}`;
    }
}
