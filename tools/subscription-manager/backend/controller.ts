export class SubManagerController {
    constructor(private readonly db: any) { }

    async createCustomer(req: any) {
        const userId = req.headers['x-user-id'];
        const { name, email, phone } = req.body;

        const customer = await this.db.customer.create({
            data: { userId, name, email, phone }
        });
        return { success: true, data: customer };
    }

    async createPlan(req: any) {
        const userId = req.headers['x-user-id'];
        const { name, price, interval } = req.body;

        const plan = await this.db.plan.create({
            data: { userId, name, price, interval }
        });
        return { success: true, data: plan };
    }

    async assignSubscription(req: any) {
        const { customerId, planId, startDate } = req.body;

        // Calculate renewal based on plan
        const plan = await this.db.plan.findUnique({ where: { id: planId } });
        if (!plan) throw new Error('Plan not found');

        const start = new Date(startDate);
        const renewal = new Date(start);

        if (plan.interval === 'MONTHLY') renewal.setMonth(renewal.getMonth() + 1);
        else if (plan.interval === 'YEARLY') renewal.setFullYear(renewal.getFullYear() + 1);

        const sub = await this.db.customerSubscription.create({
            data: {
                customerId,
                planId,
                startDate: start,
                renewalDate: renewal,
                status: 'ACTIVE'
            }
        });

        return { success: true, data: sub };
    }
}
