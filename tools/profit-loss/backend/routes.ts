import { PLController } from './controller';
import { PrismaClient } from '@prisma/client-tool-pl';

const prisma = new PrismaClient();
const controller = new PLController(prisma);

export default {
    routes: [
        { method: 'POST', path: '/entry', handler: controller.addEntry.bind(controller) },
        { method: 'POST', path: '/report', handler: controller.generateReport.bind(controller) },
    ]
};
