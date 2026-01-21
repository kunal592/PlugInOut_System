/**
 * Shared types for frontend-backend communication
 * These types should be kept in sync with the frontend
 */

// User types
export interface User {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
    isActive: boolean;
}

// Auth types
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

// Tool types
export interface Tool {
    slug: string;
    name: string;
    description?: string;
    version: string;
    price: number;
    pricingType: 'FREE' | 'ONE_TIME' | 'SUBSCRIPTION';
    icon?: string;
    category?: string;
    routes: string;
    enabled: boolean;
}

export interface UserTool {
    id: string;
    status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'SUSPENDED';
    expiresAt: string | null;
    tool: {
        slug: string;
        name: string;
        description?: string;
        icon?: string;
        routes: string;
        category?: string;
        enabled: boolean;
    };
}

// API Response types
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Sidebar item for frontend
export interface SidebarItem {
    slug: string;
    name: string;
    icon?: string;
    routes: string;
    category?: string;
}
