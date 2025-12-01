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
  activateSession,
  deactivateSession,
} from "@/lib/db/queries";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/admin/sessions/[id]/activate - Activate or deactivate session
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

    const existingSession = await getSessionById(sessionId);
    if (!existingSession) {
      return notFoundResponse("Sessione non trovata");
    }

    // Toggle activation
    let updatedSession;
    if (existingSession.isActive) {
      updatedSession = await deactivateSession(sessionId);
    } else {
      updatedSession = await activateSession(sessionId);
    }

    const message = updatedSession?.isActive
      ? "Sessione attivata con successo"
      : "Sessione disattivata con successo";

    return successResponse(updatedSession, message);
  } catch (error) {
    console.error("Error toggling session activation:", error);
    return errorResponse("Failed to toggle session activation", 500);
  }
}
