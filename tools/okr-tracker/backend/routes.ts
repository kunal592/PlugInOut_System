// OKR Routes
import { OkrController } from './controller';

export default {
    prefix: '/okr',

    register(router: any, db: any) {
        const controller = new OkrController(db);

        // Objectives
        router.get('/', (req: any) => controller.getObjectives(req));
        router.get('/period', (req: any) => controller.getCurrentPeriod(req));
        router.get('/:id', (req: any) => controller.getObjective(req));
        router.post('/', (req: any) => controller.createObjective(req));
        router.put('/:id', (req: any) => controller.updateObjective(req));
        router.delete('/:id', (req: any) => controller.deleteObjective(req));

        // Key Results
        router.post('/:objectiveId/key-results', (req: any) => controller.addKeyResult(req));
        router.put('/key-results/:id', (req: any) => controller.updateKeyResult(req));
        router.delete('/key-results/:id', (req: any) => controller.deleteKeyResult(req));

        // Check-ins
        router.post('/key-results/:keyResultId/check-in', (req: any) => controller.addCheckIn(req));

        return router;
    }
};
