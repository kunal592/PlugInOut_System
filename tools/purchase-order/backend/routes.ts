import { POController } from './controller';
import { PrismaClient } from '@prisma/client-tool-po';

const prisma = new PrismaClient();
const controller = new POController(prisma);

export default {
    routes: [
        { method: 'POST', path: '/vendors', handler: controller.createVendor.bind(controller) },
        { method: 'POST', path: '/', handler: controller.createPO.bind(controller) },
        { method: 'GET', path: '/', handler: controller.getPOs.bind(controller) },
    ]
};
