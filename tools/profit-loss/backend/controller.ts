export class PLController {
    constructor(private readonly db: any) { }

    async addEntry(req: any) {
        const userId = req.headers['x-user-id'];
        const { date, description, amount, type, category } = req.body;

        const entry = await this.db.ledgerEntry.create({
            data: { userId, date: new Date(date), description, amount, type, category }
        });
        return { success: true, data: entry };
    }

    async generateReport(req: any) {
        const userId = req.headers['x-user-id'];
        const { startDate, endDate, name } = req.body;

        const start = new Date(startDate);
        const end = new Date(endDate);

        const entries = await this.db.ledgerEntry.findMany({
            where: {
                userId,
                date: { gte: start, lte: end }
            }
        });

        let income = 0;
        let expense = 0;

        entries.forEach((e: any) => {
            if (e.type === 'INCOME') income += e.amount;
            else expense += e.amount;
        });

        const report = await this.db.report.create({
            data: {
                userId,
                name: name || `P&L ${startDate} - ${endDate}`,
                startDate: start,
                endDate: end,
                totalIncome: income,
                totalExpense: expense,
                netProfit: income - expense
            }
        });

        return { success: true, data: report };
    }
}
