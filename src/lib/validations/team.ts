import { z } from "zod";

export const createTeamSchema = z.object({
  sessionId: z.number().int().positive(),
  name: z
    .string()
    .min(1, "Il nome è obbligatorio")
    .max(255, "Il nome è troppo lungo"),
});

export const updateTeamSchema = z.object({
  name: z
    .string()
    .min(1, "Il nome è obbligatorio")
    .max(255, "Il nome è troppo lungo")
    .optional(),
});

export const assignPlayersSchema = z.object({
  playerIds: z.array(z.number().int().positive()),
});

export const generateCouplesSchema = z.object({
  sessionId: z.number().int().positive(),
  method: z.enum(["random", "alphabetical"]),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
export type AssignPlayersInput = z.infer<typeof assignPlayersSchema>;
export type GenerateCouplesInput = z.infer<typeof generateCouplesSchema>;
