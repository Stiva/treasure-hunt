import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/utils";
import {
  getTeamById,
  assignPlayersToTeam,
  getTeamWithPlayers,
} from "@/lib/db/queries";
import { assignPlayersSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string; teamId: string }>;
}

// PUT /api/admin/sessions/[id]/teams/[teamId]/players - Assign players to team
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    const { teamId } = await params;
    const id = parseInt(teamId);

    if (isNaN(id)) {
      return errorResponse("Invalid team ID");
    }

    const body = await request.json();
    const validation = assignPlayersSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message);
    }

    // Check if team exists
    const existingTeam = await getTeamById(id);
    if (!existingTeam) {
      return notFoundResponse("Squadra non trovata");
    }

    await assignPlayersToTeam(id, validation.data.playerIds);
    const updatedTeam = await getTeamWithPlayers(id);

    return successResponse(updatedTeam, "Giocatori assegnati con successo");
  } catch (error) {
    console.error("Error assigning players:", error);
    return errorResponse("Failed to assign players", 500);
  }
}
