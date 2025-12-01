import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/utils";
import {
  getPlayerById,
  updatePlayer,
  deletePlayer,
  isEmailUnique,
} from "@/lib/db/queries";
import { updatePlayerSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string; playerId: string }>;
}

// GET /api/admin/sessions/[id]/players/[playerId] - Get player by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    const { playerId } = await params;
    const id = parseInt(playerId);

    if (isNaN(id)) {
      return errorResponse("Invalid player ID");
    }

    const player = await getPlayerById(id);

    if (!player) {
      return notFoundResponse("Giocatore non trovato");
    }

    return successResponse(player);
  } catch (error) {
    console.error("Error fetching player:", error);
    return errorResponse("Failed to fetch player", 500);
  }
}

// PUT /api/admin/sessions/[id]/players/[playerId] - Update player
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    const { id: sessionId, playerId } = await params;
    const id = parseInt(playerId);
    const sId = parseInt(sessionId);

    if (isNaN(id) || isNaN(sId)) {
      return errorResponse("Invalid ID");
    }

    const body = await request.json();
    const validation = updatePlayerSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message);
    }

    // Check if player exists
    const existingPlayer = await getPlayerById(id);
    if (!existingPlayer) {
      return notFoundResponse("Giocatore non trovato");
    }

    // Check if email is unique (excluding current player)
    if (validation.data.email) {
      const isUnique = await isEmailUnique(
        sId,
        validation.data.email,
        id
      );
      if (!isUnique) {
        return errorResponse("L'email è già in uso in questa sessione");
      }
    }

    const updatedPlayer = await updatePlayer(id, validation.data);

    return successResponse(updatedPlayer, "Giocatore aggiornato con successo");
  } catch (error) {
    console.error("Error updating player:", error);
    return errorResponse("Failed to update player", 500);
  }
}

// DELETE /api/admin/sessions/[id]/players/[playerId] - Delete player
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    const { playerId } = await params;
    const id = parseInt(playerId);

    if (isNaN(id)) {
      return errorResponse("Invalid player ID");
    }

    const existingPlayer = await getPlayerById(id);
    if (!existingPlayer) {
      return notFoundResponse("Giocatore non trovato");
    }

    await deletePlayer(id);

    return successResponse(null, "Giocatore eliminato con successo");
  } catch (error) {
    console.error("Error deleting player:", error);
    return errorResponse("Failed to delete player", 500);
  }
}
