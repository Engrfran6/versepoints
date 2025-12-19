import { z } from "zod"

export const miningRequestSchema = z.object({
  fingerprint: z.string().min(1, "Fingerprint is required"),
  browserInfo: z
    .object({
      userAgent: z.string(),
      language: z.string(),
      screenResolution: z.string(),
      timezone: z.string(),
      platform: z.string(),
    })
    .optional(),
})

export type MiningRequest = z.infer<typeof miningRequestSchema>
