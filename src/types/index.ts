// Generated from OpenAPI specification
// Do not edit manually

export interface Project {
  id: string;
  name: string | null;
  icon: string | null;
  imageUrl: string | null;
  spaceId: string | null;
  space: {
    id?: string;
    name?: string;
  } | null;
  templateId: string | null;
  template: {
    id?: string;
    name?: string;
  } | null;
  status: 'active' | 'archived';
  labels?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string | null;
  icon: string | null;
  imageUrl: string | null;
  spaceId: string | null;
  status?: 'active' | 'archived';
  templateId: string | null;
  labels?: string[];
}

export interface UpdateProjectInput {
  name: string | null;
  icon: string | null;
  imageUrl: string | null;
  spaceId: string | null;
  status?: 'active' | 'archived';
  labels?: string[];
}

export interface CreateBudgetInput {
  accountId?: string;
  lines?: {
    type?: 'line' | 'account' | 'subtotal' | 'markup';
    accountId?: string;
    description?: string;
    phaseData?: Record<string, unknown>;
  }[];
  insert?: {
    mode?: 'append' | 'prepend' | 'after' | 'before';
    lineId?: string;
  };
  idMode?: 'user' | 'system';
}

export interface Budget {
  account: Account;
  subAccounts?: Record<string, unknown>;
  phases?: Phase[];
  fringes?: Fringe[];
  globals?: Global[];
}

export interface Account {
  id: string;
  accountId: string | null;
  description: string | null;
  path: string;
  lines: BudgetLine[];
  totals: Record<string, unknown>;
  contact?: Contact;
}

export interface BudgetLine {
  type: 'line' | 'account' | 'subtotal' | 'markup' | 'fringes';
  id: string;
  accountId: string | null;
  description: string | null;
  path: string;
  totals: Record<string, unknown>;
  tags?: string[];
  contact?: Contact;
  phaseData?: Record<string, unknown>;
}

export type BudgetLineItem = unknown;

export type BudgetAccountLine = unknown;

export type BudgetSubtotalLine = unknown;

export type BudgetMarkupLine = unknown;

export type BudgetFringeLine = unknown;

export interface LinePhaseData {
  quantity: number | null;
  unit: string | null;
  rate: number | null;
  multiplier: number | null;
  fringes?: string[];
  date?: {
    startDate: string | null;
    endDate: string | null;
  };
  overtime: number | null;
  overtimeDetail?: OvertimeDetail;
  quantityFormula?: string;
  rateFormula?: string;
  multiplierFormula?: string;
  fringeTotal?: number;
  fringeBreakdown?: Record<string, unknown>;
}

export interface FringeBreakdown {
  id: string;
  code: string | null;
  amount: number;
}

export interface OvertimeDetail {
  mode: 'formula' | 'flat';
  flatAmount?: number;
  overtimeHours?: number;
  baseHours: number;
  multipliers?: {
    threshold?: number;
    multiplier?: number;
  }[];
}

export interface Phase {
  type: 'estimate' | 'actual' | 'rollup' | 'committed';
  id: string;
  alias: string;
  name: string | null;
  isHidden: boolean;
  isLocked: boolean;
  currency: {
    code: string | null;
    symbol: string | null;
    exchangeRate: number | null;
  } | null;
  operation?: 'sum' | 'difference';
  phaseIds?: string[];
}

export interface Fringe {
  id: string;
  code: string | null;
  description: string | null;
  units: 'percent' | 'flat';
  rate: number | null;
  cutoff: number | null;
}

export interface Global {
  id: string;
  symbol: string | null;
  description: string | null;
  unit: string | null;
  formula: string | null;
}

export interface Actual {
  id: string;
  description: string | null;
  amount: number | null;
  date: string | null;
  accountId?: string | string[];
  expanded: boolean;
  type?: string;
  attachments?: File[];
  ref: string | null;
  payId: string | null;
  status?: string;
  notes: string | null;
  tags?: string[];
  purchaseOrderId: string | null;
  transactionId: string | null;
  contact?: Contact;
  subactuals?: SubActual[];
  account?: BudgetLine;
}

export interface SubActual {
  id: string;
  description: string | null;
  amount: number;
  date: string | null;
  accountId: string | null;
  account?: BudgetLine;
}

export interface Contact {
  id: string;
  contactTitle: string | null;
  name: string | null;
  email: string | null;
  company: string | null;
  type: string | null;
  jobTitle: string | null;
  rate: number | null;
  secureInfo?: ContactSecureInfo;
  origin?: ContactOrigin;
  startwork?: ContactStartwork[];
  linkedUser?: ContactUser;
  bankInfo?: ContactBankAccount[];
  taxDocuments?: File[];
  attachments?: File[];
  projects?: Record<string, unknown>;
}

export interface ContactSecureInfo {
  address: string | null;
  phone: string | null;
  taxIdLast4: string | null;
}

export interface ContactOrigin {
  origin: 'onboarding' | 'manual' | null;
  createdAt: string | null;
  createdByUser?: ContactUser;
}

export interface ContactStartwork {
  id: string;
  title: string;
  signedOn: string;
}

export interface ContactUser {
  id: string;
  name: string;
  email: string;
}

export interface ContactBankAccount {
  id: string;
  bankName: string;
  accountType: string;
  accountLast4: string;
}

export interface CreateContactInput {
  name: string;
  email?: string;
  company?: string;
  type?: 'Person' | 'Company';
  jobTitle?: string;
  rate?: number;
  phone?: string;
  address?: string;
  taxIdLast4?: string;
}

export interface UpdateContactInput {
  name?: string;
  email?: string;
  company?: string;
  type?: 'Person' | 'Company';
  jobTitle?: string;
  rate?: number;
  phone?: string;
  address?: string;
  taxIdLast4?: string;
}

export interface ContactProject {
  id: string;
  name: string;
  alias: string;
  accounts?: ContactProjectAccount[];
}

export interface ContactProjectAccount {
  accountId: string;
  accountNumber: string;
  accountName: string;
}

export interface PurchaseOrder {
  id: string;
  purchaseOrderId: string | null;
  title: string | null;
  date: string | null;
  amount: number;
  paidAmount: number;
  status: 'draft' | 'approved' | 'rejected' | 'pending' | 'paid';
  attachments?: File[];
  notes: string | null;
  items?: PurchaseOrderItem[];
  contact?: Contact;
  actuals?: Actual[];
}

export interface CreatePurchaseOrderInput {
  purchaseOrderId?: string;
  title?: string;
  date?: string;
  amount: number;
  status?: 'draft' | 'approved' | 'rejected' | 'pending' | 'paid';
  notes?: string;
  contactId?: string;
  items?: CreatePurchaseOrderItemInput[];
}

export interface UpdatePurchaseOrderInput {
  purchaseOrderId?: string;
  title?: string;
  date?: string;
  amount?: number;
  status?: 'draft' | 'approved' | 'rejected' | 'pending' | 'paid';
  notes?: string;
  contactId?: string;
}

export interface CreatePurchaseOrderItemInput {
  description?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  accountId?: string;
}

export interface CreateActualInput {
  description: string;
  amount: number;
  date: string;
  accountId?: string | string[];
  ref?: string;
  payId?: string;
  status?: string;
  notes?: string;
  tags?: string[];
  purchaseOrderId?: string;
  transactionId?: string;
  contactId?: string;
}

export interface UpdateActualInput {
  description?: string;
  amount?: number;
  date?: string;
  accountId?: string | string[];
  ref?: string;
  payId?: string;
  status?: string;
  notes?: string;
  tags?: string[];
  purchaseOrderId?: string;
  transactionId?: string;
  contactId?: string;
}

export interface UpdateTransactionInput {
  projectId?: string;
  accountId?: string;
  contactId?: string;
  description?: string;
  notes?: string;
}

export interface PurchaseOrderItem {
  id: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  accountId: string | null;
  account?: BudgetLine;
}

export interface Transaction {
  id: string;
  type:
    | 'bank.deposit'
    | 'bank.withdrawal'
    | 'bank.ach'
    | 'bank.wire'
    | 'card.spend'
    | 'card.payment'
    | 'card.dispute'
    | 'card.refund'
    | 'card.cashback';
  status: 'posted' | 'pending' | 'void';
  subStatus: 'settled' | 'refund' | 'reverse' | 'rejected' | null;
  description: string;
  amount: number;
  date: string;
  projectId: string | null;
  hasAccount: boolean;
  isActualized: boolean;
  source?: TransactionSource;
  attachments?: File[];
  contact?: Contact;
  project?: Project;
  account?: BudgetLine;
  actual?: Actual;
}

export interface TransactionSource {
  id: string;
  type: string;
  name: string;
  last4: string;
}

export interface File {
  id: string;
  name: string;
  type: string;
  size: number;
}

export interface Space {
  id: string;
  alias: string;
  name: string;
  image: string | null;
  archived: boolean;
  projectCount?: number;
  projects?: Project[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSpaceInput {
  name: string;
  image: string | null;
  archived?: boolean;
}

export interface UpdateSpaceInput {
  name?: string;
  image: string | null;
  archived?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  accountId: string | null;
  lineId: string | null;
  author: {
    id?: string;
    name?: string;
    email?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface RateMetadata {
  id: string;
  name: string;
  description: string | null;
  versions: string[];
  latestVersion: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PublicRate = unknown;

export interface Rate {
  id: string;
  name: string | null;
  emoji: string | null;
  description: string | null;
  note: string | null;
  quantity: number | null;
  rate: number | null;
  unit:
    | 'hour'
    | 'day'
    | 'week'
    | 'month'
    | 'year'
    | 'each'
    | 'sqft'
    | 'sqm'
    | 'lnft'
    | 'lnm'
    | null;
  multiplier: number | null;
  contactId: string | null;
  sort: string;
  agreement?: string;
  local?: string;
  effectiveDate?: string;
  expirationDate?: string;
  labels?: string[];
  contact?: Contact;
}

export interface CreateRateInput {
  name?: string;
  emoji?: string;
  description?: string;
  note?: string;
  quantity?: number;
  rate?: number;
  unit?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'each' | 'sqft' | 'sqm' | 'lnft' | 'lnm';
  multiplier?: number;
  contactId?: string;
}

export interface UpdateRateInput {
  name?: string;
  emoji?: string;
  description?: string;
  note?: string;
  quantity?: number;
  rate?: number;
  unit?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'each' | 'sqft' | 'sqm' | 'lnft' | 'lnm';
  multiplier?: number;
  contactId?: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  description?: string;
}

export interface CreateTagRequest {
  name: string;
  color?: string;
  description?: string;
}

export interface UpdateTagRequest {
  color?: string;
}

export interface CreatePhaseRequest {
  name: string;
  type: 'estimate' | 'actual' | 'rollup' | 'committed';
  color?:
    | 'red'
    | 'rose'
    | 'pink'
    | 'fuchsia'
    | 'purple'
    | 'violet'
    | 'indigo'
    | 'blue'
    | 'sky'
    | 'cyan'
    | 'teal'
    | 'green'
    | 'yellow'
    | 'amber'
    | 'orange';
  currency: {
    code: string | null;
    symbol: string | null;
    exchangeRate: number | null;
  } | null;
  copyPhase?: string;
  isHidden?: boolean;
  phaseIds?: string[];
  operation?: 'sum' | 'difference';
  idMode?: 'user' | 'system';
}

export interface UpdatePhaseRequest {
  name?: string;
  color?:
    | 'red'
    | 'rose'
    | 'pink'
    | 'fuchsia'
    | 'purple'
    | 'violet'
    | 'indigo'
    | 'blue'
    | 'sky'
    | 'cyan'
    | 'teal'
    | 'green'
    | 'yellow'
    | 'amber'
    | 'orange';
  currency: {
    code: string | null;
    symbol: string | null;
    exchangeRate: number | null;
  } | null;
  isHidden?: boolean;
  idMode?: 'user' | 'system';
}

export interface CreateFringeRequest {
  code: string;
  description?: string;
  units: 'percent' | 'flat';
  rate: number;
  cutoff: number | null;
  idMode?: 'user' | 'system';
}

export interface UpdateFringeRequest {
  code?: string;
  description?: string;
  units?: 'percent' | 'flat';
  rate?: number;
  cutoff: number | null;
  idMode?: 'user' | 'system';
}

export interface CreateGlobalRequest {
  symbol: string;
  description: string;
  formula: string;
  unit?: string;
  idMode?: 'user' | 'system';
}

export interface UpdateGlobalRequest {
  symbol?: string;
  description?: string;
  formula?: string;
  unit?: string;
  idMode?: 'user' | 'system';
}

export interface UpdateBudgetLineRequest {
  description: string | null;
  accountId: string | null;
  convertToAccount?: boolean;
  phaseData?: Record<string, unknown>;
  idMode?: 'user' | 'system';
}

export interface TagTotals {
  phaseTotals: Record<string, unknown>;
  fringeTotals: Record<string, unknown>;
  actualTotal: number;
}

export type TagResponse = unknown;

export interface TagsResponse {
  tags: TagResponse[];
}

export interface Error {
  error: string;
  details?: Record<string, unknown>;
  code?: string;
}

export interface ErrorResponse {
  error: string;
  details?: Record<string, unknown>;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface ExpandParams {
  expands?: string[];
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

export interface TaxDocument {
  id: string;
  type: string;
  filename: string;
  url: string;
  uploadedAt: string;
}

export interface UploadResponse {
  id: string;
  url: string;
  filename: string;
  size: number;
}

export interface WorkspaceRate {
  id: string;
  lineItemId?: string;
  contactId?: string;
  rate: number;
  unit: string;
  currency: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkspaceRateInput {
  lineItemId?: string;
  contactId?: string;
  rate: number;
  unit: string;
  currency?: string;
  tags?: string[];
}

export interface UpdateWorkspaceRateInput {
  lineItemId?: string;
  contactId?: string;
  rate?: number;
  unit?: string;
  currency?: string;
  tags?: string[];
}

export interface CreateTagInput {
  name: string;
  color?: string;
}

export interface UpdateTagInput {
  name?: string;
  color?: string;
}
