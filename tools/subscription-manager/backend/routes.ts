import { SubManagerController } from './controller';
import { PrismaClient } from '@prisma/client-tool-submanager';

const prisma = new PrismaClient();
const controller = new SubManagerController(prisma);

export default {
    routes: [
        { method: 'POST', path: '/customers', handler: controller.createCustomer.bind(controller) },
        { method: 'POST', path: '/plans', handler: controller.createPlan.bind(controller) },
        { method: 'POST', path: '/assign', handler: controller.assignSubscription.bind(controller) },
    ]
};
