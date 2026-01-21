export class PayrollController {
    constructor(private readonly db: any) { }

    async createEmployee(req: any) {
        const userId = req.headers['x-user-id'];
        const { name, email, designation, basicSalary, hra, allowances } = req.body;

        const employee = await this.db.employee.create({
            data: {
                userId,
                name,
                email,
                designation,
                joinDate: new Date(),
                basicSalary,
                hra,
                allowances
            }
        });

        return { success: true, data: employee };
    }

    async runPayroll(req: any) {
        const userId = req.headers['x-user-id'];
        const { month, year } = req.body;

        // Get all active employees
        const employees = await this.db.employee.findMany({
            where: { userId, status: 'ACTIVE' }
        });

        if (employees.length === 0) {
            throw new Error('No active employees found to run payroll');
        }

        // Create Payroll Run
        const run = await this.db.payrollRun.create({
            data: {
                userId,
                month,
                year,
                totalAmount: 0 // Will update later
            }
        });

        let runTotal = 0;

        // Generate Payslips
        for (const emp of employees) {
            const netPay = emp.basicSalary + emp.hra + emp.allowances; // Simple calc
            runTotal += netPay;

            await this.db.payslip.create({
                data: {
                    runId: run.id,
                    employeeId: emp.id,
                    basic: emp.basicSalary,
                    hra: emp.hra,
                    allowances: emp.allowances,
                    netPay
                }
            });
        }

        // Update run total
        const updatedRun = await this.db.payrollRun.update({
            where: { id: run.id },
            data: { totalAmount: runTotal, status: 'COMPLETED' },
            include: { payslips: true }
        });

        return { success: true, data: updatedRun };
    }
}
