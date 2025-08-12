import { fetch } from './fetch-wrapper.js';
import type { ErrorResponse } from './types/index.js';

type ParamValue = string | number | boolean | string[] | null | undefined;

export interface RequestOptions<TData = unknown> {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  params?: Record<string, ParamValue>;
  data?: TData;
  headers?: Record<string, string>;
}

export class SaturationError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'SaturationError';
  }
}

export class HTTPClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(apiKey: string, baseURL = 'https://api.saturation.io/api/v1') {
    this.baseURL = baseURL.replace(/\/$/, ''); // Remove trailing slash
    this.defaultHeaders = {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': '@saturation/js/1.0.0',
    };
  }

  private buildURL(path: string, params?: Record<string, ParamValue>): string {
    const url = new URL(`${this.baseURL}${path}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (Array.isArray(value)) {
          value.forEach((item) => {
            url.searchParams.append(`${key}[]`, String(item));
          });
        } else {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async handleResponse<T>(response: globalThis.Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      let errorBody: ErrorResponse | string;

      try {
        errorBody = isJson ? ((await response.json()) as ErrorResponse) : await response.text();
      } catch {
        errorBody = 'An error occurred while processing the response';
      }

      const errorMessage = typeof errorBody === 'object' ? errorBody.error : errorBody;
      const errorDetails = typeof errorBody === 'object' ? errorBody.details : undefined;

      throw new SaturationError(
        errorMessage || `HTTP ${response.status} ${response.statusText}`,
        response.status,
        errorDetails,
      );
    }

    if (response.status === 204) {
      return {} as T;
    }

    if (!isJson) {
      const text = await response.text();
      return text as unknown as T;
    }

    return response.json() as Promise<T>;
  }

  async request<T, TData = unknown>(options: RequestOptions<TData>): Promise<T> {
    const { method, path, params, data, headers = {} } = options;

    const url = this.buildURL(path, params);
    const requestHeaders = { ...this.defaultHeaders, ...headers };

    let body: string | FormData | undefined;
    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      if (data instanceof FormData) {
        body = data;
        // Remove Content-Type header for FormData to let browser set it with boundary
        delete requestHeaders['Content-Type'];
      } else if (typeof data === 'string') {
        body = data;
      } else {
        body = JSON.stringify(data);
      }
    }

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body,
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof SaturationError) {
        throw error;
      }

      throw new SaturationError(
        error instanceof Error ? error.message : 'Network error occurred',
        0,
      );
    }
  }

  get<T>(path: string, params?: Record<string, ParamValue>): Promise<T> {
    return this.request<T>({ method: 'GET', path, params });
  }

  post<T, TData = unknown>(
    path: string,
    data?: TData,
    params?: Record<string, ParamValue>,
  ): Promise<T> {
    return this.request<T, TData>({ method: 'POST', path, data, params });
  }

  put<T, TData = unknown>(
    path: string,
    data?: TData,
    params?: Record<string, ParamValue>,
  ): Promise<T> {
    return this.request<T, TData>({ method: 'PUT', path, data, params });
  }

  patch<T, TData = unknown>(
    path: string,
    data?: TData,
    params?: Record<string, ParamValue>,
  ): Promise<T> {
    return this.request<T, TData>({ method: 'PATCH', path, data, params });
  }

  delete<T>(path: string, params?: Record<string, ParamValue>): Promise<T> {
    return this.request<T>({ method: 'DELETE', path, params });
  }
}
