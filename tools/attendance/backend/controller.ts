// Attendance Controller
import { AttendanceService } from './service';

export class AttendanceController {
    private service: AttendanceService;

    constructor(db: any) {
        this.service = new AttendanceService(db);
    }

    async clockIn(req: any) {
        const userId = req.headers['x-user-id'];
        const record = await this.service.clockIn(userId);
        return { success: true, data: record };
    }

    async clockOut(req: any) {
        const userId = req.headers['x-user-id'];
        const record = await this.service.clockOut(userId);
        return { success: true, data: record };
    }

    async getToday(req: any) {
        const userId = req.headers['x-user-id'];
        const record = await this.service.getTodayStatus(userId);
        return { success: true, data: record };
    }

    async getHistory(req: any) {
        const userId = req.headers['x-user-id'];
        const { from, to } = req.query || {};
        const records = await this.service.getHistory(userId, { from, to });
        return { success: true, data: records };
    }

    async getMonthlyReport(req: any) {
        const userId = req.headers['x-user-id'];
        const year = parseInt(req.query?.year) || new Date().getFullYear();
        const month = parseInt(req.query?.month) || new Date().getMonth() + 1;
        const report = await this.service.getMonthlyReport(userId, year, month);
        return { success: true, data: report };
    }

    async applyLeave(req: any) {
        const userId = req.headers['x-user-id'];
        const leave = await this.service.applyLeave(userId, req.body);
        return { success: true, data: leave };
    }

    async getLeaves(req: any) {
        const userId = req.headers['x-user-id'];
        const leaves = await this.service.getLeaves(userId);
        return { success: true, data: leaves };
    }
}
