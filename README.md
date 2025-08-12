# @saturation-api/js

Official TypeScript SDK for the Saturation API. Build powerful integrations with your workspace data including projects, budgets, actuals, contacts, purchase orders, and attachments.

[![npm version](https://badge.fury.io/js/%40saturation-api%2Fjs.svg)](https://www.npmjs.com/package/@saturation-api/js)
[![CI](https://github.com/saturation-api/saturation-js/actions/workflows/ci.yml/badge.svg)](https://github.com/saturation-api/saturation-js/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Full TypeScript Support** - Auto-generated types from OpenAPI specification
- 📦 **Universal JavaScript** - Works in Node.js, browsers, and React Native
- 🌐 **Browser Compatible** - CORS-friendly with native fetch API support
- 🔄 **Real-time Collaboration** - Changes appear instantly in the web app
- 🎯 **Type-Safe** - Complete type coverage for all API endpoints
- 🛠️ **Developer Friendly** - Intuitive API with comprehensive documentation
- ⚡ **Lightweight** - Minimal dependencies, optimized bundle size

## Installation

```bash
npm install @saturation-api/js
# or
yarn add @saturation-api/js
# or
pnpm add @saturation-api/js
```

## Quick Start

```typescript
import { Saturation } from '@saturation-api/js';

// Initialize the client
const client = new Saturation({
  apiKey: 'YOUR_API_KEY',
  baseURL: 'https://api.saturation.io/api/v1', // Optional, this is the default
});

// List all projects
const { projects } = await client.listProjects({ status: 'active' });
console.log('Active projects:', projects);

// Get a specific project with its budget
const budget = await client.getProjectBudget('nike-swoosh-commercial', {
  expands: ['phases', 'fringes', 'lines.contact', 'lines.phaseData'],
});
console.log('Project budget:', budget);
```

## Authentication

Get your API key from the Saturation web app:
1. Go to Settings → API Keys
2. Create a new API key
3. Copy the key and use it in your application

```typescript
const client = new Saturation({
  apiKey: process.env.SATURATION_API_KEY!,
});
```

## Core Concepts

### Projects

Projects are the main organizational unit in Saturation. Each project contains budgets, actuals, purchase orders, and other related data.

```typescript
// Create a new project
const project = await client.createProject({
  name: 'Nike Holiday Commercial',
  icon: '🎬',
  spaceId: 'commercial-productions',
  status: 'active',
  labels: ['nike', 'q4-2024', 'commercial'],
});

// Update project details
const updated = await client.updateProject(project.id, {
  status: 'archived',
  labels: ['completed', 'q4-2024'],
});

// List projects with filters
const { projects } = await client.listProjects({
  status: 'active',
  labels: ['nike', 'commercial'],
  spaceId: 'commercial-productions',
});
```

### Budget Management

Work with multi-phase budgets, including line items, accounts, subtotals, and markups.

```typescript
// Get complete budget with all details
const budget = await client.getProjectBudget('my-project', {
  expands: ['phases', 'fringes', 'globals', 'lines.contact'],
  idMode: 'user', // Use human-readable IDs
});

// Add budget lines
const updatedBudget = await client.createBudgetLines('my-project', {
  accountId: 'root',
  lines: [
    {
      type: 'line',
      accountId: '1100',
      description: 'Director',
      phaseData: {
        estimate: { amount: 50000 },
        actual: { amount: 48000 },
      },
    },
    {
      type: 'account',
      accountId: '2000',
      description: 'Camera Department',
    },
  ],
});

// Update a specific budget line
const line = await client.updateBudgetLine('my-project', '1100-DIRECTOR', {
  description: 'Director - Extended Cut',
  tags: ['above-the-line', 'key-personnel'],
});
```

### Budget Phases

Manage different budget phases like estimate, revised, and actual.

```typescript
// Create a new phase
const phase = await client.createBudgetPhase('my-project', {
  name: 'revised',
  label: 'Revised Budget',
  color: '#FFA500',
  order: 2,
});

// List all phases
const { phases } = await client.listBudgetPhases('my-project');

// Update phase details
await client.updateBudgetPhase('my-project', phase.id, {
  label: 'Revised Budget v2',
});
```

### Actuals Tracking

Track actual expenses and sync with your accounting system.

```typescript
// Create an actual
const actual = await client.createActual('my-project', {
  lineItemId: '2150-CAMERA',
  amount: 35000,
  date: '2024-03-20',
  description: 'RED Camera Package Rental',
  contactId: 'vendor-123',
  tags: ['equipment', 'week-2'],
});

// List actuals with filters
const { actuals } = await client.listProjectActuals('my-project', {
  dateFrom: '2024-03-01',
  dateTo: '2024-03-31',
  lineItemId: ['2150-CAMERA', '2160-LENSES'],
  expands: ['contact', 'attachments'],
});

// Upload attachment to actual
const attachment = await client.uploadActualAttachment(
  'my-project',
  actual.id,
  fileBuffer,
  'invoice-12345.pdf'
);
```

### Purchase Orders

Manage purchase orders with line-item level detail.

```typescript
// Create a purchase order
const po = await client.createPurchaseOrder('my-project', {
  number: 'PO-001',
  contactId: 'vendor-456',
  date: '2024-03-15',
  items: [
    {
      lineItemId: '2150-CAMERA',
      amount: 35000,
      description: 'Camera equipment rental - 5 days',
    },
    {
      lineItemId: '2160-LENSES',
      amount: 8000,
      description: 'Lens kit rental',
    },
  ],
  tags: ['equipment', 'approved'],
});

// List purchase orders
const { purchaseOrders } = await client.listPurchaseOrders('my-project', {
  contactId: 'vendor-456',
  hasAttachments: true,
  expands: ['items.lineItem', 'contact'],
});
```

### Contacts Management

Manage vendors, crew members, and other contacts.

```typescript
// Create a contact
const contact = await client.createContact({
  name: 'John Smith',
  email: 'john@example.com',
  phone: '+1234567890',
  type: 'individual',
  companyName: 'Smith Productions',
  address: '123 Main St, Los Angeles, CA 90001',
});

// Search contacts
const { contacts } = await client.listContacts({
  name: 'Smith',
  type: 'individual',
  companyName: 'Productions',
});

// Upload tax documents
const taxDoc = await client.uploadContactTaxDocument(
  contact.id,
  w9Buffer,
  'W9-2024.pdf'
);
```

### Workspace Rates

Define custom rates for line items and contacts.

```typescript
// Create a rate
const rate = await client.createWorkspaceRate({
  lineItemId: '1100-DIRECTOR',
  contactId: 'contact-789',
  rate: 1500,
  unit: 'day',
  currency: 'USD',
  tags: ['union', 'tier-1'],
});

// List rates with filters
const { rates } = await client.listWorkspaceRates({
  lineItemId: '1100-DIRECTOR',
  tags: ['union'],
});
```

### File Uploads

Upload and manage file attachments.

```typescript
// Upload a file
const upload = await client.uploadFile(fileBuffer, 'document.pdf');

// Download a file
const fileContent = await client.downloadFile(upload.id);

// Delete a file
await client.deleteFile(upload.id);
```

## React Examples

The SDK works seamlessly in React applications. Here are some common patterns:

### Basic React Hook

```tsx
import { useState, useEffect } from 'react';
import { Saturation, Project } from '@saturation-api/js';

const client = new Saturation({
  apiKey: process.env.REACT_APP_SATURATION_API_KEY!,
});

function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    client.listProjects({ status: 'active' })
      .then(({ projects }) => setProjects(projects))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { projects, loading, error };
}

// Usage in component
function ProjectList() {
  const { projects, loading, error } = useProjects();

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {projects.map(project => (
        <li key={project.id}>
          {project.icon} {project.name}
        </li>
      ))}
    </ul>
  );
}
```

### Budget Dashboard Component

```tsx
import React, { useState, useEffect } from 'react';
import { Saturation, Budget } from '@saturation-api/js';

interface BudgetDashboardProps {
  projectId: string;
  apiKey: string;
}

export function BudgetDashboard({ projectId, apiKey }: BudgetDashboardProps) {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = new Saturation({ apiKey });

    client.getProjectBudget(projectId, {
      expands: ['phases', 'fringes', 'lines.contact'],
    })
      .then(setBudget)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId, apiKey]);

  if (loading) return <div>Loading budget...</div>;
  if (!budget) return <div>No budget found</div>;

  return (
    <div className="budget-dashboard">
      <h2>Budget Overview</h2>
      <div className="budget-totals">
        <div>Total: ${budget.account.totals.estimate || 0}</div>
        <div>Actual: ${budget.account.totals.actual || 0}</div>
      </div>
      
      <h3>Budget Lines</h3>
      <table>
        <thead>
          <tr>
            <th>Account</th>
            <th>Description</th>
            <th>Estimate</th>
            <th>Actual</th>
          </tr>
        </thead>
        <tbody>
          {budget.account.lines.map(line => (
            <tr key={line.id}>
              <td>{line.accountId}</td>
              <td>{line.description}</td>
              <td>${line.totals.estimate || 0}</td>
              <td>${line.totals.actual || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Create Actual Form

```tsx
import React, { useState } from 'react';
import { Saturation, CreateActualInput } from '@saturation-api/js';

interface ActualFormProps {
  projectId: string;
  client: Saturation;
  onSuccess: () => void;
}

export function CreateActualForm({ projectId, client, onSuccess }: ActualFormProps) {
  const [formData, setFormData] = useState<CreateActualInput>({
    lineItemId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await client.createActual(projectId, formData);
      onSuccess();
      // Reset form
      setFormData({
        lineItemId: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
    } catch (error) {
      console.error('Failed to create actual:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Line Item ID (e.g., 2150-CAMERA)"
        value={formData.lineItemId}
        onChange={(e) => setFormData({ ...formData, lineItemId: e.target.value })}
        required
      />
      
      <input
        type="number"
        placeholder="Amount"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
        required
      />
      
      <input
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        required
      />
      
      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />
      
      <button type="submit" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create Actual'}
      </button>
    </form>
  );
}
```

### React Context Provider

```tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { Saturation } from '@saturation-api/js';

const SaturationContext = createContext<Saturation | null>(null);

interface SaturationProviderProps {
  apiKey: string;
  baseURL?: string;
  children: ReactNode;
}

export function SaturationProvider({ apiKey, baseURL, children }: SaturationProviderProps) {
  const client = React.useMemo(
    () => new Saturation({ apiKey, baseURL }),
    [apiKey, baseURL]
  );

  return (
    <SaturationContext.Provider value={client}>
      {children}
    </SaturationContext.Provider>
  );
}

export function useSaturation() {
  const client = useContext(SaturationContext);
  if (!client) {
    throw new Error('useSaturation must be used within a SaturationProvider');
  }
  return client;
}

// Usage in your app
function App() {
  return (
    <SaturationProvider apiKey={process.env.REACT_APP_SATURATION_API_KEY!}>
      <YourComponents />
    </SaturationProvider>
  );
}
```

### File Upload Component

```tsx
import React, { useState } from 'react';
import { useSaturation } from './SaturationProvider';

interface FileUploadProps {
  projectId: string;
  actualId: string;
  onUploadComplete: () => void;
}

export function FileUpload({ projectId, actualId, onUploadComplete }: FileUploadProps) {
  const client = useSaturation();
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Convert File to Blob for the SDK
      const blob = new Blob([await file.arrayBuffer()], { type: file.type });
      
      await client.uploadActualAttachment(
        projectId,
        actualId,
        blob,
        file.name
      );
      
      onUploadComplete();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileSelect}
        disabled={uploading}
        accept=".pdf,.jpg,.jpeg,.png"
      />
      {uploading && <span>Uploading...</span>}
    </div>
  );
}
```

### Next.js API Route

For server-side usage in Next.js:

```typescript
// pages/api/projects.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Saturation } from '@saturation-api/js';

const client = new Saturation({
  apiKey: process.env.SATURATION_API_KEY!,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      const { projects } = await client.listProjects({ status: 'active' });
      res.status(200).json(projects);
    } else if (req.method === 'POST') {
      const project = await client.createProject(req.body);
      res.status(201).json(project);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

## Advanced Usage

### Error Handling

The SDK provides detailed error information with proper TypeScript types.

```typescript
import { SaturationError } from '@saturation-api/js';

try {
  const project = await client.getProject('non-existent');
} catch (error) {
  if (error instanceof SaturationError) {
    console.error(`API Error ${error.statusCode}: ${error.message}`);
    console.error('Details:', error.details);
    
    switch (error.statusCode) {
      case 401:
        // Handle authentication error
        break;
      case 404:
        // Handle not found
        break;
      case 429:
        // Handle rate limiting
        break;
    }
  }
}
```

### Using Expands

Many endpoints support the `expands` parameter to include related data in a single request.

```typescript
// Get budget with all related data
const budget = await client.getProjectBudget('my-project', {
  expands: [
    'phases',           // Include all budget phases
    'fringes',          // Include fringe calculations
    'globals',          // Include global calculations
    'lines.contact',    // Include contact info for each line
    'lines.phaseData',  // Include phase-specific data
  ],
});

// Get actuals with full details
const { actuals } = await client.listProjectActuals('my-project', {
  expands: [
    'contact',          // Include contact information
    'attachments',      // Include file attachments
    'lineItem',         // Include budget line details
  ],
});
```

### Using Your Account Codes

The API supports using your existing account codes as identifiers.

```typescript
// Use your account codes directly
const line = await client.getBudgetLine('my-project', '1100-LABOR');
const updated = await client.updateBudgetLine('my-project', '2150-CAMERA', {
  description: 'Camera Equipment - Updated',
});

// Create actuals with your codes
await client.createActual('my-project', {
  lineItemId: '2150-CAMERA',
  amount: 5000,
  date: '2024-03-20',
});
```

### Pagination

Handle large datasets with pagination parameters.

```typescript
// Paginate through public rates
const { rates } = await client.listPublicRates({
  search: 'camera',
  page: 1,
  limit: 50,
});
```

### Batch Operations

Create multiple items efficiently in a single request.

```typescript
// Create multiple budget lines at once
await client.createBudgetLines('my-project', {
  accountId: 'root',
  lines: [
    { type: 'account', accountId: '1000', description: 'Above The Line' },
    { type: 'line', accountId: '1100', description: 'Producer' },
    { type: 'line', accountId: '1200', description: 'Director' },
    { type: 'subtotal', description: 'Total ATL' },
    { type: 'account', accountId: '2000', description: 'Below The Line' },
    { type: 'line', accountId: '2100', description: 'Camera' },
    { type: 'line', accountId: '2200', description: 'Lighting' },
  ],
});
```

## TypeScript Support

The SDK is fully typed with TypeScript. All request and response types are auto-generated from the OpenAPI specification.

```typescript
import type {
  Project,
  Budget,
  Actual,
  PurchaseOrder,
  Contact,
  CreateProjectInput,
  UpdateProjectInput,
  ListProjectsParams,
} from '@saturation-api/js';

// Type-safe function
async function getProjectBudgetTotal(projectId: string): Promise<number> {
  const budget = await client.getProjectBudget(projectId);
  return budget.account.totals.estimate || 0;
}

// Type-safe error handling
function isNotFoundError(error: unknown): boolean {
  return error instanceof SaturationError && error.statusCode === 404;
}
```

## API Reference

For complete API documentation, see the [API Reference](https://api.saturation.io/docs).

### Available Methods

#### Projects
- `listProjects(params?)` - List all projects
- `getProject(projectId)` - Get a specific project
- `createProject(data)` - Create a new project
- `updateProject(projectId, data)` - Update project details
- `deleteProject(projectId)` - Delete a project

#### Budget
- `getProjectBudget(projectId, params?)` - Get project budget
- `createBudgetLines(projectId, data)` - Add budget lines
- `getBudgetLine(projectId, lineId, params?)` - Get specific line
- `updateBudgetLine(projectId, lineId, data)` - Update budget line
- `deleteBudgetLine(projectId, lineId)` - Delete budget line

#### Phases
- `listBudgetPhases(projectId)` - List budget phases
- `createBudgetPhase(projectId, data)` - Create phase
- `getBudgetPhase(projectId, phaseId)` - Get phase details
- `updateBudgetPhase(projectId, phaseId, data)` - Update phase
- `deleteBudgetPhase(projectId, phaseId)` - Delete phase

#### Actuals
- `listProjectActuals(projectId, params?)` - List actuals
- `getActual(projectId, actualId, params?)` - Get actual details
- `createActual(projectId, data)` - Create actual
- `updateActual(projectId, actualId, data)` - Update actual
- `deleteActual(projectId, actualId)` - Delete actual
- `uploadActualAttachment(projectId, actualId, file, filename)` - Add attachment

#### Purchase Orders
- `listPurchaseOrders(projectId, params?)` - List purchase orders
- `getPurchaseOrder(projectId, poId, params?)` - Get PO details
- `createPurchaseOrder(projectId, data)` - Create purchase order
- `updatePurchaseOrder(projectId, poId, data)` - Update PO
- `deletePurchaseOrder(projectId, poId)` - Delete PO
- `uploadPurchaseOrderAttachment(projectId, poId, file, filename)` - Add attachment

#### Contacts
- `listContacts(params?)` - List contacts
- `createContact(data)` - Create contact
- `getContact(contactId)` - Get contact details
- `updateContact(contactId, data)` - Update contact
- `uploadContactTaxDocument(contactId, file, filename)` - Upload tax doc
- `uploadContactAttachment(contactId, file, filename)` - Add attachment

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/saturation-api/saturation-js.git
cd saturation-js

# Install dependencies
npm install

# Generate types from OpenAPI spec
npm run generate

# Run tests
npm test

# Build the package
npm run build
```

### Scripts

- `npm run build` - Build for production
- `npm run dev` - Watch mode for development
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier
- `npm run generate` - Generate types from OpenAPI spec

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT - see [LICENSE](LICENSE) file for details.

## Support

- [Documentation](https://docs.saturation.io)
- [API Reference](https://api.saturation.io/docs)
- [GitHub Issues](https://github.com/saturation-api/saturation-js/issues)
- [Support Email](mailto:support@saturation.io)