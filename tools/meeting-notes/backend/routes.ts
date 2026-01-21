// Meeting Notes Routes
import { MeetingController } from './controller';

export default {
    prefix: '/meetings',

    register(router: any, db: any) {
        const controller = new MeetingController(db);

        router.get('/', (req: any) => controller.getMeetings(req));
        router.get('/tags', (req: any) => controller.getTags(req));
        router.get('/recent', (req: any) => controller.getRecent(req));
        router.get('/:id', (req: any) => controller.getMeeting(req));
        router.post('/', (req: any) => controller.createMeeting(req));
        router.put('/:id', (req: any) => controller.updateMeeting(req));
        router.delete('/:id', (req: any) => controller.deleteMeeting(req));

        return router;
    }
};
