import { z } from "zod";

export const createPlayerSchema = z.object({
  sessionId: z.number().int().positive(),
  firstName: z
    .string()
    .min(1, "Il nome è obbligatorio")
    .max(100, "Il nome è troppo lungo"),
  lastName: z
    .string()
    .min(1, "Il cognome è obbligatorio")
    .max(100, "Il cognome è troppo lungo"),
  email: z
    .string()
    .email("Email non valida")
    .max(255, "L'email è troppa lunga"),
  teamId: z.number().int().positive().optional().nullable(),
});

export const updatePlayerSchema = createPlayerSchema.partial().omit({
  sessionId: true,
});

export const importPlayersSchema = z.object({
  sessionId: z.number().int().positive(),
  players: z.array(
    z.object({
      firstName: z.string().min(1).max(100),
      lastName: z.string().min(1).max(100),
      email: z.string().email().max(255),
    })
  ),
});

export const playerLoginSchema = z.object({
  email: z.string().email("Email non valida"),
  keyword: z.string().min(1, "La parola chiave è obbligatoria"),
});

export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;
export type ImportPlayersInput = z.infer<typeof importPlayersSchema>;
export type PlayerLoginInput = z.infer<typeof playerLoginSchema>;
