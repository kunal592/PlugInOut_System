export class InvoiceController {
    constructor(private readonly db: any) { }

    async createInvoice(req: any) {
        const userId = req.headers['x-user-id'];
        const { clientName, clientEmail, items, dueDate } = req.body;

        // Calculate totals
        let totalAmount = 0;
        const invoiceItems = items.map((item: any) => {
            const lineTotal = item.quantity * item.unitPrice;
            totalAmount += lineTotal;
            return {
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: lineTotal,
            };
        });

        const invoice = await this.db.invoice.create({
            data: {
                userId,
                clientName,
                clientEmail,
                amount: totalAmount,
                dueDate: new Date(dueDate),
                items: {
                    create: invoiceItems
                }
            },
            include: { items: true }
        });

        return { success: true, data: invoice };
    }

    async getInvoices(req: any) {
        const userId = req.headers['x-user-id'];
        const invoices = await this.db.invoice.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { items: true }
        });
        return { success: true, data: invoices };
    }

    async getInvoice(req: any) {
        const userId = req.headers['x-user-id'];
        const { id } = req.params;

        const invoice = await this.db.invoice.findFirst({
            where: { id, userId },
            include: { items: true }
        });

        if (!invoice) throw new Error('Invoice not found');
        return { success: true, data: invoice };
    }
}
