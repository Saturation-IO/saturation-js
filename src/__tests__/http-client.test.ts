import { HTTPClient, SaturationError } from '../http-client';
import { fetch } from '../fetch-wrapper';

jest.mock('../fetch-wrapper');
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('HTTPClient', () => {
  let client: HTTPClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new HTTPClient('test-api-key');
  });

  describe('constructor', () => {
    test('should set default base URL', () => {
      const client = new HTTPClient('test-key');
      expect((client as any).baseURL).toBe('https://api.saturation.io/api/v1');
    });

    test('should use custom base URL', () => {
      const client = new HTTPClient('test-key', 'https://custom.api.com/v2');
      expect((client as any).baseURL).toBe('https://custom.api.com/v2');
    });

    test('should remove trailing slash from base URL', () => {
      const client = new HTTPClient('test-key', 'https://api.example.com/');
      expect((client as any).baseURL).toBe('https://api.example.com');
    });
  });

  describe('request headers', () => {
    test('should include API key in headers', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: async () => ({ success: true }),
      } as any);

      await client.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-API-Key': 'test-api-key',
          }),
        }),
      );
    });

    test('should set correct content-type headers', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: async () => ({ success: true }),
      } as any);

      await client.post('/test', { data: 'value' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Accept: 'application/json',
          }),
        }),
      );
    });
  });

  describe('URL building', () => {
    test('should build URL with query parameters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: async () => ({ success: true }),
      } as any);

      await client.get('/projects', {
        status: 'active',
        name: 'Test Project',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.saturation.io/api/v1/projects?status=active&name=Test+Project',
        expect.any(Object),
      );
    });

    test('should handle array query parameters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: async () => ({ success: true }),
      } as any);

      await client.get('/projects', {
        labels: ['tag1', 'tag2'],
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.saturation.io/api/v1/projects?labels%5B%5D=tag1&labels%5B%5D=tag2',
        expect.any(Object),
      );
    });

    test('should ignore undefined and null parameters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: async () => ({ success: true }),
      } as any);

      await client.get('/projects', {
        status: 'active',
        name: undefined,
        spaceId: null,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.saturation.io/api/v1/projects?status=active',
        expect.any(Object),
      );
    });
  });

  describe('HTTP methods', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: async () => ({ success: true }),
      } as any);
    });

    test('GET request', async () => {
      await client.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'GET',
        }),
      );
    });

    test('POST request with body', async () => {
      const data = { name: 'Test' };
      await client.post('/test', data);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data),
        }),
      );
    });

    test('PATCH request with body', async () => {
      const data = { name: 'Updated' };
      await client.patch('/test', data);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(data),
        }),
      );
    });

    test('DELETE request', async () => {
      await client.delete('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'DELETE',
        }),
      );
    });
  });

  describe('error handling', () => {
    test('should throw SaturationError for 400 response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: { get: () => 'application/json' },
        json: async () => ({
          error: 'Invalid parameters',
          details: { field: 'projectId' },
        }),
      } as any);

      await expect(client.get('/test')).rejects.toThrow(SaturationError);
      await expect(client.get('/test')).rejects.toMatchObject({
        message: 'Invalid parameters',
        statusCode: 400,
        details: { field: 'projectId' },
      });
    });

    test('should throw SaturationError for 401 response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: { get: () => 'application/json' },
        json: async () => ({
          error: 'Invalid API key',
        }),
      } as any);

      await expect(client.get('/test')).rejects.toThrow(SaturationError);
      await expect(client.get('/test')).rejects.toMatchObject({
        message: 'Invalid API key',
        statusCode: 401,
      });
    });

    test('should handle non-JSON error response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: { get: () => 'text/plain' },
        text: async () => 'Server error occurred',
      } as any);

      await expect(client.get('/test')).rejects.toThrow(SaturationError);
      await expect(client.get('/test')).rejects.toMatchObject({
        message: 'Server error occurred',
        statusCode: 500,
      });
    });

    test('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(client.get('/test')).rejects.toThrow(SaturationError);
      await expect(client.get('/test')).rejects.toMatchObject({
        message: 'Network error',
        statusCode: 0,
      });
    });
  });

  describe('response handling', () => {
    test('should parse JSON response', async () => {
      const responseData = { id: '123', name: 'Test' };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: async () => responseData,
      } as any);

      const result = await client.get('/test');
      expect(result).toEqual(responseData);
    });

    test('should handle 204 No Content response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
        headers: { get: () => null },
      } as any);

      const result = await client.delete('/test');
      expect(result).toEqual({});
    });

    test('should handle text response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'text/plain' },
        text: async () => 'Plain text response',
      } as any);

      const result = await client.get('/test');
      expect(result).toBe('Plain text response');
    });
  });
});
