import { z } from "zod";

export const createLocationSchema = z.object({
  sessionId: z.number().int().positive(),
  code: z
    .string()
    .min(1, "Il codice è obbligatorio")
    .max(50, "Il codice è troppo lungo")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Il codice può contenere solo lettere, numeri, trattini e underscore"
    ),
  nameIt: z
    .string()
    .min(1, "Il nome italiano è obbligatorio")
    .max(255, "Il nome è troppo lungo"),
  nameEn: z
    .string()
    .min(1, "Il nome inglese è obbligatorio")
    .max(255, "Il nome è troppo lungo"),
  riddleIt: z.string().max(2000, "L'indovinello è troppo lungo").optional().nullable(),
  riddleEn: z.string().max(2000, "L'indovinello è troppo lungo").optional().nullable(),
  hint1It: z.string().max(500, "L'indizio è troppo lungo").optional().nullable(),
  hint1En: z.string().max(500, "L'indizio è troppo lungo").optional().nullable(),
  hint2It: z.string().max(500, "L'indizio è troppo lungo").optional().nullable(),
  hint2En: z.string().max(500, "L'indizio è troppo lungo").optional().nullable(),
  hint3It: z.string().max(500, "L'indizio è troppo lungo").optional().nullable(),
  hint3En: z.string().max(500, "L'indizio è troppo lungo").optional().nullable(),
  latitude: z.string().max(20, "Coordinata troppo lunga").optional().nullable(),
  longitude: z.string().max(20, "Coordinata troppo lunga").optional().nullable(),
  isStart: z.boolean().default(false),
  isEnd: z.boolean().default(false),
  orderIndex: z.number().int().min(0).default(0),
});

export const updateLocationSchema = createLocationSchema.partial().omit({
  sessionId: true,
});

export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
