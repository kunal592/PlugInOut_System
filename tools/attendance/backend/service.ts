// Attendance Service
import { AttendanceRepository } from './repository';

export class AttendanceService {
    private repository: AttendanceRepository;

    constructor(db: any) {
        this.repository = new AttendanceRepository(db);
    }

    async clockIn(userId: string) {
        const now = new Date();
        const today = await this.repository.findByDate(userId, now);

        if (today?.clockIn) {
            throw new Error('Already clocked in today');
        }

        const expectedStart = new Date(now);
        expectedStart.setHours(9, 0, 0, 0);
        const status = now > expectedStart ? 'LATE' : 'PRESENT';

        return this.repository.upsert(userId, now, {
            clockIn: now,
            status
        });
    }

    async clockOut(userId: string) {
        const now = new Date();
        const today = await this.repository.findByDate(userId, now);

        if (!today?.clockIn) {
            throw new Error('Please clock in first');
        }
        if (today.clockOut) {
            throw new Error('Already clocked out today');
        }

        const totalHours = (now.getTime() - today.clockIn.getTime()) / (1000 * 60 * 60);

        return this.repository.upsert(userId, now, {
            clockOut: now,
            totalHours: Math.round(totalHours * 100) / 100,
            status: totalHours < 4 ? 'HALF_DAY' : today.status
        });
    }

    async getTodayStatus(userId: string) {
        return this.repository.findByDate(userId, new Date());
    }

    async getHistory(userId: string, options?: { from?: string; to?: string }) {
        const from = options?.from ? new Date(options.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const to = options?.to ? new Date(options.to) : new Date();
        return this.repository.findByRange(userId, from, to);
    }

    async getMonthlyReport(userId: string, year: number, month: number) {
        const records = await this.repository.getMonthlyReport(userId, year, month);

        const summary = {
            present: 0,
            absent: 0,
            late: 0,
            halfDay: 0,
            leave: 0,
            totalHours: 0
        };

        records.forEach((r: any) => {
            if (r.status === 'PRESENT') summary.present++;
            else if (r.status === 'ABSENT') summary.absent++;
            else if (r.status === 'LATE') summary.late++;
            else if (r.status === 'HALF_DAY') summary.halfDay++;
            else if (r.status === 'LEAVE') summary.leave++;
            summary.totalHours += r.totalHours || 0;
        });

        return { records, summary };
    }

    async applyLeave(userId: string, data: { startDate: string; endDate: string; type: string; reason?: string }) {
        return this.repository.createLeave({
            userId,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            type: data.type,
            reason: data.reason
        });
    }

    async getLeaves(userId: string) {
        return this.repository.getLeaves(userId);
    }
}
