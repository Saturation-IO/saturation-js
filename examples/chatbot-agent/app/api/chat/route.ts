import { createOpenAI, openai } from "@ai-sdk/openai"
import { convertToModelMessages, streamText, tool, UIMessage } from "ai"
import { z } from "zod"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, apiKey: bodyKey }: { messages: UIMessage[]; apiKey?: string } =
    await req.json()

  // Accept key via env, header, or request body (in that order)
  const envKey = process.env.OPENAI_API_KEY
  const headerKey = req.headers.get("x-openai-key") || undefined
  const key = envKey || headerKey || bodyKey

  if (!key) {
    return new Response("OpenAI API key is required", { status: 400 })
  }

  const provider = envKey && !headerKey && !bodyKey ? openai : createOpenAI({ apiKey: key })

  const result = streamText({
    model: provider("gpt-4.1-nano"),
    system:
      "You are a helpful assistant with access to tools. Use the getCurrentDate tool when users ask about dates, time, or current information. You are also able to use the getTime tool to get the current time in a specific timezone.",
    messages: convertToModelMessages(messages),
    tools: {
      getTime: tool({
        description: "Get the current time in a specific timezone",
        inputSchema: z.object({
          timezone: z
            .string()
            .describe("A valid IANA timezone, e.g. 'Europe/Paris'"),
        }),
        execute: async ({ timezone }) => {
          try {
            const now = new Date()
            const time = now.toLocaleString("en-US", {
              timeZone: timezone,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })

            return { time, timezone }
          } catch {
            return { error: "Invalid timezone format." }
          }
        },
      }),
      getCurrentDate: tool({
        description: "Get the current date and time with timezone information",
        inputSchema: z.object({}),
        execute: async () => {
          const now = new Date()
          return {
            timestamp: now.getTime(),
            iso: now.toISOString(),
            local: now.toLocaleString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              timeZoneName: "short",
            }),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            utc: now.toUTCString(),
          }
        },
      }),
    },
  })

  return result.toUIMessageStreamResponse()
}
