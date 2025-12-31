/**
 * 统一请求工具
 * 封装 fetch API，提供统一的错误处理、加载状态、超时控制
 */

export interface RequestConfig {
    timeout?: number;
    headers?: Record<string, string>;
}

export interface ApiResponse<T> {
    data: T;
    code: number;
    message: string;
}

export class RequestError extends Error {
    code: number;

    constructor(message: string, code: number = 500) {
        super(message);
        this.name = 'RequestError';
        this.code = code;
    }
}

const DEFAULT_TIMEOUT = 10000; // 10秒

/**
 * 创建带超时的 fetch 请求
 */
async function fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number
): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        return response;
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * 统一请求方法
 */
async function request<T>(
    url: string,
    options: RequestInit = {},
    config: RequestConfig = {}
): Promise<T> {
    const { timeout = DEFAULT_TIMEOUT, headers: customHeaders = {} } = config;

    const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    const mergedOptions: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...customHeaders,
            ...(options.headers as Record<string, string>),
        },
    };

    try {
        const response = await fetchWithTimeout(url, mergedOptions, timeout);

        if (!response.ok) {
            throw new RequestError(
                `请求失败: ${response.statusText}`,
                response.status
            );
        }

        const result = await response.json();

        // 如果后端返回标准格式 { code, data, message }
        if (result && typeof result.code === 'number') {
            if (result.code !== 0 && result.code !== 200) {
                throw new RequestError(result.message || '服务器错误', result.code);
            }
            return result.data as T;
        }

        // 直接返回数据
        return result as T;
    } catch (error) {
        if (error instanceof RequestError) {
            throw error;
        }
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new RequestError('请求超时，请稍后重试', 408);
            }
            throw new RequestError(error.message, 500);
        }
        throw new RequestError('未知错误', 500);
    }
}

/**
 * GET 请求
 */
export async function get<T>(url: string, config?: RequestConfig): Promise<T> {
    return request<T>(url, { method: 'GET' }, config);
}

/**
 * POST 请求
 */
export async function post<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig
): Promise<T> {
    return request<T>(
        url,
        {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        },
        config
    );
}

/**
 * PUT 请求
 */
export async function put<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig
): Promise<T> {
    return request<T>(
        url,
        {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        },
        config
    );
}

/**
 * DELETE 请求
 */
export async function del<T>(url: string, config?: RequestConfig): Promise<T> {
    return request<T>(url, { method: 'DELETE' }, config);
}

/**
 * Mock 请求（用于开发阶段模拟 API）
 */
export async function mockRequest<T>(
    data: T,
    delay: number = 500
): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, delay));
    return data;
}

export default {
    get,
    post,
    put,
    del,
    mockRequest,
};
