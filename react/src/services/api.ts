const API_URL = import.meta.env.VITE_API_URL || '/api';

interface FetchResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Headers;
}

const handleResponse = async (response: Response) => {
    const contentType = response.headers.get('content-type');
    const data = contentType?.includes('application/json')
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        const error: any = new Error(response.statusText);
        error.response = {
            data,
            status: response.status,
            statusText: response.statusText,
        };
        throw error;
    }

    return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
    };
};

const request = async <T>(url: string, options: RequestInit = {}): Promise<FetchResponse<T>> => {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    if (token) {
        (headers as any)['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        ...options,
        headers,
    };

    const response = await fetch(`${API_URL}${url}`, config);
    return handleResponse(response);
};

const api = {
    get: <T = any>(url: string, config?: RequestInit) =>
        request<T>(url, { ...config, method: 'GET' }),

    post: <T = any>(url: string, data?: any, config?: RequestInit) =>
        request<T>(url, { ...config, method: 'POST', body: JSON.stringify(data) }),

    put: <T = any>(url: string, data?: any, config?: RequestInit) =>
        request<T>(url, { ...config, method: 'PUT', body: JSON.stringify(data) }),

    patch: <T = any>(url: string, data?: any, config?: RequestInit) =>
        request<T>(url, { ...config, method: 'PATCH', body: JSON.stringify(data) }),

    delete: <T = any>(url: string, config?: RequestInit) =>
        request<T>(url, { ...config, method: 'DELETE' }),
};

export default api;
