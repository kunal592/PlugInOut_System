// Time Tracker Controller
import { TimeService } from './service';

export class TimeController {
    private service: TimeService;

    constructor(db: any) {
        this.service = new TimeService(db);
    }

    async getEntries(req: any) {
        const userId = req.headers['x-user-id'];
        const { from, to } = req.query || {};
        const entries = await this.service.getEntries(userId, { from, to });
        return { success: true, data: entries };
    }

    async getRunning(req: any) {
        const userId = req.headers['x-user-id'];
        const entry = await this.service.getRunningTimer(userId);
        return { success: true, data: entry };
    }

    async startTimer(req: any) {
        const userId = req.headers['x-user-id'];
        const entry = await this.service.startTimer(userId, req.body);
        return { success: true, data: entry };
    }

    async stopTimer(req: any) {
        const userId = req.headers['x-user-id'];
        const { id } = req.params;
        const entry = await this.service.stopTimer(id, userId);
        return { success: true, data: entry };
    }

    async createManual(req: any) {
        const userId = req.headers['x-user-id'];
        const entry = await this.service.createManualEntry(userId, req.body);
        return { success: true, data: entry };
    }

    async deleteEntry(req: any) {
        const userId = req.headers['x-user-id'];
        const { id } = req.params;
        await this.service.deleteEntry(id, userId);
        return { success: true };
    }

    async getSummary(req: any) {
        const userId = req.headers['x-user-id'];
        const type = req.query?.type || 'daily';
        const summary = await this.service.getSummary(userId, type);
        return { success: true, data: summary };
    }
}
