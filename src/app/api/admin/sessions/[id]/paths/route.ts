import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
  generateUniquePaths,
  validateLocationsForPathGeneration,
  canGenerateUniquePaths,
} from "@/lib/utils";
import {
  getSessionById,
  getLocationsBySessionId,
  getTeamsBySessionId,
  createManyTeamPaths,
  deleteAllPathsBySessionId,
  getTeamPath,
} from "@/lib/db/queries";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/sessions/[id]/paths - Get paths info/status
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

    const [session, locations, teams] = await Promise.all([
      getSessionById(sessionId),
      getLocationsBySessionId(sessionId),
      getTeamsBySessionId(sessionId),
    ]);

    if (!session) {
      return notFoundResponse("Sessione non trovata");
    }

    const validation = validateLocationsForPathGeneration(locations);

    // Get path info for each team
    const teamsWithPaths = await Promise.all(
      teams.map(async (team) => {
        const path = await getTeamPath(team.id);
        return {
          ...team,
          hasPath: path.length > 0,
          pathLength: path.length,
        };
      })
    );

    const teamsWithPathsCount = teamsWithPaths.filter((t) => t.hasPath).length;
    const intermediateCount = validation.intermediateLocations?.length || 0;

    const uniqueInfo = canGenerateUniquePaths(intermediateCount, teams.length);

    return successResponse({
      canGeneratePaths: validation.isValid,
      validationError: validation.error,
      stats: {
        totalTeams: teams.length,
        teamsWithPaths: teamsWithPathsCount,
        teamsWithoutPaths: teams.length - teamsWithPathsCount,
        totalLocations: locations.length,
        intermediateLocations: intermediateCount,
        maxUniquePaths: uniqueInfo.maxUniquePaths,
        canBeUnique: uniqueInfo.canBeUnique,
      },
      teams: teamsWithPaths,
    });
  } catch (error) {
    console.error("Error fetching paths info:", error);
    return errorResponse("Failed to fetch paths info", 500);
  }
}

// POST /api/admin/sessions/[id]/paths - Generate paths for all teams
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

    const [session, locations, teams] = await Promise.all([
      getSessionById(sessionId),
      getLocationsBySessionId(sessionId),
      getTeamsBySessionId(sessionId),
    ]);

    if (!session) {
      return notFoundResponse("Sessione non trovata");
    }

    if (teams.length === 0) {
      return errorResponse("Nessuna squadra da cui generare percorsi");
    }

    // Validate locations
    const validation = validateLocationsForPathGeneration(locations);
    if (!validation.isValid) {
      return errorResponse(validation.error!);
    }

    const { startLocation, endLocation, intermediateLocations } = validation;

    // Check if we should regenerate
    const body = await request.json().catch(() => ({}));
    const regenerate = body.regenerate === true;

    if (regenerate) {
      // Delete existing paths
      await deleteAllPathsBySessionId(sessionId);
    }

    // Get team IDs that need paths
    const teamIds = teams.map((t) => t.id);

    // Generate unique paths
    const generatedPaths = generateUniquePaths(
      startLocation!,
      endLocation!,
      intermediateLocations!,
      teamIds
    );

    // Save paths to database
    const pathsToInsert = generatedPaths.flatMap((gp) =>
      gp.locations.map((location, index) => ({
        teamId: gp.teamId,
        locationId: location.id,
        stageOrder: index,
      }))
    );

    await createManyTeamPaths(pathsToInsert);

    // Calculate uniqueness stats
    const signatures = new Set(generatedPaths.map((p) => p.pathSignature));
    const uniquePathsCount = signatures.size;

    return successResponse(
      {
        pathsGenerated: generatedPaths.length,
        uniquePaths: uniquePathsCount,
        stagesPerPath: startLocation!.id === endLocation!.id ? 1 : 2 + intermediateLocations!.length,
        duplicatePaths:
          generatedPaths.length > uniquePathsCount
            ? generatedPaths.length - uniquePathsCount
            : 0,
      },
      `${generatedPaths.length} percorsi generati con successo (${uniquePathsCount} unici)`,
      201
    );
  } catch (error) {
    console.error("Error generating paths:", error);
    return errorResponse("Failed to generate paths", 500);
  }
}

// DELETE /api/admin/sessions/[id]/paths - Delete all paths
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    await deleteAllPathsBySessionId(sessionId);

    return successResponse(null, "Percorsi eliminati con successo");
  } catch (error) {
    console.error("Error deleting paths:", error);
    return errorResponse("Failed to delete paths", 500);
  }
}
