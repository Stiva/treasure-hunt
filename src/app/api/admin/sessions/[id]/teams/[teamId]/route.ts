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
  getTeamWithPlayers,
  updateTeam,
  deleteTeam,
} from "@/lib/db/queries";
import { updateTeamSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string; teamId: string }>;
}

// GET /api/admin/sessions/[id]/teams/[teamId] - Get team by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const team = await getTeamWithPlayers(id);

    if (!team) {
      return notFoundResponse("Squadra non trovata");
    }

    return successResponse(team);
  } catch (error) {
    console.error("Error fetching team:", error);
    return errorResponse("Failed to fetch team", 500);
  }
}

// PUT /api/admin/sessions/[id]/teams/[teamId] - Update team
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
    const validation = updateTeamSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message);
    }

    // Check if team exists
    const existingTeam = await getTeamById(id);
    if (!existingTeam) {
      return notFoundResponse("Squadra non trovata");
    }

    const updatedTeam = await updateTeam(id, validation.data);

    return successResponse(updatedTeam, "Squadra aggiornata con successo");
  } catch (error) {
    console.error("Error updating team:", error);
    return errorResponse("Failed to update team", 500);
  }
}

// DELETE /api/admin/sessions/[id]/teams/[teamId] - Delete team
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const existingTeam = await getTeamById(id);
    if (!existingTeam) {
      return notFoundResponse("Squadra non trovata");
    }

    await deleteTeam(id);

    return successResponse(null, "Squadra eliminata con successo");
  } catch (error) {
    console.error("Error deleting team:", error);
    return errorResponse("Failed to delete team", 500);
  }
}
