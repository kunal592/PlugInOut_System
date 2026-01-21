export class CashFlowController {
    constructor(private readonly db: any) { }

    async addTransaction(req: any) {
        const userId = req.headers['x-user-id'];
        const { date, amount, description, isProjection } = req.body;

        const tx = await this.db.transaction.create({
            data: {
                userId,
                date: new Date(date),
                amount,
                description,
                isProjection: isProjection || false
            }
        });
        return { success: true, data: tx };
    }

    async getFlow(req: any) {
        const userId = req.headers['x-user-id'];
        const { startDate, endDate } = req.query; // Assuming parsed query

        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
        const end = endDate ? new Date(endDate) : new Date();

        const txs = await this.db.transaction.findMany({
            where: {
                userId,
                date: { gte: start, lte: end }
            },
            orderBy: { date: 'asc' }
        });

        // Calculate running balance
        let balance = 0;
        const flow = txs.map((tx: any) => {
            balance += tx.amount;
            return { ...tx, balance };
        });

        return { success: true, data: flow };
    }
}
