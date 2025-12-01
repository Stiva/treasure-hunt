import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/utils";
import {
  getSessionById,
  createManyPlayers,
  isEmailUnique,
  getPlayersBySessionId,
} from "@/lib/db/queries";
import { importPlayersSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/admin/sessions/[id]/players/import - Import multiple players
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;
    const sessionId = parseInt(id);

    if (isNaN(sessionId)) {
      return errorResponse("Invalid session ID");
    }

    const session = await getSessionById(sessionId);
    if (!session) {
      return notFoundResponse("Sessione non trovata");
    }

    const body = await request.json();
    const validation = importPlayersSchema.safeParse({
      ...body,
      sessionId,
    });

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message);
    }

    const { players: playersToImport } = validation.data;

    if (playersToImport.length === 0) {
      return errorResponse("Nessun giocatore da importare");
    }

    // Get existing players to check for duplicates
    const existingPlayers = await getPlayersBySessionId(sessionId);
    const existingEmails = new Set(
      existingPlayers.map((p) => p.email.toLowerCase())
    );

    // Separate valid and duplicate players
    const validPlayers: typeof playersToImport = [];
    const duplicateEmails: string[] = [];
    const seenEmails = new Set<string>();

    for (const player of playersToImport) {
      const email = player.email.toLowerCase();

      // Check if email already exists in session or in current import batch
      if (existingEmails.has(email) || seenEmails.has(email)) {
        duplicateEmails.push(player.email);
      } else {
        validPlayers.push(player);
        seenEmails.add(email);
      }
    }

    // Create valid players
    let createdPlayers: Awaited<ReturnType<typeof createManyPlayers>> = [];
    if (validPlayers.length > 0) {
      createdPlayers = await createManyPlayers(
        validPlayers.map((p) => ({
          ...p,
          sessionId,
        }))
      );
    }

    return successResponse(
      {
        imported: createdPlayers.length,
        skipped: duplicateEmails.length,
        duplicateEmails: duplicateEmails.slice(0, 10), // Show max 10 duplicates
        players: createdPlayers,
      },
      `${createdPlayers.length} giocatori importati${
        duplicateEmails.length > 0
          ? `, ${duplicateEmails.length} email duplicate saltate`
          : ""
      }`,
      201
    );
  } catch (error) {
    console.error("Error importing players:", error);
    return errorResponse("Failed to import players", 500);
  }
}
