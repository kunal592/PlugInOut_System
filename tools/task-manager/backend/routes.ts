// Task Manager Routes
import { TaskController } from './controller';

export default {
    prefix: '/tasks',

    register(router: any, db: any) {
        const controller = new TaskController(db);

        router.get('/', (req: any) => controller.getTasks(req));
        router.get('/stats', (req: any) => controller.getStats(req));
        router.get('/:id', (req: any) => controller.getTask(req));
        router.post('/', (req: any) => controller.createTask(req));
        router.put('/:id', (req: any) => controller.updateTask(req));
        router.delete('/:id', (req: any) => controller.deleteTask(req));

        return router;
    }
};
