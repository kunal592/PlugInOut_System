// OKR Repository
export class OkrRepository {
    constructor(private readonly db: any) { }

    async findObjectives(userId: string, period?: string) {
        const where: any = { userId };
        if (period) where.period = period;
        return this.db.tool_okr_Objective.findMany({
            where,
            include: { keyResults: { include: { checkIns: { orderBy: { createdAt: 'desc' }, take: 5 } } } },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findObjectiveById(id: string, userId: string) {
        return this.db.tool_okr_Objective.findFirst({
            where: { id, userId },
            include: { keyResults: { include: { checkIns: true } } }
        });
    }

    async createObjective(data: { userId: string; title: string; description?: string; period: string; startDate?: Date; endDate?: Date }) {
        return this.db.tool_okr_Objective.create({ data });
    }

    async updateObjective(id: string, userId: string, data: any) {
        return this.db.tool_okr_Objective.updateMany({ where: { id, userId }, data });
    }

    async deleteObjective(id: string, userId: string) {
        return this.db.tool_okr_Objective.deleteMany({ where: { id, userId } });
    }

    // Key Results
    async createKeyResult(objectiveId: string, data: { title: string; targetValue?: number; unit?: string }) {
        return this.db.tool_okr_KeyResult.create({ data: { objectiveId, ...data } });
    }

    async updateKeyResult(id: string, data: any) {
        return this.db.tool_okr_KeyResult.update({ where: { id }, data });
    }

    async deleteKeyResult(id: string) {
        return this.db.tool_okr_KeyResult.delete({ where: { id } });
    }

    // Check-ins
    async createCheckIn(keyResultId: string, data: { value: number; notes?: string }) {
        const checkIn = await this.db.tool_okr_CheckIn.create({ data: { keyResultId, ...data } });
        // Update key result current value
        await this.db.tool_okr_KeyResult.update({
            where: { id: keyResultId },
            data: { currentValue: data.value }
        });
        return checkIn;
    }

    async recalculateObjectiveProgress(objectiveId: string) {
        const objective = await this.db.tool_okr_Objective.findUnique({
            where: { id: objectiveId },
            include: { keyResults: true }
        });

        if (objective && objective.keyResults.length > 0) {
            const progress = objective.keyResults.reduce((sum: number, kr: any) => {
                const krProgress = Math.min(100, (kr.currentValue / kr.targetValue) * 100);
                return sum + krProgress;
            }, 0) / objective.keyResults.length;

            await this.db.tool_okr_Objective.update({
                where: { id: objectiveId },
                data: { progress: Math.round(progress * 10) / 10 }
            });
        }
    }
}
