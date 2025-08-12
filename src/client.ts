import { HTTPClient } from './http-client.js';
import { FormData, Blob } from './fetch-wrapper.js';
import type * as Types from './types/index.js';

export interface SaturationClientOptions {
  apiKey: string;
  baseURL?: string;
}

export interface ListProjectsParams {
  id?: string | string[];
  spaceId?: string | string[];
  status?: 'active' | 'archived';
  name?: string | string[];
  spaceName?: string | string[];
  labels?: string | string[];
  [key: string]: string | string[] | undefined;
}

export interface ListActualsParams {
  lineItemId?: string | string[];
  contactId?: string | string[];
  tags?: string | string[];
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  hasAttachments?: boolean;
  expands?: string[];
  [key: string]: string | string[] | boolean | undefined;
}

export interface ListPurchaseOrdersParams {
  lineItemId?: string | string[];
  contactId?: string | string[];
  tags?: string | string[];
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  hasAttachments?: boolean;
  expands?: string[];
  [key: string]: string | string[] | boolean | undefined;
}

export interface ListTransactionsParams {
  type?: 'actual' | 'purchase_order';
  lineItemId?: string | string[];
  contactId?: string | string[];
  tags?: string | string[];
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  hasAttachments?: boolean;
  expands?: string[];
  [key: string]: string | string[] | boolean | undefined;
}

export interface BudgetExpandParams {
  expands?: string[];
  idMode?: 'user' | 'system';
  [key: string]: string | string[] | undefined;
}

export class SaturationClient {
  private http: HTTPClient;

  constructor(options: SaturationClientOptions) {
    this.http = new HTTPClient(options.apiKey, options.baseURL);
  }

  // Projects

  async listProjects(params?: ListProjectsParams): Promise<{ projects: Types.Project[] }> {
    return this.http.get('/projects', params);
  }

  async getProject(projectId: string): Promise<Types.Project> {
    return this.http.get(`/projects/${projectId}`);
  }

  async createProject(data: Types.CreateProjectInput): Promise<Types.Project> {
    return this.http.post('/projects', data);
  }

  async updateProject(projectId: string, data: Types.UpdateProjectInput): Promise<Types.Project> {
    return this.http.patch(`/projects/${projectId}`, data);
  }

  async deleteProject(projectId: string): Promise<void> {
    return this.http.delete(`/projects/${projectId}`);
  }

  // Budget

  async getProjectBudget(projectId: string, params?: BudgetExpandParams): Promise<Types.Budget> {
    return this.http.get(`/projects/${projectId}/budget`, params);
  }

  async createBudgetLines(projectId: string, data: Types.CreateBudgetInput): Promise<Types.Budget> {
    return this.http.post(`/projects/${projectId}/budget`, data);
  }

  async getBudgetLine(
    projectId: string,
    lineId: string,
    params?: BudgetExpandParams,
  ): Promise<Types.Account> {
    return this.http.get(`/projects/${projectId}/budget/line/${lineId}`, params);
  }

  async updateBudgetLine(
    projectId: string,
    lineId: string,
    data: Types.UpdateBudgetLineRequest,
  ): Promise<Types.BudgetLine> {
    return this.http.patch(`/projects/${projectId}/budget/line/${lineId}`, data);
  }

  async deleteBudgetLine(projectId: string, lineId: string): Promise<void> {
    return this.http.delete(`/projects/${projectId}/budget/line/${lineId}`);
  }

  // Budget Phases

  async listBudgetPhases(projectId: string): Promise<{ phases: Types.Phase[] }> {
    return this.http.get(`/projects/${projectId}/budget/phases`);
  }

  async createBudgetPhase(projectId: string, data: Types.CreatePhaseRequest): Promise<Types.Phase> {
    return this.http.post(`/projects/${projectId}/budget/phases`, data);
  }

  async getBudgetPhase(projectId: string, phaseId: string): Promise<Types.Phase> {
    return this.http.get(`/projects/${projectId}/budget/phases/${phaseId}`);
  }

  async updateBudgetPhase(
    projectId: string,
    phaseId: string,
    data: Types.UpdatePhaseRequest,
  ): Promise<Types.Phase> {
    return this.http.patch(`/projects/${projectId}/budget/phases/${phaseId}`, data);
  }

  async deleteBudgetPhase(projectId: string, phaseId: string): Promise<void> {
    return this.http.delete(`/projects/${projectId}/budget/phases/${phaseId}`);
  }

  // Budget Fringes

  async listBudgetFringes(projectId: string): Promise<{ fringes: Types.Fringe[] }> {
    return this.http.get(`/projects/${projectId}/budget/fringes`);
  }

  async createBudgetFringe(
    projectId: string,
    data: Types.CreateFringeRequest,
  ): Promise<Types.Fringe> {
    return this.http.post(`/projects/${projectId}/budget/fringes`, data);
  }

  async getBudgetFringe(projectId: string, fringeId: string): Promise<Types.Fringe> {
    return this.http.get(`/projects/${projectId}/budget/fringes/${fringeId}`);
  }

  async updateBudgetFringe(
    projectId: string,
    fringeId: string,
    data: Types.UpdateFringeRequest,
  ): Promise<Types.Fringe> {
    return this.http.patch(`/projects/${projectId}/budget/fringes/${fringeId}`, data);
  }

  async deleteBudgetFringe(projectId: string, fringeId: string): Promise<void> {
    return this.http.delete(`/projects/${projectId}/budget/fringes/${fringeId}`);
  }

  // Budget Globals

  async listBudgetGlobals(projectId: string): Promise<{ globals: Types.Global[] }> {
    return this.http.get(`/projects/${projectId}/budget/globals`);
  }

  async createBudgetGlobal(
    projectId: string,
    data: Types.CreateGlobalRequest,
  ): Promise<Types.Global> {
    return this.http.post(`/projects/${projectId}/budget/globals`, data);
  }

  async getBudgetGlobal(projectId: string, globalId: string): Promise<Types.Global> {
    return this.http.get(`/projects/${projectId}/budget/globals/${globalId}`);
  }

  async updateBudgetGlobal(
    projectId: string,
    globalId: string,
    data: Types.UpdateGlobalRequest,
  ): Promise<Types.Global> {
    return this.http.patch(`/projects/${projectId}/budget/globals/${globalId}`, data);
  }

  async deleteBudgetGlobal(projectId: string, globalId: string): Promise<void> {
    return this.http.delete(`/projects/${projectId}/budget/globals/${globalId}`);
  }

  // Actuals

  async listProjectActuals(
    projectId: string,
    params?: ListActualsParams,
  ): Promise<{ actuals: Types.Actual[] }> {
    return this.http.get(`/projects/${projectId}/actuals`, params);
  }

  async getActual(
    projectId: string,
    actualId: string,
    params?: { expands?: string[] },
  ): Promise<Types.Actual> {
    return this.http.get(`/projects/${projectId}/actuals/${actualId}`, params);
  }

  async createActual(projectId: string, data: Types.CreateActualInput): Promise<Types.Actual> {
    return this.http.post(`/projects/${projectId}/actuals`, data);
  }

  async updateActual(
    projectId: string,
    actualId: string,
    data: Types.UpdateActualInput,
  ): Promise<Types.Actual> {
    return this.http.patch(`/projects/${projectId}/actuals/${actualId}`, data);
  }

  async deleteActual(projectId: string, actualId: string): Promise<void> {
    return this.http.delete(`/projects/${projectId}/actuals/${actualId}`);
  }

  async uploadActualAttachment(
    projectId: string,
    actualId: string,
    file: Buffer | Blob,
    filename: string,
  ): Promise<Types.Attachment> {
    const formData = new FormData();
    formData.append('file', file instanceof Buffer ? new Blob([file]) : file, filename);

    return this.http.request({
      method: 'POST',
      path: `/projects/${projectId}/actuals/${actualId}/attachments`,
      data: formData,
      headers: {
        // Remove Content-Type to let fetch set it with boundary
      },
    });
  }

  // Purchase Orders

  async listPurchaseOrders(
    projectId: string,
    params?: ListPurchaseOrdersParams,
  ): Promise<{ purchaseOrders: Types.PurchaseOrder[] }> {
    return this.http.get(`/projects/${projectId}/purchase-orders`, params);
  }

  async getPurchaseOrder(
    projectId: string,
    purchaseOrderId: string,
    params?: { expands?: string[] },
  ): Promise<Types.PurchaseOrder> {
    return this.http.get(`/projects/${projectId}/purchase-orders/${purchaseOrderId}`, params);
  }

  async createPurchaseOrder(
    projectId: string,
    data: Types.CreatePurchaseOrderInput,
  ): Promise<Types.PurchaseOrder> {
    return this.http.post(`/projects/${projectId}/purchase-orders`, data);
  }

  async updatePurchaseOrder(
    projectId: string,
    purchaseOrderId: string,
    data: Types.UpdatePurchaseOrderInput,
  ): Promise<Types.PurchaseOrder> {
    return this.http.patch(`/projects/${projectId}/purchase-orders/${purchaseOrderId}`, data);
  }

  async deletePurchaseOrder(projectId: string, purchaseOrderId: string): Promise<void> {
    return this.http.delete(`/projects/${projectId}/purchase-orders/${purchaseOrderId}`);
  }

  async uploadPurchaseOrderAttachment(
    projectId: string,
    purchaseOrderId: string,
    file: Buffer | Blob,
    filename: string,
  ): Promise<Types.Attachment> {
    const formData = new FormData();
    formData.append('file', file instanceof Buffer ? new Blob([file]) : file, filename);

    return this.http.request({
      method: 'POST',
      path: `/projects/${projectId}/purchase-orders/${purchaseOrderId}/attachments`,
      data: formData,
      headers: {
        // Remove Content-Type to let fetch set it with boundary
      },
    });
  }

  // Comments

  async listProjectComments(
    projectId: string,
    params?: { lineId?: string },
  ): Promise<{ comments: Types.Comment[] }> {
    return this.http.get(`/projects/${projectId}/comments`, params);
  }

  // Spaces

  async listSpaces(params?: { name?: string | string[] }): Promise<{ spaces: Types.Space[] }> {
    return this.http.get('/spaces', params);
  }

  async createSpace(data: Types.CreateSpaceInput): Promise<Types.Space> {
    return this.http.post('/spaces', data);
  }

  async getSpace(spaceId: string): Promise<Types.Space> {
    return this.http.get(`/spaces/${spaceId}`);
  }

  async updateSpace(spaceId: string, data: Types.UpdateSpaceInput): Promise<Types.Space> {
    return this.http.patch(`/spaces/${spaceId}`, data);
  }

  async deleteSpace(spaceId: string): Promise<void> {
    return this.http.delete(`/spaces/${spaceId}`);
  }

  // Files

  async uploadFile(file: Buffer | Blob, filename: string): Promise<Types.UploadResponse> {
    const formData = new FormData();
    formData.append('file', file instanceof Buffer ? new Blob([file]) : file, filename);

    return this.http.request({
      method: 'POST',
      path: '/files/upload',
      data: formData,
      headers: {
        // Remove Content-Type to let fetch set it with boundary
      },
    });
  }

  async downloadFile(fileId: string): Promise<Buffer> {
    return this.http.get(`/files/${fileId}`);
  }

  async deleteFile(fileId: string): Promise<void> {
    return this.http.delete(`/files/${fileId}`);
  }

  // Tags

  async listProjectTags(
    projectId: string,
    params?: { name?: string | string[] },
  ): Promise<{ tags: Types.Tag[] }> {
    return this.http.get(`/projects/${projectId}/tags`, params);
  }

  async createProjectTag(
    projectId: string,
    data: Types.CreateTagInput,
  ): Promise<Types.TagResponse> {
    return this.http.post(`/projects/${projectId}/tags`, data);
  }

  async getProjectTag(projectId: string, tagId: string): Promise<Types.TagResponse> {
    return this.http.get(`/projects/${projectId}/tags/${tagId}`);
  }

  async updateProjectTag(
    projectId: string,
    tagId: string,
    data: Types.UpdateTagInput,
  ): Promise<Types.TagResponse> {
    return this.http.patch(`/projects/${projectId}/tags/${tagId}`, data);
  }

  async deleteProjectTag(projectId: string, tagId: string): Promise<void> {
    return this.http.delete(`/projects/${projectId}/tags/${tagId}`);
  }

  // Contacts

  async listContacts(params?: {
    name?: string | string[];
    email?: string | string[];
    phone?: string | string[];
    companyName?: string | string[];
    type?: 'individual' | 'company';
  }): Promise<{ contacts: Types.Contact[] }> {
    return this.http.get('/contacts', params);
  }

  async createContact(data: Types.CreateContactInput): Promise<Types.Contact> {
    return this.http.post('/contacts', data);
  }

  async getContact(contactId: string): Promise<Types.Contact> {
    return this.http.get(`/contacts/${contactId}`);
  }

  async updateContact(contactId: string, data: Types.UpdateContactInput): Promise<Types.Contact> {
    return this.http.patch(`/contacts/${contactId}`, data);
  }

  async uploadContactTaxDocument(
    contactId: string,
    file: Buffer | Blob,
    filename: string,
  ): Promise<Types.TaxDocument> {
    const formData = new FormData();
    formData.append('file', file instanceof Buffer ? new Blob([file]) : file, filename);

    return this.http.request({
      method: 'POST',
      path: `/contacts/${contactId}/tax-documents`,
      data: formData,
      headers: {
        // Remove Content-Type to let fetch set it with boundary
      },
    });
  }

  async uploadContactAttachment(
    contactId: string,
    file: Buffer | Blob,
    filename: string,
  ): Promise<Types.Attachment> {
    const formData = new FormData();
    formData.append('file', file instanceof Buffer ? new Blob([file]) : file, filename);

    return this.http.request({
      method: 'POST',
      path: `/contacts/${contactId}/attachments`,
      data: formData,
      headers: {
        // Remove Content-Type to let fetch set it with boundary
      },
    });
  }

  // Transactions

  async listTransactions(
    params?: ListTransactionsParams,
  ): Promise<{ transactions: Types.Transaction[] }> {
    return this.http.get('/transactions', params);
  }

  async getTransaction(
    transactionId: string,
    params?: { expands?: string[] },
  ): Promise<Types.Transaction> {
    return this.http.get(`/transactions/${transactionId}`, params);
  }

  async updateTransaction(
    transactionId: string,
    data: Types.UpdateTransactionInput,
  ): Promise<Types.Transaction> {
    return this.http.patch(`/transactions/${transactionId}`, data);
  }

  async uploadTransactionAttachment(
    transactionId: string,
    file: Buffer | Blob,
    filename: string,
  ): Promise<Types.Attachment> {
    const formData = new FormData();
    formData.append('file', file instanceof Buffer ? new Blob([file]) : file, filename);

    return this.http.request({
      method: 'POST',
      path: `/transactions/${transactionId}/attachments`,
      data: formData,
      headers: {
        // Remove Content-Type to let fetch set it with boundary
      },
    });
  }

  // Rates

  async listWorkspaceRates(params?: {
    lineItemId?: string | string[];
    contactId?: string | string[];
    tags?: string | string[];
  }): Promise<{ rates: Types.WorkspaceRate[] }> {
    return this.http.get('/rates', params);
  }

  async createWorkspaceRate(data: Types.CreateWorkspaceRateInput): Promise<Types.WorkspaceRate> {
    return this.http.post('/rates', data);
  }

  async updateWorkspaceRate(
    rateId: string,
    data: Types.UpdateWorkspaceRateInput,
  ): Promise<Types.WorkspaceRate> {
    return this.http.patch(`/rates/${rateId}`, data);
  }

  async deleteWorkspaceRate(rateId: string): Promise<void> {
    return this.http.delete(`/rates/${rateId}`);
  }

  // Public Rates

  async listPublicRates(params?: {
    search?: string;
    country?: string;
    state?: string;
    city?: string;
    union?: string;
    position?: string;
    page?: number;
    limit?: number;
  }): Promise<{ rates: Types.PublicRate[] }> {
    return this.http.get('/public-rates', params);
  }

  async getPublicRatepackRates(ratepackId: string): Promise<{ rates: Types.PublicRate[] }> {
    return this.http.get(`/public-rates/ratepacks/${ratepackId}`);
  }
}
