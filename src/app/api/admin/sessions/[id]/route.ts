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
  updateSession,
  deleteSession,
  isKeywordUnique,
} from "@/lib/db/queries";
import { updateSessionSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/sessions/[id] - Get session by ID
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

    return successResponse(session);
  } catch (error) {
    console.error("Error fetching session:", error);
    return errorResponse("Failed to fetch session", 500);
  }
}

// PUT /api/admin/sessions/[id] - Update session
export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const body = await request.json();
    const validation = updateSessionSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message);
    }

    const { name, keyword, gameMode } = validation.data;

    // Check if session exists
    const existingSession = await getSessionById(sessionId);
    if (!existingSession) {
      return notFoundResponse("Sessione non trovata");
    }

    // Check if keyword is unique (excluding current session)
    if (keyword) {
      const isUnique = await isKeywordUnique(keyword, sessionId);
      if (!isUnique) {
        return errorResponse("La parola chiave è già in uso");
      }
    }

    const updatedSession = await updateSession(sessionId, {
      name,
      keyword,
      gameMode,
    });

    return successResponse(updatedSession, "Sessione aggiornata con successo");
  } catch (error) {
    console.error("Error updating session:", error);
    return errorResponse("Failed to update session", 500);
  }
}

// DELETE /api/admin/sessions/[id] - Delete session
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

    const existingSession = await getSessionById(sessionId);
    if (!existingSession) {
      return notFoundResponse("Sessione non trovata");
    }

    await deleteSession(sessionId);

    return successResponse(null, "Sessione eliminata con successo");
  } catch (error) {
    console.error("Error deleting session:", error);
    return errorResponse("Failed to delete session", 500);
  }
}
