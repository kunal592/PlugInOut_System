// Project Lite Routes
import { ProjectController } from './controller';

export default {
    prefix: '/projects',

    register(router: any, db: any) {
        const controller = new ProjectController(db);

        // Projects
        router.get('/', (req: any) => controller.getProjects(req));
        router.get('/:id', (req: any) => controller.getProject(req));
        router.post('/', (req: any) => controller.createProject(req));
        router.put('/:id', (req: any) => controller.updateProject(req));
        router.delete('/:id', (req: any) => controller.deleteProject(req));

        // Milestones
        router.post('/:projectId/milestones', (req: any) => controller.createMilestone(req));
        router.put('/milestones/:id', (req: any) => controller.updateMilestone(req));
        router.delete('/milestones/:id', (req: any) => controller.deleteMilestone(req));

        // Tasks
        router.post('/:projectId/tasks', (req: any) => controller.createTask(req));
        router.put('/tasks/:id', (req: any) => controller.updateTask(req));
        router.delete('/tasks/:id', (req: any) => controller.deleteTask(req));

        // Members
        router.post('/:projectId/members', (req: any) => controller.addMember(req));
        router.delete('/:projectId/members/:memberId', (req: any) => controller.removeMember(req));

        return router;
    }
};
