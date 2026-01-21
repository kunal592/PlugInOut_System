// OKR Controller
import { OkrService } from './service';

export class OkrController {
    private service: OkrService;

    constructor(db: any) {
        this.service = new OkrService(db);
    }

    async getObjectives(req: any) {
        const userId = req.headers['x-user-id'];
        const { period } = req.query || {};
        const objectives = await this.service.getObjectives(userId, period);
        return { success: true, data: objectives };
    }

    async getObjective(req: any) {
        const userId = req.headers['x-user-id'];
        const objective = await this.service.getObjective(req.params.id, userId);
        return { success: true, data: objective };
    }

    async createObjective(req: any) {
        const userId = req.headers['x-user-id'];
        const objective = await this.service.createObjective(userId, req.body);
        return { success: true, data: objective };
    }

    async updateObjective(req: any) {
        const userId = req.headers['x-user-id'];
        const objective = await this.service.updateObjective(req.params.id, userId, req.body);
        return { success: true, data: objective };
    }

    async deleteObjective(req: any) {
        const userId = req.headers['x-user-id'];
        await this.service.deleteObjective(req.params.id, userId);
        return { success: true };
    }

    // Key Results
    async addKeyResult(req: any) {
        const userId = req.headers['x-user-id'];
        const kr = await this.service.addKeyResult(req.params.objectiveId, userId, req.body);
        return { success: true, data: kr };
    }

    async updateKeyResult(req: any) {
        const kr = await this.service.updateKeyResult(req.params.id, req.body);
        return { success: true, data: kr };
    }

    async deleteKeyResult(req: any) {
        await this.service.deleteKeyResult(req.params.id);
        return { success: true };
    }

    // Check-ins
    async addCheckIn(req: any) {
        const checkIn = await this.service.addCheckIn(req.params.keyResultId, req.body);
        return { success: true, data: checkIn };
    }

    async getCurrentPeriod(req: any) {
        const period = await this.service.getCurrentPeriod();
        return { success: true, data: { period } };
    }
}
