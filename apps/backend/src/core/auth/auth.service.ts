import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma';
import { EventPublisher } from '../events/event.publisher';
import { EventTypes } from '../events/event.types';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto';
import { JwtPayload, AuthTokens, AuthenticatedUser } from './interfaces';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly eventPublisher: EventPublisher,
    ) { }

    /**
     * Register a new user
     */
    async register(dto: RegisterDto): Promise<AuthTokens> {
        this.logger.log(`Registering new user: ${dto.email}`);

        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(dto.password, 12);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                email: dto.email.toLowerCase(),
                passwordHash,
                firstName: dto.firstName,
                lastName: dto.lastName,
            },
        });

        // Emit user created event
        await this.eventPublisher.publish({
            type: EventTypes.USER_CREATED,
            aggregateType: 'User',
            aggregateId: user.id,
            userId: user.id,
            payload: {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        });

        this.logger.log(`User registered successfully: ${user.id}`);

        // Generate and return tokens
        return this.generateTokens(user);
    }

    /**
     * Login with email and password
     */
    async login(dto: LoginDto): Promise<AuthTokens> {
        this.logger.debug(`Login attempt for: ${dto.email}`);

        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });

        if (!user || !user.passwordHash) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Account is disabled');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Update last login
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        // Emit login event
        await this.eventPublisher.publish({
            type: EventTypes.USER_LOGGED_IN,
            aggregateType: 'User',
            aggregateId: user.id,
            userId: user.id,
            payload: { email: user.email },
        });

        this.logger.log(`User logged in: ${user.id}`);

        return this.generateTokens(user);
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshToken(dto: RefreshTokenDto): Promise<AuthTokens> {
        const tokenRecord = await this.prisma.refreshToken.findUnique({
            where: { token: dto.refreshToken },
            include: { user: true },
        });

        if (!tokenRecord) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if (tokenRecord.revokedAt) {
            throw new UnauthorizedException('Refresh token has been revoked');
        }

        if (tokenRecord.expiresAt < new Date()) {
            throw new UnauthorizedException('Refresh token has expired');
        }

        if (!tokenRecord.user.isActive) {
            throw new UnauthorizedException('Account is disabled');
        }

        // Revoke old refresh token (token rotation)
        await this.prisma.refreshToken.update({
            where: { id: tokenRecord.id },
            data: { revokedAt: new Date() },
        });

        return this.generateTokens(tokenRecord.user);
    }

    /**
     * Logout - revoke refresh token
     */
    async logout(refreshToken: string): Promise<void> {
        await this.prisma.refreshToken.updateMany({
            where: { token: refreshToken },
            data: { revokedAt: new Date() },
        });

        this.logger.debug('User logged out, refresh token revoked');
    }

    /**
     * Revoke all refresh tokens for a user
     */
    async revokeAllTokens(userId: string): Promise<void> {
        await this.prisma.refreshToken.updateMany({
            where: { userId },
            data: { revokedAt: new Date() },
        });

        this.logger.log(`All refresh tokens revoked for user: ${userId}`);
    }

    /**
     * Validate user by ID (used by JWT strategy)
     */
    async validateUserById(userId: string): Promise<AuthenticatedUser | null> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
            },
        });

        if (!user || !user.isActive) {
            return null;
        }

        return user;
    }

    /**
     * Generate access and refresh tokens
     */
    private async generateTokens(
        user: { id: string; email: string; role: string },
    ): Promise<AuthTokens> {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = this.jwtService.sign(payload);

        // Generate refresh token
        const refreshToken = uuidv4();
        const refreshExpiresIn = this.configService.get<string>(
            'JWT_REFRESH_EXPIRATION',
            '7d',
        );
        const expiresAt = this.calculateExpiry(refreshExpiresIn);

        // Store refresh token
        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt,
            },
        });

        // Clean up expired tokens periodically
        await this.cleanupExpiredTokens(user.id);

        return {
            accessToken,
            refreshToken,
            expiresIn: this.getExpirySeconds(
                this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m'),
            ),
        };
    }

    /**
     * Calculate expiry date from duration string
     */
    private calculateExpiry(duration: string): Date {
        const seconds = this.getExpirySeconds(duration);
        return new Date(Date.now() + seconds * 1000);
    }

    /**
     * Convert duration string to seconds
     */
    private getExpirySeconds(duration: string): number {
        const match = duration.match(/^(\d+)([smhd])$/);
        if (!match) return 900; // Default 15 minutes

        const value = parseInt(match[1], 10);
        const unit = match[2];

        const multipliers: Record<string, number> = {
            s: 1,
            m: 60,
            h: 3600,
            d: 86400,
        };

        return value * (multipliers[unit] || 60);
    }

    /**
     * Clean up expired refresh tokens for a user
     */
    private async cleanupExpiredTokens(userId: string): Promise<void> {
        await this.prisma.refreshToken.deleteMany({
            where: {
                userId,
                OR: [{ expiresAt: { lt: new Date() } }, { revokedAt: { not: null } }],
            },
        });
    }
}
