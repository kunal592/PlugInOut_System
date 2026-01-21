export interface JwtPayload {
    sub: string;      // User ID
    email: string;
    role: string;
    iat?: number;     // Issued at
    exp?: number;     // Expiration
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;  // Access token expiry in seconds
}

export interface AuthenticatedUser {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    isActive: boolean;
}
