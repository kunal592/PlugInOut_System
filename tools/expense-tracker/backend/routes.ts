import { ExpenseController } from './controller';
import { PrismaClient } from '@prisma/client-tool-expense';

const prisma = new PrismaClient();
const controller = new ExpenseController(prisma);

export default {
    routes: [
        {
            method: 'POST',
            path: '/',
            handler: controller.createExpense.bind(controller),
        },
        {
            method: 'GET',
            path: '/',
            handler: controller.getExpenses.bind(controller),
        },
        {
            method: 'GET',
            path: '/summary',
            handler: controller.getSummary.bind(controller),
        }
    ]
};
