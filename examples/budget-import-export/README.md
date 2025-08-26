# Budget Import/Export - Saturation SDK Example

A Next.js 15 app scaffold demonstrating the Saturation SDK setup with Tailwind v4 and shadcn/ui. For now, it includes the Saturation Context Provider and a simple UI to store the API key in localStorage.

## Features

- Next.js 15 + TypeScript
- Tailwind CSS v4 + shadcn/ui primitives
- Saturation SDK wired via React Context
- Local storage helper UI for API key

## Prerequisites

- Node.js 18+
- npm
- A Saturation API key (get one from https://app.saturation.io/settings/api-keys)

## Getting Started

1) Install deps

```bash
cd examples/budget-import-export
npm install
```

2) Configure environment

Copy `.env.local.example` to `.env.local` and set your key:

```env
NEXT_PUBLIC_SATURATION_API_KEY=your_api_key_here
# NEXT_PUBLIC_SATURATION_API_URL=https://api.saturation.io/api/v1  # optional
```

3) Run the dev server

```bash
npm run dev
```

By default this example uses port 5173. Open http://localhost:5173

## Project Structure

```
budget-import-export/
├── app/
│   ├── layout.tsx          # Wraps app with SaturationProvider
│   ├── page.tsx            # API key save/clear UI
│   └── globals.css         # Tailwind v4 + theme tokens
├── components/ui/          # shadcn/ui primitives (button, card, input, label)
├── contexts/
│   └── SaturationContext.tsx  # Creates Saturation client from env/localStorage
├── lib/
│   └── utils.ts            # cn() helper
├── public/
│   └── favicon.svg
├── package.json
├── tsconfig.json
├── postcss.config.mjs
├── eslint.config.mjs
└── components.json
```

## Using the Provider

The `SaturationProvider` creates a client using `NEXT_PUBLIC_SATURATION_API_KEY` or `localStorage['saturation_api_key']` as a fallback.

```tsx
import { useSaturation } from '@/contexts/SaturationContext'

export default function Example() {
  const saturation = useSaturation()
  // e.g. await saturation.listProjects()
}
```

## Roadmap

- Import budget lines from CSV/Excel
- Export budgets and transactions
- Minimal UI flows for selecting project/budget

## Help

- Docs: https://api.saturation.io/docs
- Issues: https://github.com/saturation-api/saturation-js/issues
- Support: support@saturation.io
