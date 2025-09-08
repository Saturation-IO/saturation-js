import { createClient, type Config } from './generated/client/index.js';
import * as sdk from './generated/sdk.gen.js';
import type * as Types from './generated/types.gen.js';

export type SaturationOptions = {
  apiKey: string;
  baseURL?: string;
} | {
  authToken: string;
  workspaceId: string;
  baseURL?: string;
}

export class Saturation {
  private client: ReturnType<typeof createClient>;

  constructor(options: SaturationOptions) {
    const headers =
      'apiKey' in options
        ? {
            'X-API-Key': options.apiKey,
          }
        : {
            Authorization: `Bearer ${options.authToken}`,
            'X-Workspace-Id': options.workspaceId,
          };

    const config: Config = {
      baseUrl: options.baseURL || 'https://api.saturation.io/api/v1',
      headers: {
        ...headers,
      },
      // Custom query serializer to handle arrays with bracket notation
      querySerializer: (queryParams: Record<string, unknown>) => {
        const search: string[] = [];
        if (queryParams && typeof queryParams === 'object') {
          for (const name in queryParams) {
            const value = queryParams[name];

            if (value === undefined || value === null) {
              continue;
            }

            if (Array.isArray(value)) {
              // Use bracket notation for arrays (e.g., expands[]=value1&expands[]=value2)
              for (const item of value) {
                search.push(`${name}[]=${encodeURIComponent(String(item))}`);
              }
            } else if (typeof value === 'object') {
              // Handle nested objects (deepObject style)
              const obj = value as Record<string, unknown>;
              for (const key in obj) {
                if (obj[key] !== undefined && obj[key] !== null) {
                  search.push(`${name}[${key}]=${encodeURIComponent(String(obj[key]))}`);
                }
              }
            } else {
              // Handle primitive values
              search.push(`${name}=${encodeURIComponent(String(value))}`);
            }
          }
        }
        return search.join('&');
      },
    };
    this.client = createClient(config);
  }

  // Projects

  async listProjects(
    params?: Types.ListProjectsData['query'],
  ): Promise<{ projects: Types.Project[] }> {
    const result = await sdk.listProjects({
      client: this.client,
      query: params,
    });
    return result.data as { projects: Types.Project[] };
  }

  async getProject(projectId: string): Promise<Types.Project> {
    const result = await sdk.getProject({
      client: this.client,
      path: { projectId },
    });
    return result.data as Types.Project;
  }

  async createProject(data: Types.CreateProjectInput): Promise<Types.Project> {
    const result = await sdk.createProject({
      client: this.client,
      body: data,
    });
    return result.data as Types.Project;
  }

  async updateProject(projectId: string, data: Types.UpdateProjectInput): Promise<Types.Project> {
    const result = await sdk.updateProject({
      client: this.client,
      path: { projectId },
      body: data,
    });
    return result.data as Types.Project;
  }

  async deleteProject(projectId: string): Promise<void> {
    await sdk.deleteProject({
      client: this.client,
      path: { projectId },
    });
  }

  // Budget

  async getBudget(projectId: string, params?: Types.GetBudgetData['query']): Promise<Types.Budget> {
    const result = await sdk.getBudget({
      client: this.client,
      path: { projectId },
      query: params,
    });
    return result.data as Types.Budget;
  }

  async createBudgetLines(projectId: string, data: Types.CreateBudgetInput): Promise<Types.Budget> {
    const result = await sdk.createBudgetLines({
      client: this.client,
      path: { projectId },
      body: data,
    });
    return result.data as Types.Budget;
  }

  async getBudgetLine(
    projectId: string,
    lineId: string,
    params?: Types.GetBudgetLineData['query'],
  ): Promise<Types.BudgetLine> {
    const result = await sdk.getBudgetLine({
      client: this.client,
      path: { projectId, lineId },
      query: params,
    });
    return result.data as Types.BudgetLine;
  }

  async updateBudgetLine(
    projectId: string,
    lineId: string,
    data: Types.UpdateBudgetLineRequest,
  ): Promise<Types.BudgetLine> {
    const result = await sdk.updateBudgetLine({
      client: this.client,
      path: { projectId, lineId },
      body: data,
    });
    return result.data as Types.BudgetLine;
  }

  async deleteBudgetLine(
    projectId: string,
    lineId: string,
    idMode?: 'user' | 'system',
  ): Promise<void> {
    await sdk.deleteBudgetLine({
      client: this.client,
      path: { projectId, lineId },
      query: { idMode },
    });
  }

  // Actuals

  async listActuals(
    projectId: string,
    params?: Types.ListActualsData['query'],
  ): Promise<{ actuals: Types.Actual[]; totalAmount: number }> {
    const result = await sdk.listActuals({
      client: this.client,
      path: { projectId },
      query: params,
    });
    return result.data as { actuals: Types.Actual[]; totalAmount: number };
  }

  async getActual(
    projectId: string,
    actualId: string,
    params?: Types.GetActualData['query'],
  ): Promise<Types.Actual> {
    const result = await sdk.getActual({
      client: this.client,
      path: { projectId, actualId },
      query: params,
    });
    return result.data as Types.Actual;
  }

  async createActual(
    projectId: string,
    actualId: string,
    data: Types.CreateActualInput,
  ): Promise<Types.Actual> {
    const result = await sdk.createActual({
      client: this.client,
      path: { projectId, actualId },
      body: data,
    });
    return result.data as Types.Actual;
  }

  async updateActual(
    projectId: string,
    actualId: string,
    data: Types.UpdateActualInput,
  ): Promise<Types.Actual> {
    const result = await sdk.updateActual({
      client: this.client,
      path: { projectId, actualId },
      body: data,
    });
    return result.data as Types.Actual;
  }

  async deleteActual(projectId: string, actualId: string): Promise<void> {
    await sdk.deleteActual({
      client: this.client,
      path: { projectId, actualId },
    });
  }

  async uploadActualAttachment(
    projectId: string,
    actualId: string,
    file: File | Blob,
  ): Promise<Types.File> {
    const result = await sdk.uploadActualAttachment({
      client: this.client,
      path: { projectId, actualId },
      body: { file },
    });
    return result.data as Types.File;
  }

  // Purchase Orders

  async listPurchaseOrders(
    projectId: string,
    params?: Types.ListPurchaseOrdersData['query'],
  ): Promise<{ purchaseOrders: Types.PurchaseOrder[] }> {
    const result = await sdk.listPurchaseOrders({
      client: this.client,
      path: { projectId },
      query: params,
    });
    return result.data as { purchaseOrders: Types.PurchaseOrder[] };
  }

  async getPurchaseOrder(
    projectId: string,
    purchaseOrderId: string,
    params?: Types.GetPurchaseOrderData['query'],
  ): Promise<Types.PurchaseOrder> {
    const result = await sdk.getPurchaseOrder({
      client: this.client,
      path: { projectId, purchaseOrderId },
      query: params,
    });
    return result.data as Types.PurchaseOrder;
  }

  async createPurchaseOrder(
    projectId: string,
    purchaseOrderId: string,
    data: Types.CreatePurchaseOrderInput,
  ): Promise<Types.PurchaseOrder> {
    const result = await sdk.createPurchaseOrder({
      client: this.client,
      path: { projectId, purchaseOrderId },
      body: data,
    });
    return result.data as Types.PurchaseOrder;
  }

  async updatePurchaseOrder(
    projectId: string,
    purchaseOrderId: string,
    data: Types.UpdatePurchaseOrderInput,
  ): Promise<Types.PurchaseOrder> {
    const result = await sdk.updatePurchaseOrder({
      client: this.client,
      path: { projectId, purchaseOrderId },
      body: data,
    });
    return result.data as Types.PurchaseOrder;
  }

  async deletePurchaseOrder(projectId: string, purchaseOrderId: string): Promise<void> {
    await sdk.deletePurchaseOrder({
      client: this.client,
      path: { projectId, purchaseOrderId },
    });
  }

  async uploadPurchaseOrderAttachment(
    projectId: string,
    purchaseOrderId: string,
    file: File | Blob,
  ): Promise<Types.File> {
    const result = await sdk.uploadPurchaseOrderAttachment({
      client: this.client,
      path: { projectId, purchaseOrderId },
      body: { file },
    });
    return result.data as Types.File;
  }

  // Budget Phases

  async listBudgetPhases(
    projectId: string,
    idMode?: 'user' | 'system',
  ): Promise<{ phases: Types.Phase[] }> {
    const result = await sdk.listBudgetPhases({
      client: this.client,
      path: { projectId },
      query: { idMode },
    });
    return result.data as { phases: Types.Phase[] };
  }

  async getBudgetPhase(
    projectId: string,
    phaseId: string,
    idMode?: 'user' | 'system',
  ): Promise<Types.Phase> {
    const result = await sdk.getBudgetPhase({
      client: this.client,
      path: { projectId, phaseId },
      query: { idMode },
    });
    return result.data as Types.Phase;
  }

  async createBudgetPhase(projectId: string, data: Types.CreatePhaseRequest): Promise<Types.Phase> {
    const result = await sdk.createBudgetPhase({
      client: this.client,
      path: { projectId },
      body: data,
    });
    return result.data as Types.Phase;
  }

  async updateBudgetPhase(
    projectId: string,
    phaseId: string,
    data: Types.UpdatePhaseRequest,
  ): Promise<Types.Phase> {
    const result = await sdk.updateBudgetPhase({
      client: this.client,
      path: { projectId, phaseId },
      body: data,
    });
    return result.data as Types.Phase;
  }

  async deleteBudgetPhase(projectId: string, phaseId: string): Promise<void> {
    await sdk.deleteBudgetPhase({
      client: this.client,
      path: { projectId, phaseId },
    });
  }

  // Budget Fringes

  async listBudgetFringes(
    projectId: string,
    idMode?: 'user' | 'system',
  ): Promise<{ fringes: Types.Fringe[] }> {
    const result = await sdk.listBudgetFringes({
      client: this.client,
      path: { projectId },
      query: { idMode },
    });
    return result.data as { fringes: Types.Fringe[] };
  }

  async getBudgetFringe(
    projectId: string,
    fringeId: string,
    idMode?: 'user' | 'system',
  ): Promise<Types.Fringe> {
    const result = await sdk.getBudgetFringe({
      client: this.client,
      path: { projectId, fringeId },
      query: { idMode },
    });
    return result.data as Types.Fringe;
  }

  async createBudgetFringe(
    projectId: string,
    data: Types.CreateFringeRequest,
  ): Promise<Types.Fringe> {
    const result = await sdk.createBudgetFringe({
      client: this.client,
      path: { projectId },
      body: data,
    });
    return result.data as Types.Fringe;
  }

  async updateBudgetFringe(
    projectId: string,
    fringeId: string,
    data: Types.UpdateFringeRequest,
  ): Promise<Types.Fringe> {
    const result = await sdk.updateBudgetFringe({
      client: this.client,
      path: { projectId, fringeId },
      body: data,
    });
    return result.data as Types.Fringe;
  }

  async deleteBudgetFringe(projectId: string, fringeId: string): Promise<void> {
    await sdk.deleteBudgetFringe({
      client: this.client,
      path: { projectId, fringeId },
    });
  }

  // Budget Globals

  async listBudgetGlobals(
    projectId: string,
    idMode?: 'user' | 'system',
  ): Promise<{ globals: Types.Global[] }> {
    const result = await sdk.listBudgetGlobals({
      client: this.client,
      path: { projectId },
      query: { idMode },
    });
    return result.data as { globals: Types.Global[] };
  }

  async getBudgetGlobal(
    projectId: string,
    globalId: string,
    idMode?: 'user' | 'system',
  ): Promise<Types.Global> {
    const result = await sdk.getBudgetGlobal({
      client: this.client,
      path: { projectId, globalId },
      query: { idMode },
    });
    return result.data as Types.Global;
  }

  async createBudgetGlobal(
    projectId: string,
    data: Types.CreateGlobalRequest,
  ): Promise<Types.Global> {
    const result = await sdk.createBudgetGlobal({
      client: this.client,
      path: { projectId },
      body: data,
    });
    return result.data as Types.Global;
  }

  async updateBudgetGlobal(
    projectId: string,
    globalId: string,
    data: Types.UpdateGlobalRequest,
  ): Promise<Types.Global> {
    const result = await sdk.updateBudgetGlobal({
      client: this.client,
      path: { projectId, globalId },
      body: data,
    });
    return result.data as Types.Global;
  }

  async deleteBudgetGlobal(projectId: string, globalId: string): Promise<void> {
    await sdk.deleteBudgetGlobal({
      client: this.client,
      path: { projectId, globalId },
    });
  }

  // Project Tags

  async listTags(
    projectId: string,
    params?: Types.ListTagsData['query'],
  ): Promise<Types.TagsResponse> {
    const result = await sdk.listTags({
      client: this.client,
      path: { projectId },
      query: params,
    });
    return result.data as Types.TagsResponse;
  }

  async getTag(
    projectId: string,
    tagId: string,
    idMode?: 'user' | 'system',
  ): Promise<Types.TagResponse> {
    const result = await sdk.getTag({
      client: this.client,
      path: { projectId, tagId },
      query: { idMode },
    });
    return result.data as Types.TagResponse;
  }

  async createTag(projectId: string, data: Types.CreateTagRequest): Promise<Types.TagResponse> {
    const result = await sdk.createTag({
      client: this.client,
      path: { projectId },
      body: data,
    });
    return result.data as Types.TagResponse;
  }

  async updateTag(
    projectId: string,
    tagId: string,
    data: Types.UpdateTagRequest,
  ): Promise<Types.TagResponse> {
    const result = await sdk.updateTag({
      client: this.client,
      path: { projectId, tagId },
      body: data,
    });
    return result.data as Types.TagResponse;
  }

  async deleteTag(projectId: string, tagId: string): Promise<void> {
    await sdk.deleteTag({
      client: this.client,
      path: { projectId, tagId },
    });
  }

  // Contacts

  async listContacts(
    params?: Types.ListContactsData['query'],
  ): Promise<{ contacts: Types.Contact[] }> {
    const result = await sdk.listContacts({
      client: this.client,
      query: params,
    });
    return result.data as { contacts: Types.Contact[] };
  }

  async getContact(
    contactId: string,
    params?: Types.GetContactData['query'],
  ): Promise<Types.Contact> {
    const result = await sdk.getContact({
      client: this.client,
      path: { contactId },
      query: params,
    });
    return result.data as Types.Contact;
  }

  async createContact(data: Types.CreateContactInput): Promise<Types.Contact> {
    const result = await sdk.createContact({
      client: this.client,
      body: data,
    });
    return result.data as Types.Contact;
  }

  async updateContact(contactId: string, data: Types.UpdateContactInput): Promise<Types.Contact> {
    const result = await sdk.updateContact({
      client: this.client,
      path: { contactId },
      body: data,
    });
    return result.data as Types.Contact;
  }

  // Spaces

  async listSpaces(params?: Types.ListSpacesData['query']): Promise<{ spaces: Types.Space[] }> {
    const result = await sdk.listSpaces({
      client: this.client,
      query: params,
    });
    return result.data as { spaces: Types.Space[] };
  }

  async getSpace(spaceId: string, params?: Types.GetSpaceData['query']): Promise<Types.Space> {
    const result = await sdk.getSpace({
      client: this.client,
      path: { spaceId },
      query: params,
    });
    return result.data as Types.Space;
  }

  async createSpace(data: Types.CreateSpaceInput): Promise<Types.Space> {
    const result = await sdk.createSpace({
      client: this.client,
      body: data,
    });
    return result.data as Types.Space;
  }

  async updateSpace(spaceId: string, data: Types.UpdateSpaceInput): Promise<Types.Space> {
    const result = await sdk.updateSpace({
      client: this.client,
      path: { spaceId },
      body: data,
    });
    return result.data as Types.Space;
  }

  async deleteSpace(spaceId: string): Promise<void> {
    await sdk.deleteSpace({
      client: this.client,
      path: { spaceId },
    });
  }

  // Files

  async uploadFile(file: File | Blob, projectId?: string, type?: string): Promise<Types.File> {
    const result = await sdk.uploadFile({
      client: this.client,
      body: { file, projectId, type },
    });
    return result.data as Types.File;
  }

  async downloadFile(fileId: string): Promise<Blob> {
    const result = await sdk.downloadFile({
      client: this.client,
      path: { fileId },
    });
    return result.data as Blob;
  }

  async deleteFile(fileId: string): Promise<void> {
    await sdk.deleteFile({
      client: this.client,
      path: { fileId },
    });
  }

  // Comments

  async listComments(
    projectId: string,
    params?: Types.ListCommentsData['query'],
  ): Promise<{ comments: Types.Comment[] }> {
    const result = await sdk.listComments({
      client: this.client,
      path: { projectId },
      query: params,
    });
    return result.data as { comments: Types.Comment[] };
  }

  // Workspace Rates

  async listWorkspaceRates(
    params?: Types.ListWorkspaceRatesData['query'],
  ): Promise<{ rates: Types.Rate[] }> {
    const result = await sdk.listWorkspaceRates({
      client: this.client,
      query: params,
    });
    return result.data as { rates: Types.Rate[] };
  }

  async createWorkspaceRate(data: Types.CreateRateInput): Promise<Types.Rate> {
    const result = await sdk.createWorkspaceRate({
      client: this.client,
      body: data,
    });
    return result.data as Types.Rate;
  }

  async deleteWorkspaceRate(rateId: string): Promise<void> {
    await sdk.deleteWorkspaceRate({
      client: this.client,
      path: { rateId },
    });
  }

  async updateWorkspaceRate(rateId: string, data: Types.UpdateRateInput): Promise<Types.Rate> {
    const result = await sdk.updateWorkspaceRate({
      client: this.client,
      path: { rateId },
      body: data,
    });
    return result.data as Types.Rate;
  }

  // Public Rates

  async listPublicRatepacks(
    params?: Types.ListPublicRatepacksData['query'],
  ): Promise<{ ratepacks: Types.PublicRatepack[] }> {
    const result = await sdk.listPublicRatepacks({
      client: this.client,
      query: params,
    });
    return result.data as { ratepacks: Types.PublicRatepack[] };
  }

  async getPublicRates(
    ratepackId: string,
    params?: Types.GetPublicRatesData['query'],
  ): Promise<{ rates: Types.Rate[] }> {
    const result = await sdk.getPublicRates({
      client: this.client,
      path: { ratepackId },
      query: params,
    });
    return result.data as { rates: Types.Rate[] };
  }

  // Transactions

  async listTransactions(
    params?: Types.ListTransactionsData['query'],
  ): Promise<{ transactions: Types.Transaction[] }> {
    const result = await sdk.listTransactions({
      client: this.client,
      query: params,
    });
    return result.data as { transactions: Types.Transaction[] };
  }

  async getTransaction(
    transactionId: string,
    params?: Types.GetTransactionData['query'],
  ): Promise<Types.Transaction> {
    const result = await sdk.getTransaction({
      client: this.client,
      path: { transactionId },
      query: params,
    });
    return result.data as Types.Transaction;
  }

  async updateTransaction(
    transactionId: string,
    data: Types.UpdateTransactionInput,
  ): Promise<Types.Transaction> {
    const result = await sdk.updateTransaction({
      client: this.client,
      path: { transactionId },
      body: data,
    });
    return result.data as Types.Transaction;
  }

  async uploadTransactionAttachment(transactionId: string, file: File | Blob): Promise<Types.File> {
    const result = await sdk.uploadTransactionAttachment({
      client: this.client,
      path: { transactionId },
      body: { file },
    });
    return result.data as Types.File;
  }

  // Contact Attachments

  async uploadContactTaxDocument(contactId: string, file: File | Blob): Promise<Types.File> {
    const result = await sdk.uploadContactTaxDocument({
      client: this.client,
      path: { contactId },
      body: { file },
    });
    return result.data as Types.File;
  }

  async uploadContactAttachment(contactId: string, file: File | Blob): Promise<Types.File> {
    const result = await sdk.uploadContactAttachment({
      client: this.client,
      path: { contactId },
      body: { file },
    });
    return result.data as Types.File;
  }
}
