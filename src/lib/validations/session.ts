import { z } from "zod";

export const gameModeSchema = z.enum(["solo", "couples"]);

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
  gameMode: gameModeSchema.default("couples"),
  victoryMessageIt: z.string().max(2000, "Il messaggio è troppo lungo").optional(),
  victoryMessageEn: z.string().max(2000, "The message is too long").optional(),
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
  gameMode: gameModeSchema.optional(),
  victoryMessageIt: z.string().max(2000, "Il messaggio è troppo lungo").optional(),
  victoryMessageEn: z.string().max(2000, "The message is too long").optional(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
