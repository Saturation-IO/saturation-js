# Basic Usage - Saturation SDK Example

A Next.js 15 application demonstrating basic usage of the Saturation API SDK for managing projects and budgets.

## Features

- 🚀 Built with Next.js 15 and TypeScript
- 🎨 Styled with Tailwind CSS and shadcn/ui components
- 📊 Integrates with Saturation API for budget management
- 🔄 Real-time budget data synchronization
- 📁 View and manage budget data
- 💾 Interact with the Saturation API

## Prerequisites

- Node.js 18.0.0 or higher
- npm (comes with Node.js)
- A Saturation API key (get one from [Saturation Settings](https://app.saturation.io/settings/api-keys))

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/saturation-api/saturation-js.git
cd saturation-js/examples/basic-usage
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Your Saturation API key
NEXT_PUBLIC_SATURATION_API_KEY=your_api_key_here

# Optional: Custom API endpoint (defaults to production)
NEXT_PUBLIC_SATURATION_API_URL=https://api.saturation.io/api/v1
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Type checking
npm run type-check
```

## Project Structure

```
basic-usage/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── projects/          # Projects pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── budget/           # Budget-specific components
├── lib/                   # Utility functions
│   ├── utils.ts          # Common utilities
│   └── saturation.ts     # Saturation SDK setup
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## Using the Saturation SDK

### Initialize the Client

```typescript
import { Saturation } from '@saturation-api/js';

const client = new Saturation({
  apiKey: process.env.NEXT_PUBLIC_SATURATION_API_KEY!,
  baseURL: process.env.NEXT_PUBLIC_SATURATION_API_URL, // Optional
});
```

### Fetch Projects

```typescript
const { projects } = await client.listProjects({ 
  status: 'active' 
});
```

### Get Budget Details

```typescript
const budget = await client.getBudget('project-id', {
  expands: ['phases', 'fringes', 'lines.contact']
});
```

### Create Budget Lines

```typescript
await client.createBudgetLines('project-id', {
  accountId: 'root',
  lines: [
    {
      type: 'line',
      accountId: '1100',
      description: 'Director',
      phaseData: {
        estimate: { amount: 50000 }
      }
    }
  ]
});
```

## API Key Security

For production deployments:

1. **Never commit API keys** to version control
2. Use environment variables for all sensitive data
3. For client-side usage, consider implementing a backend API route to proxy requests
4. Restrict API key permissions in Saturation to only what's needed

## Example Features

This example app demonstrates:

- **Project List**: View all active projects in your workspace
- **Budget Viewer**: Display detailed budget breakdowns with phases
- **Budget Import**: Upload CSV/Excel files to create budget lines
- **Actuals Tracking**: Create and manage actual expenses
- **Export**: Download budget data in various formats

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/saturation-api/saturation-js/tree/main/examples/basic-usage&env=NEXT_PUBLIC_SATURATION_API_KEY)

### Deploy to Netlify

1. Build the project: `npm run build`
2. Deploy the `.next` folder
3. Set environment variables in Netlify dashboard

### Self-Hosted

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## Troubleshooting

### Common Issues

1. **API Key not working**: Ensure your API key has the necessary permissions in Saturation
2. **CORS errors**: The Saturation API supports CORS, but ensure you're using the correct base URL
3. **Type errors**: Run `npm run type-check` to identify TypeScript issues
4. **Build failures**: Clear `.next` folder and `node_modules`, then reinstall

### Getting Help

- 📚 [Saturation API Documentation](https://api.saturation.io/docs)
- 💬 [GitHub Issues](https://github.com/saturation-api/saturation-js/issues)
- 📧 [Support Email](mailto:support@saturation.io)

## Contributing

We welcome contributions! Please see the main repository's contributing guidelines.

## License

MIT - See LICENSE file in the root repository
