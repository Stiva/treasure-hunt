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
  getPlayersBySessionId,
  createPlayer,
  isEmailUnique,
} from "@/lib/db/queries";
import { createPlayerSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/sessions/[id]/players - List all players for a session
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const players = await getPlayersBySessionId(sessionId);
    return successResponse(players);
  } catch (error) {
    console.error("Error fetching players:", error);
    return errorResponse("Failed to fetch players", 500);
  }
}

// POST /api/admin/sessions/[id]/players - Create a new player
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
    const validation = createPlayerSchema.safeParse({
      ...body,
      sessionId,
    });

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message);
    }

    const data = validation.data;

    // Check if email is unique within the session
    const isUnique = await isEmailUnique(sessionId, data.email);
    if (!isUnique) {
      return errorResponse("L'email è già in uso in questa sessione");
    }

    const player = await createPlayer(data);

    return successResponse(player, "Giocatore creato con successo", 201);
  } catch (error) {
    console.error("Error creating player:", error);
    return errorResponse("Failed to create player", 500);
  }
}
