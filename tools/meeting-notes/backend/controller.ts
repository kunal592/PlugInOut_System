// Meeting Notes Controller
import { MeetingService } from './service';

export class MeetingController {
    private service: MeetingService;

    constructor(db: any) {
        this.service = new MeetingService(db);
    }

    async getMeetings(req: any) {
        const userId = req.headers['x-user-id'];
        const { search, tag, from, to } = req.query || {};
        const meetings = await this.service.getMeetings(userId, { search, tag, from, to });
        return { success: true, data: meetings };
    }

    async getMeeting(req: any) {
        const userId = req.headers['x-user-id'];
        const meeting = await this.service.getMeeting(req.params.id, userId);
        return { success: true, data: meeting };
    }

    async createMeeting(req: any) {
        const userId = req.headers['x-user-id'];
        const meeting = await this.service.createMeeting(userId, req.body);
        return { success: true, data: meeting };
    }

    async updateMeeting(req: any) {
        const userId = req.headers['x-user-id'];
        const meeting = await this.service.updateMeeting(req.params.id, userId, req.body);
        return { success: true, data: meeting };
    }

    async deleteMeeting(req: any) {
        const userId = req.headers['x-user-id'];
        await this.service.deleteMeeting(req.params.id, userId);
        return { success: true };
    }

    async getTags(req: any) {
        const userId = req.headers['x-user-id'];
        const tags = await this.service.getTags(userId);
        return { success: true, data: tags };
    }

    async getRecent(req: any) {
        const userId = req.headers['x-user-id'];
        const limit = parseInt(req.query?.limit) || 5;
        const meetings = await this.service.getRecentMeetings(userId, limit);
        return { success: true, data: meetings };
    }
}
