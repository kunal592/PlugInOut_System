import { InvoiceController } from './controller';
import { PrismaClient } from '@prisma/client-tool-invoice';

// Initialize tool-specific DB client
const prisma = new PrismaClient();
const controller = new InvoiceController(prisma);

export default {
    routes: [
        {
            method: 'POST',
            path: '/',
            handler: controller.createInvoice.bind(controller),
        },
        {
            method: 'GET',
            path: '/',
            handler: controller.getInvoices.bind(controller),
        },
        {
            method: 'GET',
            path: '/:id',
            handler: controller.getInvoice.bind(controller),
        }
    ]
};
