export class ExpenseController {
    constructor(private readonly db: any) { }

    async createExpense(req: any) {
        const userId = req.headers['x-user-id'];
        const { amount, description, date, categoryId, newCategoryName } = req.body;

        let finalCategoryId = categoryId;

        // Handle create-on-the-fly category
        if (newCategoryName && !categoryId) {
            const category = await this.db.category.create({
                data: {
                    userId,
                    name: newCategoryName
                }
            });
            finalCategoryId = category.id;
        }

        const expense = await this.db.expense.create({
            data: {
                userId,
                amount,
                description,
                date: new Date(date),
                categoryId: finalCategoryId
            },
            include: { category: true }
        });

        return { success: true, data: expense };
    }

    async getExpenses(req: any) {
        const userId = req.headers['x-user-id'];
        const expenses = await this.db.expense.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            include: { category: true }
        });
        return { success: true, data: expenses };
    }

    async getSummary(req: any) {
        const userId = req.headers['x-user-id'];
        // Simple aggregation
        const expenses = await this.db.expense.findMany({
            where: { userId }
        });

        const total = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);

        return { success: true, data: { total, count: expenses.length } };
    }
}
