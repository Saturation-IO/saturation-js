# Saturation Dashboard Example

A minimal, read-only dashboard example demonstrating how to use the Saturation SDK to display project analytics and KPIs.

## What This Example Shows

- How to configure and use the Saturation SDK in a Next.js app
- Fetching and displaying project budgets, actuals, and purchase orders
- Building a simple analytics dashboard with charts and KPI cards
- Using the SDK's type-safe methods for all API interactions

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:5173](http://localhost:5173)

4. Enter your Saturation API key (get one from [Saturation Settings](https://app.saturation.io/settings/api-keys))

## Tech Stack

- **Next.js 15** - React framework with App Router
- **@saturation-api/js** - Saturation SDK for API access
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - UI component library
- **Recharts** - Charting library for data visualization

## Project Structure

```
basic-dashboard/
├── app/                     # Next.js app directory
│   ├── page.tsx            # API key configuration page
│   └── dashboard/          # Dashboard implementation
├── components/             # React components
│   └── ui/                # shadcn/ui components
├── contexts/              # React contexts
│   └── SaturationContext.tsx  # SDK provider
└── lib/                   # Utility functions
```

## Features

- **API Key Management**: Secure local storage of API credentials
- **Project Selection**: Dropdown to choose active projects
- **KPI Cards**: Budget, actuals, commitments, and burn rate
- **Data Visualizations**: Charts for budget analysis and spending trends
- **Read-Only Access**: Safe demonstration using only GET endpoints

## Development

This example uses the Saturation SDK from the parent directory. Any changes to the SDK will be reflected when you rebuild:

```bash
# In the root directory
npm run build

# Then restart the dev server in this directory
npm run dev
```

## Learn More

- [Saturation API Documentation](https://docs.saturation.io)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)