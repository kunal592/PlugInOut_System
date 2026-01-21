export class POController {
    constructor(private readonly db: any) { }

    async createVendor(req: any) {
        const userId = req.headers['x-user-id'];
        const { name, email, address } = req.body;
        const vendor = await this.db.vendor.create({
            data: { userId, name, email, address }
        });
        return { success: true, data: vendor };
    }

    async createPO(req: any) {
        const userId = req.headers['x-user-id'];
        const { vendorId, poNumber, orderDate, items } = req.body;

        let totalAmount = 0;
        const poItems = items.map((item: any) => {
            const lineTotal = item.quantity * item.unitPrice;
            totalAmount += lineTotal;
            return {
                itemName: item.itemName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: lineTotal
            };
        });

        const po = await this.db.purchaseOrder.create({
            data: {
                userId,
                vendorId,
                poNumber,
                orderDate: new Date(orderDate),
                totalAmount,
                items: { create: poItems }
            },
            include: { items: true }
        });

        return { success: true, data: po };
    }

    async getPOs(req: any) {
        const userId = req.headers['x-user-id'];
        const pos = await this.db.purchaseOrder.findMany({
            where: { userId },
            include: { vendor: true, items: true },
            orderBy: { orderDate: 'desc' }
        });
        return { success: true, data: pos };
    }
}
