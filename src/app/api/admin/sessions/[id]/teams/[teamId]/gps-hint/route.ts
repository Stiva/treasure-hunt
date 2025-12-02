import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/utils";
import { getTeamById, updateTeam } from "@/lib/db/queries";

interface RouteParams {
  params: Promise<{ id: string; teamId: string }>;
}

// POST /api/admin/sessions/[id]/teams/[teamId]/gps-hint - Toggle GPS hint
export async function POST(request: NextRequest, { params }: RouteParams) {
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
    const { enabled } = body;

    if (typeof enabled !== "boolean") {
      return errorResponse("Il campo 'enabled' deve essere un booleano");
    }

    // Check if team exists
    const existingTeam = await getTeamById(id);
    if (!existingTeam) {
      return notFoundResponse("Squadra non trovata");
    }

    const updatedTeam = await updateTeam(id, { gpsHintEnabled: enabled });

    return successResponse(
      updatedTeam,
      enabled
        ? "GPS hint abilitato per la squadra"
        : "GPS hint disabilitato per la squadra"
    );
  } catch (error) {
    console.error("Error toggling GPS hint:", error);
    return errorResponse("Failed to toggle GPS hint", 500);
  }
}
