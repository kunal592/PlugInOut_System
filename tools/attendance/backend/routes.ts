// Attendance Routes
import { AttendanceController } from './controller';

export default {
    prefix: '/attendance',

    register(router: any, db: any) {
        const controller = new AttendanceController(db);

        router.get('/today', (req: any) => controller.getToday(req));
        router.get('/history', (req: any) => controller.getHistory(req));
        router.get('/report', (req: any) => controller.getMonthlyReport(req));
        router.get('/leaves', (req: any) => controller.getLeaves(req));
        router.post('/clock-in', (req: any) => controller.clockIn(req));
        router.post('/clock-out', (req: any) => controller.clockOut(req));
        router.post('/leave', (req: any) => controller.applyLeave(req));

        return router;
    }
};
