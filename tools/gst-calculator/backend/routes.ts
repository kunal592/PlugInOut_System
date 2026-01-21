import { GstController } from './controller';
import { PrismaClient } from '@prisma/client-tool-gst';

const prisma = new PrismaClient();
const controller = new GstController(prisma);

export default {
    routes: [
        {
            method: 'POST',
            path: '/calculate',
            handler: controller.calculate.bind(controller),
        },
        {
            method: 'GET',
            path: '/history',
            handler: controller.getHistory.bind(controller),
        }
    ]
};
