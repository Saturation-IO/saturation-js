# Chatbot Agent - Saturation SDK Example (Starter)

A minimal Next.js 15.5 starter app that mirrors the basic-usage example’s styling and setup, focused only on capturing a Saturation API key using a Card. We will add the chatbot/agent features later.

## Stack

- Next.js 15.5 + React 19
- Tailwind CSS v4 + shadcn/ui (local components)
- `@saturation-api/js` SDK

## Getting Started

```bash
# from repo root
cd examples/chatbot-agent
npm install
npm run dev
```

Open http://localhost:5173 and enter your API key. The key is stored in `localStorage` under `saturation_api_key` for demo purposes.

## Notes

- The SDK client is provided via `contexts/SaturationContext.tsx`, which reads from env or `localStorage`.
- Keep secrets out of client storage in production; prefer environment variables and server-side use.

## Next Steps

- Implement the chatbot/agent flows (coming later).
