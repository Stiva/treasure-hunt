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
  getTeamsBySessionId,
  createTeam,
} from "@/lib/db/queries";
import { createTeamSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/sessions/[id]/teams - List all teams for a session
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

    const teams = await getTeamsBySessionId(sessionId);
    return successResponse(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return errorResponse("Failed to fetch teams", 500);
  }
}

// POST /api/admin/sessions/[id]/teams - Create a new team
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
    const validation = createTeamSchema.safeParse({
      ...body,
      sessionId,
    });

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message);
    }

    const team = await createTeam(validation.data);

    return successResponse(team, "Squadra creata con successo", 201);
  } catch (error) {
    console.error("Error creating team:", error);
    return errorResponse("Failed to create team", 500);
  }
}
