// Generated API methods
// Do not edit manually

import type * as Types from './types/index.js';

export class GeneratedAPI {
  /**
   * List projects
   * Retrieve projects for the current workspace. Supports filtering by ID, space, status, name, space name, or labels.
   */
  async listProjects(_params?: {
    id?: string | string[];
    spaceId?: string | string[];
    status?: 'active' | 'archived';
    name?: string | string[];
    spaceName?: string | string[];
    labels?: string | string[];
  }): Promise<{
  projects?: Types.Project[];
}> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Create project
   * Create a new project in the current workspace
   */
  async createProject(_data: Types.CreateProjectInput): Promise<Types.Project> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Get project
   * Retrieve a project by its ID or alias
   */
  async getProject(): Promise<Types.Project> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Update project
   * Update an existing project's details
   */
  async updateProject(_data: Types.UpdateProjectInput): Promise<Types.Project> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Delete project
   * Soft delete a project
   */
  async deleteProject(): Promise<unknown> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Get budget
   * Retrieve budget information for a project
   */
  async getProjectBudget(_params?: {
    accountId?: string;
    phaseId?: string | string[];
    includeHiddenPhases?: boolean;
    tags?: string | string[];
    tagFilterMode?: 'contains' | 'excludes';
    expands?: 'fringes' | 'phases' | 'globals' | 'lines.contact' | 'lines.phaseData'[];
  }): Promise<Types.Budget> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Create budget lines
   * Add new budget lines to an existing account within the budget hierarchy. 

This endpoint creates line items, sub-accounts, subtotals, or markups at the specified location in your budget structure. The target account must already exist in the budget hierarchy.

Use `accountId: "root"` to add lines at the top level of your budget.

   */
  async createBudgetLines(_data: Types.CreateBudgetInput): Promise<Types.Budget> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Get budget line
   * Retrieve a specific budget line by its identifier.

The lineId parameter accepts both user-friendly IDs and system IDs:
- With `idMode=user` (default): Use account codes like "1100" or "camera-dept"
- With `idMode=system`: Use UUIDs/nanoids like "abc123xyz" or "550e8400-e29b-41d4-a716"

   */
  async getBudgetLine(_params?: {
    tags?: string | string[];
    tagFilterMode?: 'contains' | 'excludes';
    expands?: 'contact' | 'phaseData'[];
  }): Promise<Types.BudgetLine> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Update budget line
   * Update an existing budget line with new values.

The lineId in the path accepts both ID formats based on the idMode in the request body:
- User-friendly IDs: Account codes like "2150" or descriptive IDs
- System IDs: Database identifiers when idMode is set to "system"

   */
  async updateBudgetLine(_data: Types.UpdateBudgetLineRequest): Promise<Types.BudgetLine> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Delete budget line
   * Delete a budget line from the project.

The lineId parameter accepts both ID formats:
- With `idMode=user` (default): Use human-readable IDs
- With `idMode=system`: Use system-generated IDs

   */
  async deleteBudgetLine(): Promise<unknown> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * List actuals
   * Retrieve actual spending data for a project
   */
  async listProjectActuals(_params?: {
    accountId?: string | string[];
    hasAssignedAccount?: boolean;
    hasLinkedTransaction?: boolean;
    sourceIds?: string[];
    expands?: 'contact' | 'subactual' | 'account' | 'subactual.account'[];
  }): Promise<{
  actuals?: Types.Actual[];
  totalAmount?: number;
}> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Get actual
   * Retrieve a specific actual entry
   */
  async getActual(_params?: {
    expands?: 'contact' | 'subactual' | 'account'[];
  }): Promise<Types.Actual> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Create actual
   * Create a new actual entry for a project
   */
  async createActual(_data: Types.CreateActualInput): Promise<Types.Actual> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Update actual
   * Update an existing actual entry
   */
  async updateActual(_data: Types.UpdateActualInput): Promise<Types.Actual> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Delete actual
   * Delete an actual entry
   */
  async deleteActual(): Promise<unknown> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Upload actual attachment
   * Upload a receipt or other supporting document for an actual.
Accepts PDF or image files up to 10&nbsp;MB.
   */
  async uploadActualAttachment(): Promise<Types.File> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * List purchase orders
   * Retrieve purchase orders for a project
   */
  async listPurchaseOrders(_params?: {
    accountId?: string | string[];
    status?: 'draft' | 'approved' | 'rejected' | 'pending' | 'paid' | 'draft' | 'approved' | 'rejected' | 'pending' | 'paid'[];
    expands?: 'contact' | 'actuals' | 'purchaseOrderItems' | 'purchaseOrderItems.account'[];
  }): Promise<{
  purchaseOrders?: Types.PurchaseOrder[];
}> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Get purchase order
   * Retrieve a specific purchase order
   */
  async getPurchaseOrder(_params?: {
    expands?: 'contact' | 'actuals' | 'purchaseOrderItems' | 'purchaseOrderItems.account'[];
  }): Promise<Types.PurchaseOrder> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Create purchase order
   * Create a new purchase order for a project
   */
  async createPurchaseOrder(_data: Types.CreatePurchaseOrderInput): Promise<Types.PurchaseOrder> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Update purchase order
   * Update an existing purchase order
   */
  async updatePurchaseOrder(_data: Types.UpdatePurchaseOrderInput): Promise<Types.PurchaseOrder> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Delete purchase order
   * Delete a purchase order
   */
  async deletePurchaseOrder(): Promise<unknown> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Upload purchase order attachment
   * Upload a supporting document for a purchase order.
Accepts PDF or image files up to 10&nbsp;MB.
   */
  async uploadPurchaseOrderAttachment(): Promise<Types.File> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * List budget phases
   * Retrieve all budget phases for a project
   */
  async listBudgetPhases(): Promise<{
  phases?: Types.Phase[];
}> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Create budget phase
   * Create a new budget phase for a project
   */
  async createBudgetPhase(_data: Types.CreatePhaseRequest): Promise<Types.Phase> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Get budget phase
   * Retrieve a specific budget phase
   */
  async getBudgetPhase(): Promise<Types.Phase> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Update budget phase
   * Update an existing budget phase
   */
  async updateBudgetPhase(_data: Types.UpdatePhaseRequest): Promise<Types.Phase> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Delete budget phase
   * Delete a budget phase from a project
   */
  async deleteBudgetPhase(): Promise<unknown> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * List budget fringes
   * Retrieve all fringe benefits for a project
   */
  async listBudgetFringes(): Promise<{
  fringes?: Types.Fringe[];
}> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Create budget fringe
   * Create a new fringe benefit for a project
   */
  async createBudgetFringe(_data: Types.CreateFringeRequest): Promise<Types.Fringe> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Get budget fringe
   * Retrieve a specific fringe benefit
   */
  async getBudgetFringe(): Promise<Types.Fringe> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Update budget fringe
   * Update an existing fringe benefit
   */
  async updateBudgetFringe(_data: Types.UpdateFringeRequest): Promise<Types.Fringe> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Delete budget fringe
   * Delete a fringe benefit from a project
   */
  async deleteBudgetFringe(): Promise<unknown> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * List budget globals
   * Retrieve all global variables for a project
   */
  async listBudgetGlobals(): Promise<{
  globals?: Types.Global[];
}> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Create budget global
   * Create a new global variable for a project
   */
  async createBudgetGlobal(_data: Types.CreateGlobalRequest): Promise<Types.Global> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Get budget global
   * Retrieve a specific global variable
   */
  async getBudgetGlobal(): Promise<Types.Global> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Update budget global
   * Update an existing global variable
   */
  async updateBudgetGlobal(_data: Types.UpdateGlobalRequest): Promise<Types.Global> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Delete budget global
   * Delete a global variable from a project
   */
  async deleteBudgetGlobal(): Promise<unknown> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * List project comments
   * Retrieve all comments for a project's budget
   */
  async listProjectComments(_params?: {
    accountId?: string;
    lineId?: string;
  }): Promise<{
  comments?: Types.Comment[];
}> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * List spaces
   * Retrieve all project spaces/folders in the workspace
   */
  async listSpaces(_params?: {
    archived?: boolean;
    search?: string;
    expands?: 'projects'[];
  }): Promise<{
  spaces?: Types.Space[];
}> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Create space
   * Create a new project space/folder
   */
  async createSpace(_data: Types.CreateSpaceInput): Promise<Types.Space> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Get space
   * Retrieve a specific space by ID or alias
   */
  async getSpace(_params?: {
    expands?: 'projects'[];
  }): Promise<Types.Space> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Update space
   * Update an existing space
   */
  async updateSpace(_data: Types.UpdateSpaceInput): Promise<Types.Space> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Delete space
   * Soft delete a space (must not contain active projects)
   */
  async deleteSpace(): Promise<unknown> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Upload file
   * Upload a file to project storage. Accepts PDF or image files up to 10&nbsp;MB.
   */
  async uploadFile(): Promise<Types.File> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Download file
   * Download/stream a file
   */
  async downloadFile(): Promise<unknown> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Delete file
   * Delete a file from storage
   */
  async deleteFile(): Promise<unknown> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * List project tags
   * Retrieve all tags for a project with optional filtering and sorting.

Tags are used for categorizing budget line items and enable advanced filtering
capabilities across budget data. Each tag includes financial totals aggregated
from all associated budget line items.

   */
  async listProjectTags(_params?: {
    name?: string;
    sortBy?: 'name';
    sortOrder?: 'asc' | 'desc';
  }): Promise<Types.TagsResponse> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Create project tag
   * Create a new tag for the project. Tags are used to categorize budget line items
and enable advanced filtering capabilities.

Note: Tag names cannot be changed after creation. Only the color can be updated.

   */
  async createProjectTag(_data: Types.CreateTagRequest): Promise<Types.TagResponse> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Get project tag
   * Retrieve a specific tag by ID, including its financial totals aggregated
from all associated budget line items.

   */
  async getProjectTag(): Promise<Types.TagResponse> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Update project tag
   * Update a tag's properties. Currently, only the color can be updated.
Tag names and descriptions cannot be modified after creation.

   */
  async updateProjectTag(_data: Types.UpdateTagRequest): Promise<Types.TagResponse> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Delete project tag
   * Delete a tag and remove all its assignments from budget line items.
This operation cannot be undone.

   */
  async deleteProjectTag(): Promise<unknown> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * List contacts
   * Retrieve contacts with optional filtering
   */
  async listContacts(_params?: {
    projectIds?: string[];
    accountId?: string | string[];
    origin?: 'onboarding' | 'manual'[];
    hasLinkedUser?: boolean;
    hasTaxDocuments?: boolean;
    email?: string;
    title?: string;
    expands?: 'secureInfo' | 'origin' | 'projects' | 'projects.accounts' | 'startwork' | 'taxDocuments' | 'attachments' | 'bankInfo' | 'linkedUser'[];
  }): Promise<{
  contacts?: Types.Contact[];
}> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Create contact
   * Create a new contact
   */
  async createContact(_data: Types.CreateContactInput): Promise<Types.Contact> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Get contact
   * Retrieve a specific contact by ID or alias
   */
  async getContact(): Promise<Types.Contact> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Update contact
   * Update an existing contact
   */
  async updateContact(_data: Types.UpdateContactInput): Promise<Types.Contact> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Upload tax document
   * Upload a tax document (e.g., W-9) for a contact.
Accepts PDF or image files up to 10&nbsp;MB.
   */
  async uploadContactTaxDocument(): Promise<Types.File> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Upload attachment
   * Upload a file to a contact profile.
Accepts PDF or image files up to 10&nbsp;MB.
   */
  async uploadContactAttachment(): Promise<Types.File> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * List transactions
   * Retrieve financial transactions with comprehensive filtering
   */
  async listTransactions(_params?: {
    type?: 'bank.deposit' | 'bank.withdrawal' | 'bank.ach' | 'bank.wire' | 'card.spend' | 'card.payment' | 'card.dispute' | 'card.refund' | 'card.cashback'[];
    status?: 'posted' | 'pending' | 'void'[];
    subStatus?: 'settled' | 'refund' | 'reverse' | 'rejected'[];
    projectId?: string | string[];
    sourceType?: string | string[];
    sourceName?: string | string[];
    sourceLast4?: string | string[];
    description?: string;
    merchant?: string;
    contactTitle?: string;
    hasAccount?: boolean;
    isActualized?: boolean;
    hasContact?: boolean;
    expands?: 'project' | 'contact' | 'account' | 'actual' | 'attachments'[];
  }): Promise<{
  transactions?: Types.Transaction[];
}> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Get transaction
   * Retrieve a specific transaction by ID
   */
  async getTransaction(): Promise<Types.Transaction> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Update transaction
   * Update an existing transaction
   */
  async updateTransaction(_data: Types.UpdateTransactionInput): Promise<Types.Transaction> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Upload transaction attachment
   * Upload an attachment for a transaction
   */
  async uploadTransactionAttachment(): Promise<Types.File> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * List workspace rates
   * Retrieve all rates from the workspace
   */
  async listWorkspaceRates(_params?: {
    expands?: 'contact'[];
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
  rates?: Types.Rate[];
}> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Create workspace rate
   * Create a new rate in the workspace
   */
  async createWorkspaceRate(_data: Types.CreateRateInput): Promise<Types.Rate> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Update workspace rate
   * Update a rate in the workspace
   */
  async updateWorkspaceRate(_rateId: string, _data: Types.UpdateRateInput): Promise<Types.Rate> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Delete workspace rate
   * Delete a rate from the workspace
   */
  async deleteWorkspaceRate(_rateId: string): Promise<unknown> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * List public rates
   * Retrieve all public rates accessible across workspaces
   */
  async listPublicRates(_params?: {
    search?: string;
    includeArchived?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: 'name' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
  rates?: Types.PublicRate[];
}> {
    // Implementation will be added
    throw new Error('Not implemented');
  }

  /**
   * Get rates from public ratepack
   * Retrieve all rates from a public ratepack (read-only access)
   */
  async getPublicRatepackRates(_rateId: string, _params?: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
  rates?: Types.Rate[];
}> {
    // Implementation will be added
    throw new Error('Not implemented');
  }
}
