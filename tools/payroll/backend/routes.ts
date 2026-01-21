import { PayrollController } from './controller';
import { PrismaClient } from '@prisma/client-tool-payroll';

const prisma = new PrismaClient();
const controller = new PayrollController(prisma);

export default {
    routes: [
        {
            method: 'POST',
            path: '/employees',
            handler: controller.createEmployee.bind(controller),
        },
        {
            method: 'POST',
            path: '/run',
            handler: controller.runPayroll.bind(controller),
        }
    ]
};
