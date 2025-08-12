import { Saturation } from '../client';
import type { HTTPClient } from '../http-client';

jest.mock('../http-client');

describe('Saturation', () => {
  let client: Saturation;
  let mockHttpClient: jest.Mocked<HTTPClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new Saturation({ apiKey: 'test-api-key' });
    mockHttpClient = (client as any).http as jest.Mocked<HTTPClient>;
    mockHttpClient.get = jest.fn();
    mockHttpClient.post = jest.fn();
    mockHttpClient.patch = jest.fn();
    mockHttpClient.delete = jest.fn();
  });

  describe('Projects', () => {
    test('listProjects should call correct endpoint', async () => {
      const mockProjects = {
        projects: [
          {
            id: 'project-1',
            name: 'Test Project',
            status: 'active',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
      };

      mockHttpClient.get.mockResolvedValue(mockProjects);

      const result = await client.listProjects({ status: 'active' });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/projects', { status: 'active' });
      expect(result).toEqual(mockProjects);
    });

    test('createProject should post to correct endpoint', async () => {
      const projectData = {
        name: 'New Project',
        icon: '🚀',
        spaceId: 'space-1',
        imageUrl: null,
        status: 'active' as const,
        templateId: null,
        labels: ['marketing'],
      };

      const mockResponse = {
        id: 'new-project',
        ...projectData,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await client.createProject(projectData);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/projects', projectData);
      expect(result).toEqual(mockResponse);
    });

    test('updateProject should patch correct endpoint', async () => {
      const updateData = {
        name: 'Updated Name',
        status: 'archived' as const,
        icon: null,
        imageUrl: null,
        spaceId: null,
        labels: [],
      };

      const mockResponse = {
        id: 'project-1',
        ...updateData,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      mockHttpClient.patch.mockResolvedValue(mockResponse);

      const result = await client.updateProject('project-1', updateData);

      expect(mockHttpClient.patch).toHaveBeenCalledWith('/projects/project-1', updateData);
      expect(result).toEqual(mockResponse);
    });

    test('deleteProject should delete correct endpoint', async () => {
      mockHttpClient.delete.mockResolvedValue(undefined);

      await client.deleteProject('project-1');

      expect(mockHttpClient.delete).toHaveBeenCalledWith('/projects/project-1');
    });
  });

  describe('Budget', () => {
    test('getProjectBudget should handle expands parameter', async () => {
      const mockBudget = {
        account: {
          id: 'root',
          accountId: null,
          description: 'Root Account',
          path: '/',
          lines: [],
          totals: {},
        },
        phases: [],
        fringes: [],
        globals: [],
      };

      mockHttpClient.get.mockResolvedValue(mockBudget);

      const result = await client.getProjectBudget('project-1', {
        expands: ['phases', 'fringes'],
        idMode: 'user',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/projects/project-1/budget', {
        expands: ['phases', 'fringes'],
        idMode: 'user',
      });
      expect(result).toEqual(mockBudget);
    });

    test('createBudgetLines should post to correct endpoint', async () => {
      const budgetData = {
        accountId: 'root',
        lines: [
          {
            type: 'line' as const,
            accountId: '1100',
            description: 'Director',
            phaseData: {},
          },
        ],
      };

      const mockResponse = {
        account: {
          id: 'root',
          accountId: null,
          description: 'Root Account',
          path: '/',
          lines: [],
          totals: {},
        },
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await client.createBudgetLines('project-1', budgetData);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/projects/project-1/budget', budgetData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Actuals', () => {
    test('listProjectActuals should handle date filters', async () => {
      const mockActuals = {
        actuals: [
          {
            id: 'actual-1',
            lineItemId: '1100',
            amount: 5000,
            date: '2024-03-15',
            description: 'Director payment',
            contactId: 'contact-1',
            tags: ['week-1'],
            attachments: [],
            createdAt: '2024-03-15T10:00:00Z',
            updatedAt: '2024-03-15T10:00:00Z',
          },
        ],
      };

      mockHttpClient.get.mockResolvedValue(mockActuals);

      const result = await client.listProjectActuals('project-1', {
        dateFrom: '2024-03-01',
        dateTo: '2024-03-31',
        lineItemId: '1100',
        expands: ['contact', 'attachments'],
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/projects/project-1/actuals', {
        dateFrom: '2024-03-01',
        dateTo: '2024-03-31',
        lineItemId: '1100',
        expands: ['contact', 'attachments'],
      });
      expect(result).toEqual(mockActuals);
    });

    test('createActual should post actual data', async () => {
      const actualData = {
        lineItemId: '2150',
        amount: 35000,
        date: '2024-03-20',
        description: 'Camera rental',
        contactId: 'vendor-1',
        tags: ['equipment', 'week-2'],
      };

      const mockResponse = {
        id: 'actual-2',
        ...actualData,
        attachments: [],
        createdAt: '2024-03-20T14:00:00Z',
        updatedAt: '2024-03-20T14:00:00Z',
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await client.createActual('project-1', actualData);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/projects/project-1/actuals', actualData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Contacts', () => {
    test('listContacts should handle search parameters', async () => {
      const mockContacts = {
        contacts: [
          {
            id: 'contact-1',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            type: 'individual' as const,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
      };

      mockHttpClient.get.mockResolvedValue(mockContacts);

      const result = await client.listContacts({
        name: 'John',
        type: 'individual',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/contacts', {
        name: 'John',
        type: 'individual',
      });
      expect(result).toEqual(mockContacts);
    });

    test('createContact should post contact data', async () => {
      const contactData = {
        name: 'Jane Smith',
        email: 'jane@company.com',
        phone: '+9876543210',
        type: 'Company' as const,
        companyName: 'ACME Corp',
        address: '123 Main St',
      };

      const mockResponse = {
        id: 'contact-2',
        ...contactData,
        taxDocuments: [],
        attachments: [],
        createdAt: '2024-03-20T10:00:00Z',
        updatedAt: '2024-03-20T10:00:00Z',
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await client.createContact(contactData);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/contacts', contactData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Purchase Orders', () => {
    test('createPurchaseOrder should post purchase order data', async () => {
      const poData = {
        purchaseOrderId: 'PO-001',
        contactId: 'vendor-1',
        date: '2024-03-15',
        amount: 35000,
        items: [
          {
            lineItemId: '2150',
            amount: 35000,
            description: 'Camera equipment rental',
          },
        ],
      };

      const mockResponse = {
        id: 'po-1',
        ...poData,
        status: 'pending',
        attachments: [],
        createdAt: '2024-03-15T09:00:00Z',
        updatedAt: '2024-03-15T09:00:00Z',
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await client.createPurchaseOrder('project-1', poData);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/projects/project-1/purchase-orders',
        poData,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Spaces', () => {
    test('listSpaces should handle name filter', async () => {
      const mockSpaces = {
        spaces: [
          {
            id: 'space-1',
            name: 'Commercial Productions',
            icon: '🎬',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
      };

      mockHttpClient.get.mockResolvedValue(mockSpaces);

      const result = await client.listSpaces({ name: 'Commercial' });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/spaces', { name: 'Commercial' });
      expect(result).toEqual(mockSpaces);
    });
  });

  describe('Rates', () => {
    test('listWorkspaceRates should handle filters', async () => {
      const mockRates = {
        rates: [
          {
            id: 'rate-1',
            lineItemId: '1100',
            contactId: 'contact-1',
            rate: 1500,
            unit: 'day',
            currency: 'USD',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
      };

      mockHttpClient.get.mockResolvedValue(mockRates);

      const result = await client.listWorkspaceRates({
        lineItemId: '1100',
        contactId: 'contact-1',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/rates', {
        lineItemId: '1100',
        contactId: 'contact-1',
      });
      expect(result).toEqual(mockRates);
    });
  });
});
