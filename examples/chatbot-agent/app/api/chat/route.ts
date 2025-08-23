import { createOpenAI, openai } from "@ai-sdk/openai"
import { convertToModelMessages, streamText, tool, UIMessage } from "ai"
import { Project, Saturation } from "@saturation-api/js"
import { z } from "zod"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } =
    await req.json()

    console.log(JSON.stringify(messages, null, 2))
  // Accept key via env, header, or request body (in that order)
  const openAIKey = req.headers.get("x-openai-key")
  const saturationKey = req.headers.get("x-saturation-key")
  
  if (!openAIKey) {
    return new Response("OpenAI API key is required", { status: 400 })
  }

  if (!saturationKey) {
    return new Response("Saturation API key is required", { status: 400 })
  }

  const provider = createOpenAI({apiKey: openAIKey})
  const saturation = new Saturation({ apiKey: saturationKey, baseURL: process.env.NEXT_PUBLIC_SATURATION_API_URL || "https://api.saturation.io/api/v1" })

  const result = streamText({
    model: provider("gpt-4.1-nano"),
    system:
      "You are a helpful assistant with access to tools. When the user asks to list or view projects, use the listProjects tool.",
    messages: convertToModelMessages(messages),
    tools: {
      listProjects: tool({
        description: "List the user's projects from the Saturation API.",
        inputSchema: z.object({         
        }),
        execute: async (input) => {          
          try {            
            const { projects } = await saturation.listProjects()            
            return projects
          } catch (err: any) {
            console.log(err)
            return { error: err?.message || "Failed to fetch projects" }
          }
        },
      }),
    },
  })

  return result.toUIMessageStreamResponse()
}
