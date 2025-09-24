// Base tools for Saturation SDK
import { tool } from "ai"
import { z } from "zod"
import { Saturation } from "@saturation-api/js"
import type {
  CreateProjectInput,
  UpdateProjectInput,
  CreateBudgetInput,
  UpdateBudgetLineRequest,
  CreateActualInput,
  UpdateActualInput,
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
  CreatePurchaseOrderItemInput,
  CreatePhaseRequest,
  UpdatePhaseRequest,
  CreateFringeRequest,
  UpdateFringeRequest,
  CreateGlobalRequest,
  UpdateGlobalRequest,
  CreateTagRequest,
  UpdateTagRequest,
  CreateContactInput,
  UpdateContactInput,
  CreateSpaceInput,
  UpdateSpaceInput,
  CreateRateInput,
  UpdateRateInput,
  UpdateTransactionInput,
} from "@saturation-api/js"

// Runtime Zod schemas aligned with SDK types
export const CreateProjectInputSchema: z.ZodType<CreateProjectInput> = z.object({
  name: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  spaceId: z.string().nullable().optional(),
  status: z.enum(["active", "archived"]).optional(),
  templateId: z.string().nullable().optional(),
  labels: z.array(z.string()).optional(),
})

export const UpdateProjectInputSchema: z.ZodType<UpdateProjectInput> = z.object({
  name: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  spaceId: z.string().nullable().optional(),
  status: z.enum(["active", "archived"]).optional(),
  labels: z.array(z.string()).optional(),
})

export const CreateBudgetLinesInputSchema: z.ZodType<CreateBudgetInput> = z.object({
  accountId: z.string().optional(),
  lines: z
    .array(
      (() => {
        const PhaseLineDataSchema = z.object({
          quantity: z.number().nullable().optional(),
          unit: z.string().nullable().optional(),
          rate: z.number().nullable().optional(),
          multiplier: z.number().nullable().optional(),
          fringes: z.array(z.string()).optional(),
        })
        return z.object({
          type: z.enum(["line", "account", "subtotal", "markup"]).optional(),
          accountId: z.string().optional(),
          description: z.string().optional(),
          // Per-phase details keyed by phaseId or alias
          phaseData: z.record(PhaseLineDataSchema).optional(),
        })
      })()
    )
    .optional(),
  insert: z
    .object({
      mode: z.enum(["append", "prepend", "after", "before"]).optional(),
      lineId: z.string().optional(),
    })
    .optional(),
  idMode: z.enum(["user", "system"]).optional(),
})

export const UpdateBudgetLineRequestSchema: z.ZodType<UpdateBudgetLineRequest> = z.object({
  description: z.string().nullable().optional(),
  accountId: z.string().nullable().optional(),
  convertToAccount: z.boolean().optional(),
  phaseData: z
    .record(
      z.object({
        quantity: z.number().nullable().optional(),
        unit: z.string().nullable().optional(),
        rate: z.number().nullable().optional(),
        multiplier: z.number().nullable().optional(),
        fringes: z.array(z.string()).optional(),
      })
    )
    .optional(),
  idMode: z.enum(["user", "system"]).optional(),
})

export const CreateActualInputSchema: z.ZodType<CreateActualInput> = z.object({
  description: z.string(),
  amount: z.number(),
  date: z.string(),
  accountId: z.union([z.string(), z.array(z.string())]).optional(),
  ref: z.string().optional(),
  payId: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  purchaseOrderId: z.string().optional(),
  transactionId: z.string().optional(),
  contactId: z.string().optional(),
})

export const UpdateActualInputSchema: z.ZodType<UpdateActualInput> = z.object({
  description: z.string().optional(),
  amount: z.number().optional(),
  date: z.string().optional(),
  accountId: z.union([z.string(), z.array(z.string())]).optional(),
  ref: z.string().optional(),
  payId: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  purchaseOrderId: z.string().optional(),
  transactionId: z.string().optional(),
  contactId: z.string().optional(),
})

export const CreatePurchaseOrderItemInputSchema: z.ZodType<CreatePurchaseOrderItemInput> =
  z.object({
    description: z.string().optional(),
    quantity: z.number().optional(),
    unitPrice: z.number().optional(),
    totalPrice: z.number().optional(),
    accountId: z.string().optional(),
  })

export const CreatePurchaseOrderInputSchema: z.ZodType<CreatePurchaseOrderInput> = z.object({
  purchaseOrderId: z.string().optional(),
  title: z.string().optional(),
  date: z.string().optional(),
  amount: z.number(),
  status: z.enum(["draft", "approved", "rejected", "pending", "paid"]).optional(),
  notes: z.string().optional(),
  contactId: z.string().optional(),
  items: z.array(CreatePurchaseOrderItemInputSchema).optional(),
})

export const UpdatePurchaseOrderInputSchema: z.ZodType<UpdatePurchaseOrderInput> = z.object({
  purchaseOrderId: z.string().optional(),
  title: z.string().optional(),
  date: z.string().optional(),
  amount: z.number().optional(),
  status: z.enum(["draft", "approved", "rejected", "pending", "paid"]).optional(),
  notes: z.string().optional(),
  contactId: z.string().optional(),
})

export const CreatePhaseRequestSchema: z.ZodType<CreatePhaseRequest> = z.object({
  name: z.string(),
  type: z.enum(["estimate", "actual", "rollup", "committed"]),
  color: z
    .enum([
      "red",
      "rose",
      "pink",
      "fuchsia",
      "purple",
      "violet",
      "indigo",
      "blue",
      "sky",
      "cyan",
      "teal",
      "green",
      "yellow",
      "amber",
      "orange",
    ])
    .optional(),
  currency: z
    .object({
      code: z.string().nullable().optional(),
      symbol: z.string().nullable().optional(),
      exchangeRate: z.number().nullable().optional(),
    })
    .nullable()
    .optional(),
  copyPhase: z.string().optional(),
  isHidden: z.boolean().optional(),
  phaseIds: z.array(z.string()).optional(),
  operation: z.enum(["sum", "difference"]).optional(),
  idMode: z.enum(["user", "system"]).optional(),
})

export const UpdatePhaseRequestSchema: z.ZodType<UpdatePhaseRequest> = z.object({
  name: z.string().optional(),
  color: z
    .enum([
      "red",
      "rose",
      "pink",
      "fuchsia",
      "purple",
      "violet",
      "indigo",
      "blue",
      "sky",
      "cyan",
      "teal",
      "green",
      "yellow",
      "amber",
      "orange",
    ])
    .optional(),
  currency: z
    .object({
      code: z.string().nullable().optional(),
      symbol: z.string().nullable().optional(),
      exchangeRate: z.number().nullable().optional(),
    })
    .nullable()
    .optional(),
  isHidden: z.boolean().optional(),
  idMode: z.enum(["user", "system"]).optional(),
})

export const CreateFringeRequestSchema: z.ZodType<CreateFringeRequest> = z.object({
  code: z.string(),
  description: z.string().optional(),
  units: z.enum(["percent", "flat", "total"]),
  rate: z.number(),
  cutoff: z.number().nullable().optional(),
  idMode: z.enum(["user", "system"]).optional(),
})

export const UpdateFringeRequestSchema: z.ZodType<UpdateFringeRequest> = z.object({
  code: z.string().optional(),
  description: z.string().optional(),
  units: z.enum(["percent", "flat", "total"]).optional(),
  rate: z.number().optional(),
  cutoff: z.number().nullable().optional(),
  idMode: z.enum(["user", "system"]).optional(),
})

export const CreateGlobalRequestSchema: z.ZodType<CreateGlobalRequest> = z.object({
  symbol: z.string(),
  description: z.string(),
  formula: z.string(),
  unit: z.string().optional(),
  idMode: z.enum(["user", "system"]).optional(),
})

export const UpdateGlobalRequestSchema: z.ZodType<UpdateGlobalRequest> = z.object({
  symbol: z.string().optional(),
  description: z.string().optional(),
  formula: z.string().optional(),
  unit: z.string().optional(),
  idMode: z.enum(["user", "system"]).optional(),
})

export const CreateTagRequestSchema: z.ZodType<CreateTagRequest> = z.object({
  name: z.string(),
  color: z.string().optional(),
  description: z.string().optional(),
})

export const UpdateTagRequestSchema: z.ZodType<UpdateTagRequest> = z.object({
  color: z.string().optional(),
})

export const CreateContactInputSchema: z.ZodType<CreateContactInput> = z.object({
  name: z.string(),
  email: z.string().optional(),
  company: z.string().optional(),
  type: z.enum(["Person", "Company"]).optional(),
  jobTitle: z.string().optional(),
  rate: z.number().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxIdLast4: z.string().optional(),
})

export const UpdateContactInputSchema: z.ZodType<UpdateContactInput> = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  company: z.string().optional(),
  type: z.enum(["Person", "Company"]).optional(),
  jobTitle: z.string().optional(),
  rate: z.number().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxIdLast4: z.string().optional(),
})

export const CreateSpaceInputSchema: z.ZodType<CreateSpaceInput> = z.object({
  name: z.string(),
  image: z.string().nullable().optional(),
  archived: z.boolean().optional(),
})

export const UpdateSpaceInputSchema: z.ZodType<UpdateSpaceInput> = z.object({
  name: z.string().optional(),
  image: z.string().nullable().optional(),
  archived: z.boolean().optional(),
})

export const CreateRateInputSchema: z.ZodType<CreateRateInput> = z.object({
  name: z.string().optional(),
  emoji: z.string().optional(),
  description: z.string().optional(),
  note: z.string().optional(),
  quantity: z.number().optional(),
  rate: z.number().optional(),
  unit: z
    .enum(["hour", "day", "week", "month", "year", "each", "sqft", "sqm", "lnft", "lnm"])
    .optional(),
  multiplier: z.number().optional(),
  contactId: z.string().optional(),
})

export const UpdateRateInputSchema: z.ZodType<UpdateRateInput> = z.object({
  name: z.string().optional(),
  emoji: z.string().optional(),
  description: z.string().optional(),
  note: z.string().optional(),
  quantity: z.number().optional(),
  rate: z.number().optional(),
  unit: z
    .enum(["hour", "day", "week", "month", "year", "each", "sqft", "sqm", "lnft", "lnm"])
    .optional(),
  multiplier: z.number().optional(),
  contactId: z.string().optional(),
})

export const UpdateTransactionInputSchema: z.ZodType<UpdateTransactionInput> = z.object({
  projectId: z.string().optional(),
  accountId: z.string().optional(),
  contactId: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
})

// Utility to standardize error handling across tools
const safe = <I, R>(fn: (input: I) => Promise<R>) =>
  async (input: I) => {
    try {
      return await fn(input)
    } catch (err) {
      console.error(err)
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      return { error: errorMessage }
    }
  }

// Build all tools for a given Saturation client
// Individual tool factories (exportable)
export const listProjectsTool = (saturation: Saturation) =>
  tool({
    description: "List projects.",
    inputSchema: z.object({}),
    execute: safe(async () => {
      const { projects } = await saturation.listProjects()
      return projects
    }),
  })

export const getProjectTool = (saturation: Saturation) =>
  tool({
    description: "Get a project by ID.",
    inputSchema: z.object({ projectId: z.string() }),
    execute: safe(async ({ projectId }) => saturation.getProject(projectId)),
  })

export const createProjectTool = (saturation: Saturation) =>
  tool({
    description: "Create a project.",
    inputSchema: z.object({ data: CreateProjectInputSchema }),
    execute: safe(async ({ data }) => saturation.createProject(data)),
  })

export const updateProjectTool = (saturation: Saturation) =>
  tool({
    description: "Update a project.",
    inputSchema: z.object({ projectId: z.string(), data: UpdateProjectInputSchema }),
    execute: safe(async ({ projectId, data }) => saturation.updateProject(projectId, data)),
  })

export const deleteProjectTool = (saturation: Saturation) =>
  tool({
    description: "Delete a project.",
    inputSchema: z.object({ projectId: z.string() }),
    execute: safe(async ({ projectId }) => {
      await saturation.deleteProject(projectId)
      return { success: true }
    }),
  })

export const getBudgetTool = (saturation: Saturation) =>
  tool({
    description: "Get a project's budget.",
    inputSchema: z.object({ projectId: z.string() }),
    execute: safe(async ({ projectId }) => saturation.getBudget(projectId)),
  })

export const createBudgetLinesTool = (saturation: Saturation) =>
  tool({
    description: "Create budget lines in a project.",
    inputSchema: z.object({ projectId: z.string(), data: CreateBudgetLinesInputSchema }),
    execute: safe(async ({ projectId, data }) => saturation.createBudgetLines(projectId, data)),
  })

export const getBudgetLineTool = (saturation: Saturation) =>
  tool({
    description: "Get a budget line.",
    inputSchema: z.object({ projectId: z.string(), lineId: z.string() }),
    execute: safe(async ({ projectId, lineId }) => saturation.getBudgetLine(projectId, lineId)),
  })

export const updateBudgetLineTool = (saturation: Saturation) =>
  tool({
    description: "Update a budget line.",
    inputSchema: z.object({ projectId: z.string(), lineId: z.string(), data: UpdateBudgetLineRequestSchema }),
    execute: safe(async ({ projectId, lineId, data }) => saturation.updateBudgetLine(projectId, lineId, data)),
  })

export const deleteBudgetLineTool = (saturation: Saturation) =>
  tool({
    description: "Delete a budget line.",
    inputSchema: z.object({ projectId: z.string(), lineId: z.string(), idMode: z.enum(["user", "system"]).optional() }),
    execute: safe(async ({ projectId, lineId, idMode }) => {
      await saturation.deleteBudgetLine(projectId, lineId, idMode)
      return { success: true }
    }),
  })

export const listBudgetAccountsTool = (saturation: Saturation) =>
  tool({
    description: "List budget accounts for a project.",
    inputSchema: z.object({ projectId: z.string() }),
    execute: safe(async ({ projectId }) => saturation.listBudgetAccounts(projectId)),
  })

export const listActualsTool = (saturation: Saturation) =>
  tool({
    description: "List actuals for a project.",
    inputSchema: z.object({ projectId: z.string() }),
    execute: safe(async ({ projectId }) => saturation.listActuals(projectId)),
  })

export const getActualTool = (saturation: Saturation) =>
  tool({
    description: "Get an actual by ID.",
    inputSchema: z.object({ projectId: z.string(), actualId: z.string() }),
    execute: safe(async ({ projectId, actualId }) => saturation.getActual(projectId, actualId)),
  })

export const createActualTool = (saturation: Saturation) =>
  tool({
    description: "Create an actual.",
    inputSchema: z.object({ projectId: z.string(), actualId: z.string(), data: CreateActualInputSchema }),
    execute: safe(async ({ projectId, actualId, data }) => saturation.createActual(projectId, actualId, data)),
  })

export const updateActualTool = (saturation: Saturation) =>
  tool({
    description: "Update an actual.",
    inputSchema: z.object({ projectId: z.string(), actualId: z.string(), data: UpdateActualInputSchema }),
    execute: safe(async ({ projectId, actualId, data }) => saturation.updateActual(projectId, actualId, data)),
  })

export const deleteActualTool = (saturation: Saturation) =>
  tool({
    description: "Delete an actual.",
    inputSchema: z.object({ projectId: z.string(), actualId: z.string() }),
    execute: safe(async ({ projectId, actualId }) => {
      await saturation.deleteActual(projectId, actualId)
      return { success: true }
    }),
  })

export const listPurchaseOrdersTool = (saturation: Saturation) =>
  tool({
    description: "List purchase orders for a project.",
    inputSchema: z.object({ projectId: z.string() }),
    execute: safe(async ({ projectId }) => saturation.listPurchaseOrders(projectId)),
  })

export const getPurchaseOrderTool = (saturation: Saturation) =>
  tool({
    description: "Get a purchase order by ID.",
    inputSchema: z.object({ projectId: z.string(), purchaseOrderId: z.string() }),
    execute: safe(async ({ projectId, purchaseOrderId }) => saturation.getPurchaseOrder(projectId, purchaseOrderId)),
  })

export const createPurchaseOrderTool = (saturation: Saturation) =>
  tool({
    description: "Create a purchase order.",
    inputSchema: z.object({ projectId: z.string(), purchaseOrderId: z.string(), data: CreatePurchaseOrderInputSchema }),
    execute: safe(async ({ projectId, purchaseOrderId, data }) => saturation.createPurchaseOrder(projectId, purchaseOrderId, data)),
  })

export const updatePurchaseOrderTool = (saturation: Saturation) =>
  tool({
    description: "Update a purchase order.",
    inputSchema: z.object({ projectId: z.string(), purchaseOrderId: z.string(), data: UpdatePurchaseOrderInputSchema }),
    execute: safe(async ({ projectId, purchaseOrderId, data }) => saturation.updatePurchaseOrder(projectId, purchaseOrderId, data)),
  })

export const deletePurchaseOrderTool = (saturation: Saturation) =>
  tool({
    description: "Delete a purchase order.",
    inputSchema: z.object({ projectId: z.string(), purchaseOrderId: z.string() }),
    execute: safe(async ({ projectId, purchaseOrderId }) => {
      await saturation.deletePurchaseOrder(projectId, purchaseOrderId)
      return { success: true }
    }),
  })

export const listBudgetPhasesTool = (saturation: Saturation) =>
  tool({
    description: "List budget phases for a project.",
    inputSchema: z.object({ projectId: z.string(), idMode: z.enum(["user", "system"]).optional() }),
    execute: safe(async ({ projectId, idMode }) => saturation.listBudgetPhases(projectId, idMode)),
  })

export const getBudgetPhaseTool = (saturation: Saturation) =>
  tool({
    description: "Get a budget phase.",
    inputSchema: z.object({ projectId: z.string(), phaseId: z.string(), idMode: z.enum(["user", "system"]).optional() }),
    execute: safe(async ({ projectId, phaseId, idMode }) => saturation.getBudgetPhase(projectId, phaseId, idMode)),
  })

export const createBudgetPhaseTool = (saturation: Saturation) =>
  tool({
    description: "Create a budget phase.",
    inputSchema: z.object({ projectId: z.string(), data: CreatePhaseRequestSchema }),
    execute: safe(async ({ projectId, data }) => saturation.createBudgetPhase(projectId, data)),
  })

export const updateBudgetPhaseTool = (saturation: Saturation) =>
  tool({
    description: "Update a budget phase.",
    inputSchema: z.object({ projectId: z.string(), phaseId: z.string(), data: UpdatePhaseRequestSchema }),
    execute: safe(async ({ projectId, phaseId, data }) => saturation.updateBudgetPhase(projectId, phaseId, data)),
  })

export const deleteBudgetPhaseTool = (saturation: Saturation) =>
  tool({
    description: "Delete a budget phase.",
    inputSchema: z.object({ projectId: z.string(), phaseId: z.string() }),
    execute: safe(async ({ projectId, phaseId }) => {
      await saturation.deleteBudgetPhase(projectId, phaseId)
      return { success: true }
    }),
  })

export const listBudgetFringesTool = (saturation: Saturation) =>
  tool({
    description: "List budget fringes for a project.",
    inputSchema: z.object({ projectId: z.string(), idMode: z.enum(["user", "system"]).optional() }),
    execute: safe(async ({ projectId, idMode }) => saturation.listBudgetFringes(projectId, idMode)),
  })

export const getBudgetFringeTool = (saturation: Saturation) =>
  tool({
    description: "Get a budget fringe.",
    inputSchema: z.object({ projectId: z.string(), fringeId: z.string(), idMode: z.enum(["user", "system"]).optional() }),
    execute: safe(async ({ projectId, fringeId, idMode }) => saturation.getBudgetFringe(projectId, fringeId, idMode)),
  })

export const createBudgetFringeTool = (saturation: Saturation) =>
  tool({
    description: "Create a budget fringe.",
    inputSchema: z.object({ projectId: z.string(), data: CreateFringeRequestSchema }),
    execute: safe(async ({ projectId, data }) => saturation.createBudgetFringe(projectId, data)),
  })

export const updateBudgetFringeTool = (saturation: Saturation) =>
  tool({
    description: "Update a budget fringe.",
    inputSchema: z.object({ projectId: z.string(), fringeId: z.string(), data: UpdateFringeRequestSchema }),
    execute: safe(async ({ projectId, fringeId, data }) => saturation.updateBudgetFringe(projectId, fringeId, data)),
  })

export const deleteBudgetFringeTool = (saturation: Saturation) =>
  tool({
    description: "Delete a budget fringe.",
    inputSchema: z.object({ projectId: z.string(), fringeId: z.string() }),
    execute: safe(async ({ projectId, fringeId }) => {
      await saturation.deleteBudgetFringe(projectId, fringeId)
      return { success: true }
    }),
  })

export const listBudgetGlobalsTool = (saturation: Saturation) =>
  tool({
    description: "List budget globals for a project.",
    inputSchema: z.object({ projectId: z.string(), idMode: z.enum(["user", "system"]).optional() }),
    execute: safe(async ({ projectId, idMode }) => saturation.listBudgetGlobals(projectId, idMode)),
  })

export const getBudgetGlobalTool = (saturation: Saturation) =>
  tool({
    description: "Get a budget global.",
    inputSchema: z.object({ projectId: z.string(), globalId: z.string(), idMode: z.enum(["user", "system"]).optional() }),
    execute: safe(async ({ projectId, globalId, idMode }) => saturation.getBudgetGlobal(projectId, globalId, idMode)),
  })

export const createBudgetGlobalTool = (saturation: Saturation) =>
  tool({
    description: "Create a budget global.",
    inputSchema: z.object({ projectId: z.string(), data: CreateGlobalRequestSchema }),
    execute: safe(async ({ projectId, data }) => saturation.createBudgetGlobal(projectId, data)),
  })

export const updateBudgetGlobalTool = (saturation: Saturation) =>
  tool({
    description: "Update a budget global.",
    inputSchema: z.object({ projectId: z.string(), globalId: z.string(), data: UpdateGlobalRequestSchema }),
    execute: safe(async ({ projectId, globalId, data }) => saturation.updateBudgetGlobal(projectId, globalId, data)),
  })

export const deleteBudgetGlobalTool = (saturation: Saturation) =>
  tool({
    description: "Delete a budget global.",
    inputSchema: z.object({ projectId: z.string(), globalId: z.string() }),
    execute: safe(async ({ projectId, globalId }) => {
      await saturation.deleteBudgetGlobal(projectId, globalId)
      return { success: true }
    }),
  })

export const listTagsTool = (saturation: Saturation) =>
  tool({
    description: "List tags for a project.",
    inputSchema: z.object({ projectId: z.string() }),
    execute: safe(async ({ projectId }) => saturation.listTags(projectId)),
  })

export const getTagTool = (saturation: Saturation) =>
  tool({
    description: "Get a tag in a project.",
    inputSchema: z.object({ projectId: z.string(), tagId: z.string(), idMode: z.enum(["user", "system"]).optional() }),
    execute: safe(async ({ projectId, tagId, idMode }) => saturation.getTag(projectId, tagId, idMode)),
  })

export const createTagTool = (saturation: Saturation) =>
  tool({
    description: "Create a tag in a project.",
    inputSchema: z.object({ projectId: z.string(), data: CreateTagRequestSchema }),
    execute: safe(async ({ projectId, data }) => saturation.createTag(projectId, data)),
  })

export const updateTagTool = (saturation: Saturation) =>
  tool({
    description: "Update a tag in a project.",
    inputSchema: z.object({ projectId: z.string(), tagId: z.string(), data: UpdateTagRequestSchema }),
    execute: safe(async ({ projectId, tagId, data }) => saturation.updateTag(projectId, tagId, data)),
  })

export const deleteTagTool = (saturation: Saturation) =>
  tool({
    description: "Delete a tag in a project.",
    inputSchema: z.object({ projectId: z.string(), tagId: z.string() }),
    execute: safe(async ({ projectId, tagId }) => {
      await saturation.deleteTag(projectId, tagId)
      return { success: true }
    }),
  })

export const listContactsTool = (saturation: Saturation) =>
  tool({
    description: "List contacts in a workspace.",
    inputSchema: z.object({}),
    execute: safe(async () => saturation.listContacts()),
  })

export const getContactTool = (saturation: Saturation) =>
  tool({
    description: "Get a contact.",
    inputSchema: z.object({ contactId: z.string() }),
    execute: safe(async ({ contactId }) => saturation.getContact(contactId)),
  })

export const createContactTool = (saturation: Saturation) =>
  tool({
    description: "Create a contact.",
    inputSchema: z.object({ data: CreateContactInputSchema }),
    execute: safe(async ({ data }) => saturation.createContact(data)),
  })

export const updateContactTool = (saturation: Saturation) =>
  tool({
    description: "Update a contact.",
    inputSchema: z.object({ contactId: z.string(), data: UpdateContactInputSchema }),
    execute: safe(async ({ contactId, data }) => saturation.updateContact(contactId, data)),
  })

export const listSpacesTool = (saturation: Saturation) =>
  tool({
    description: "List spaces.",
    inputSchema: z.object({}),
    execute: safe(async () => saturation.listSpaces()),
  })

export const getSpaceTool = (saturation: Saturation) =>
  tool({
    description: "Get a space by ID.",
    inputSchema: z.object({ spaceId: z.string() }),
    execute: safe(async ({ spaceId }) => saturation.getSpace(spaceId)),
  })

export const createSpaceTool = (saturation: Saturation) =>
  tool({
    description: "Create a space.",
    inputSchema: z.object({ data: CreateSpaceInputSchema }),
    execute: safe(async ({ data }) => saturation.createSpace(data)),
  })

export const updateSpaceTool = (saturation: Saturation) =>
  tool({
    description: "Update a space.",
    inputSchema: z.object({ spaceId: z.string(), data: UpdateSpaceInputSchema }),
    execute: safe(async ({ spaceId, data }) => saturation.updateSpace(spaceId, data)),
  })

export const deleteSpaceTool = (saturation: Saturation) =>
  tool({
    description: "Delete a space.",
    inputSchema: z.object({ spaceId: z.string() }),
    execute: safe(async ({ spaceId }) => {
      await saturation.deleteSpace(spaceId)
      return { success: true }
    }),
  })

export const listCommentsTool = (saturation: Saturation) =>
  tool({
    description: "List comments for a project.",
    inputSchema: z.object({ projectId: z.string() }),
    execute: safe(async ({ projectId }) => saturation.listComments(projectId)),
  })

export const listWorkspaceRatesTool = (saturation: Saturation) =>
  tool({
    description: "List workspace rates.",
    inputSchema: z.object({}),
    execute: safe(async () => saturation.listWorkspaceRates()),
  })

export const createWorkspaceRateTool = (saturation: Saturation) =>
  tool({
    description: "Create a workspace rate.",
    inputSchema: z.object({ data: CreateRateInputSchema }),
    execute: safe(async ({ data }) => saturation.createWorkspaceRate(data)),
  })

export const updateWorkspaceRateTool = (saturation: Saturation) =>
  tool({
    description: "Update a workspace rate.",
    inputSchema: z.object({ rateId: z.string(), data: UpdateRateInputSchema }),
    execute: safe(async ({ rateId, data }) => saturation.updateWorkspaceRate(rateId, data)),
  })

export const deleteWorkspaceRateTool = (saturation: Saturation) =>
  tool({
    description: "Delete a workspace rate.",
    inputSchema: z.object({ rateId: z.string() }),
    execute: safe(async ({ rateId }) => {
      await saturation.deleteWorkspaceRate(rateId)
      return { success: true }
    }),
  })

export const listPublicRatepacksTool = (saturation: Saturation) =>
  tool({
    description: "List public ratepacks.",
    inputSchema: z.object({}),
    execute: safe(async () => saturation.listPublicRatepacks()),
  })

export const getPublicRatesTool = (saturation: Saturation) =>
  tool({
    description: "Get public rates for a ratepack.",
    inputSchema: z.object({ ratepackId: z.string() }),
    execute: safe(async ({ ratepackId }) => saturation.getPublicRates(ratepackId)),
  })

export const listTransactionsTool = (saturation: Saturation) =>
  tool({
    description: "List transactions.",
    inputSchema: z.object({}),
    execute: safe(async () => saturation.listTransactions()),
  })

export const getTransactionTool = (saturation: Saturation) =>
  tool({
    description: "Get a transaction by ID.",
    inputSchema: z.object({ transactionId: z.string() }),
    execute: safe(async ({ transactionId }) => saturation.getTransaction(transactionId)),
  })

export const updateTransactionTool = (saturation: Saturation) =>
  tool({
    description: "Update a transaction.",
    inputSchema: z.object({ transactionId: z.string(), data: UpdateTransactionInputSchema }),
    execute: safe(async ({ transactionId, data }) => saturation.updateTransaction(transactionId, data)),
  })

// Builder that returns a full set of named tools
export function buildBaseTools(saturation: Saturation) {
  return {
    // Projects
    listProjects: listProjectsTool(saturation),
    getProject: getProjectTool(saturation),
    createProject: createProjectTool(saturation),
    updateProject: updateProjectTool(saturation),
    deleteProject: deleteProjectTool(saturation),

    // Budget
    getBudget: getBudgetTool(saturation),
    createBudgetLines: createBudgetLinesTool(saturation),
    getBudgetLine: getBudgetLineTool(saturation),
    updateBudgetLine: updateBudgetLineTool(saturation),
    deleteBudgetLine: deleteBudgetLineTool(saturation),
    listBudgetAccounts: listBudgetAccountsTool(saturation),

    // Actuals
    listActuals: listActualsTool(saturation),
    getActual: getActualTool(saturation),
    createActual: createActualTool(saturation),
    updateActual: updateActualTool(saturation),
    deleteActual: deleteActualTool(saturation),

    // Purchase Orders
    listPurchaseOrders: listPurchaseOrdersTool(saturation),
    getPurchaseOrder: getPurchaseOrderTool(saturation),
    createPurchaseOrder: createPurchaseOrderTool(saturation),
    updatePurchaseOrder: updatePurchaseOrderTool(saturation),
    deletePurchaseOrder: deletePurchaseOrderTool(saturation),

    // Budget Phases
    listBudgetPhases: listBudgetPhasesTool(saturation),
    getBudgetPhase: getBudgetPhaseTool(saturation),
    createBudgetPhase: createBudgetPhaseTool(saturation),
    updateBudgetPhase: updateBudgetPhaseTool(saturation),
    deleteBudgetPhase: deleteBudgetPhaseTool(saturation),

    // Budget Fringes
    listBudgetFringes: listBudgetFringesTool(saturation),
    getBudgetFringe: getBudgetFringeTool(saturation),
    createBudgetFringe: createBudgetFringeTool(saturation),
    updateBudgetFringe: updateBudgetFringeTool(saturation),
    deleteBudgetFringe: deleteBudgetFringeTool(saturation),

    // Budget Globals
    listBudgetGlobals: listBudgetGlobalsTool(saturation),
    getBudgetGlobal: getBudgetGlobalTool(saturation),
    createBudgetGlobal: createBudgetGlobalTool(saturation),
    updateBudgetGlobal: updateBudgetGlobalTool(saturation),
    deleteBudgetGlobal: deleteBudgetGlobalTool(saturation),

    // Project Tags
    listTags: listTagsTool(saturation),
    getTag: getTagTool(saturation),
    createTag: createTagTool(saturation),
    updateTag: updateTagTool(saturation),
    deleteTag: deleteTagTool(saturation),

    // Contacts
    listContacts: listContactsTool(saturation),
    getContact: getContactTool(saturation),
    createContact: createContactTool(saturation),
    updateContact: updateContactTool(saturation),

    // Spaces
    listSpaces: listSpacesTool(saturation),
    getSpace: getSpaceTool(saturation),
    createSpace: createSpaceTool(saturation),
    updateSpace: updateSpaceTool(saturation),
    deleteSpace: deleteSpaceTool(saturation),

    // Comments
    listComments: listCommentsTool(saturation),

    // Workspace Rates
    listWorkspaceRates: listWorkspaceRatesTool(saturation),
    createWorkspaceRate: createWorkspaceRateTool(saturation),
    updateWorkspaceRate: updateWorkspaceRateTool(saturation),
    deleteWorkspaceRate: deleteWorkspaceRateTool(saturation),

    // Public Rates
    listPublicRatepacks: listPublicRatepacksTool(saturation),
    getPublicRates: getPublicRatesTool(saturation),

    // Transactions
    listTransactions: listTransactionsTool(saturation),
    getTransaction: getTransactionTool(saturation),
    updateTransaction: updateTransactionTool(saturation),
  } as const
}
