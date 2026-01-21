// Time Tracker Routes
import { TimeController } from './controller';

export default {
    prefix: '/time',

    register(router: any, db: any) {
        const controller = new TimeController(db);

        router.get('/', (req: any) => controller.getEntries(req));
        router.get('/running', (req: any) => controller.getRunning(req));
        router.get('/summary', (req: any) => controller.getSummary(req));
        router.post('/start', (req: any) => controller.startTimer(req));
        router.post('/stop/:id', (req: any) => controller.stopTimer(req));
        router.post('/manual', (req: any) => controller.createManual(req));
        router.delete('/:id', (req: any) => controller.deleteEntry(req));

        return router;
    }
};
