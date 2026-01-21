import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    UseGuards,
    Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, LogoutDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthenticatedUser } from './interfaces';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * Register a new user
     */
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() dto: RegisterDto) {
        const tokens = await this.authService.register(dto);
        return {
            success: true,
            message: 'Registration successful',
            data: tokens,
        };
    }

    /**
     * Login with email and password
     */
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginDto) {
        const tokens = await this.authService.login(dto);
        return {
            success: true,
            message: 'Login successful',
            data: tokens,
        };
    }

    /**
     * Refresh access token
     */
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body() dto: RefreshTokenDto) {
        const tokens = await this.authService.refreshToken(dto);
        return {
            success: true,
            message: 'Token refreshed',
            data: tokens,
        };
    }

    /**
     * Logout - revoke refresh token
     */
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Body() dto: LogoutDto) {
        await this.authService.logout(dto.refreshToken);
        return {
            success: true,
            message: 'Logout successful',
        };
    }

    /**
     * Logout from all devices - revoke all refresh tokens
     */
    @Post('logout-all')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async logoutAll(@CurrentUser() user: AuthenticatedUser) {
        await this.authService.revokeAllTokens(user.id);
        return {
            success: true,
            message: 'Logged out from all devices',
        };
    }

    /**
     * Get current user profile
     */
    @Post('me')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async me(@CurrentUser() user: AuthenticatedUser) {
        return {
            success: true,
            data: user,
        };
    }
}
