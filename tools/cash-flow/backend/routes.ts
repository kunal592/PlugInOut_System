import { CashFlowController } from './controller';
import { PrismaClient } from '@prisma/client-tool-cashflow';

const prisma = new PrismaClient();
const controller = new CashFlowController(prisma);

export default {
    routes: [
        { method: 'POST', path: '/transaction', handler: controller.addTransaction.bind(controller) },
        { method: 'GET', path: '/flow', handler: controller.getFlow.bind(controller) },
    ]
};
