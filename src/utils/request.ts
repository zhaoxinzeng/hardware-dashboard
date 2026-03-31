export interface ApiEnvelope<T> {
    data: T;
    pagination?: {
        page: number;
        pageSize: number;
        total: number;
    };
}

const normalizeBaseUrl = (raw?: string) => {
    if (!raw) {
        return '/api/v1';
    }

    return raw.endsWith('/') ? raw.slice(0, -1) : raw;
};

const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL as string | undefined);

const joinUrl = (path: string) => {
    if (path.startsWith('/')) {
        return `${API_BASE_URL}${path}`;
    }

    return `${API_BASE_URL}/${path}`;
};

const parseJson = async (response: Response) => {
    const text = await response.text();
    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text) as unknown;
    } catch {
        return null;
    }
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
    const response = await fetch(joinUrl(path), {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init?.headers ?? {})
        }
    });

    if (response.status === 204) {
        return undefined as T;
    }

    const payload = await parseJson(response);

    if (!response.ok) {
        const message =
            payload && typeof payload === 'object' && 'message' in payload
                ? String((payload as { message?: unknown }).message ?? '')
                : '';

        throw new Error(message || `Request failed with status ${response.status}`);
    }

    return payload as T;
};

export const apiRequest = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body: unknown) =>
        request<T>(path, {
            method: 'POST',
            body: JSON.stringify(body)
        }),
    put: <T>(path: string, body: unknown) =>
        request<T>(path, {
            method: 'PUT',
            body: JSON.stringify(body)
        }),
    delete: (path: string) =>
        request<void>(path, {
            method: 'DELETE'
        })
};
