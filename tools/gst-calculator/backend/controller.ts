export class GstController {
    constructor(private readonly db: any) { }

    async calculate(req: any) {
        const userId = req.headers['x-user-id']; // Optional
        const { amount, rate, type } = req.body;

        const baseAmount = parseFloat(amount);
        const gstRate = parseFloat(rate);

        let taxAmount = 0;
        let totalAmount = 0;
        let netAmount = 0;

        if (type === 'EXCLUSIVE') {
            taxAmount = (baseAmount * gstRate) / 100;
            totalAmount = baseAmount + taxAmount;
            netAmount = baseAmount;
        } else {
            // Inclusive: Total = Base * (1 + rate/100)
            // Base = Total / (1 + rate/100)
            netAmount = baseAmount / (1 + gstRate / 100);
            taxAmount = baseAmount - netAmount;
            totalAmount = baseAmount;
        }

        // Save history (fire and forget, or await)
        if (userId) {
            await this.db.calculationHistory.create({
                data: {
                    userId,
                    amount: baseAmount,
                    gstRate,
                    type,
                    taxAmount,
                    totalAmount
                }
            });
        }

        return {
            success: true,
            data: {
                netAmount: parseFloat(netAmount.toFixed(2)),
                taxAmount: parseFloat(taxAmount.toFixed(2)),
                totalAmount: parseFloat(totalAmount.toFixed(2)),
                breakdown: {
                    cgst: parseFloat((taxAmount / 2).toFixed(2)),
                    sgst: parseFloat((taxAmount / 2).toFixed(2))
                }
            }
        };
    }

    async getHistory(req: any) {
        const userId = req.headers['x-user-id'];
        if (!userId) return { success: false, error: 'User required for history' };

        const history = await this.db.calculationHistory.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        return { success: true, data: history };
    }
}
