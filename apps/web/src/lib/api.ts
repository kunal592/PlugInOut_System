const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ApiError {
    message: string;
    statusCode: number;
}

async function fetcher<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw {
            message: data.message || 'An error occurred',
            statusCode: response.status,
        } as ApiError;
    }

    return data.data || data; // Handle { success: true, data: ... } wrapper
}

export const api = {
    get: <T>(endpoint: string) => fetcher<T>(endpoint, { method: 'GET' }),
    post: <T>(endpoint: string, body: unknown) =>
        fetcher<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: <T>(endpoint: string, body: unknown) =>
        fetcher<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    patch: <T>(endpoint: string, body: unknown) =>
        fetcher<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: <T>(endpoint: string) => fetcher<T>(endpoint, { method: 'DELETE' }),
};
