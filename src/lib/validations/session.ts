import { z } from "zod";

// Schema for customizable help content
export const helpContentSchema = z.object({
  rules: z.array(z.string()).default([]),
  steps: z.array(z.string()).default([]),
  tips: z.array(z.string()).default([]),
}).nullable().optional();

export const createSessionSchema = z.object({
  name: z
    .string()
    .min(1, "Il nome è obbligatorio")
    .max(255, "Il nome è troppo lungo"),
  keyword: z
    .string()
    .min(3, "La parola chiave deve avere almeno 3 caratteri")
    .max(100, "La parola chiave è troppo lunga")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "La parola chiave può contenere solo lettere, numeri, trattini e underscore"
    ),
  teamSize: z.number().int().min(1, "La dimensione deve essere almeno 1").default(2),
  adminDisplayName: z.string().max(100, "Il nome è troppo lungo").optional(),
  victoryMessageIt: z.string().max(2000, "Il messaggio è troppo lungo").optional(),
  victoryMessageEn: z.string().max(2000, "The message is too long").optional(),
  helpContentIt: helpContentSchema,
  helpContentEn: helpContentSchema,
});

export const updateSessionSchema = z.object({
  name: z
    .string()
    .min(1, "Il nome è obbligatorio")
    .max(255, "Il nome è troppo lungo")
    .optional(),
  keyword: z
    .string()
    .min(3, "La parola chiave deve avere almeno 3 caratteri")
    .max(100, "La parola chiave è troppo lunga")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "La parola chiave può contenere solo lettere, numeri, trattini e underscore"
    )
    .optional(),
  teamSize: z.number().int().min(1, "La dimensione deve essere almeno 1").optional(),
  adminDisplayName: z.string().max(100, "Il nome è troppo lungo").optional().nullable(),
  victoryMessageIt: z.string().max(2000, "Il messaggio è troppo lungo").optional(),
  victoryMessageEn: z.string().max(2000, "The message is too long").optional(),
  helpContentIt: helpContentSchema,
  helpContentEn: helpContentSchema,
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
