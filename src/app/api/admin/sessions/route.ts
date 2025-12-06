import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/utils";
import {
  getAllSessions,
  createSession,
  isKeywordUnique,
} from "@/lib/db/queries";
import { createSessionSchema } from "@/lib/validations";

// GET /api/admin/sessions - List all sessions
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    const sessions = await getAllSessions();
    return successResponse(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return errorResponse("Failed to fetch sessions", 500);
  }
}

// POST /api/admin/sessions - Create a new session
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const validation = createSessionSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message);
    }

    const { name, keyword, teamSize, adminDisplayName, victoryMessageIt, victoryMessageEn, helpContentIt, helpContentEn } = validation.data;

    // Check if keyword is unique
    const isUnique = await isKeywordUnique(keyword);
    if (!isUnique) {
      return errorResponse("La parola chiave è già in uso");
    }

    const session = await createSession({
      name,
      keyword,
      teamSize,
      adminDisplayName,
      victoryMessageIt,
      victoryMessageEn,
      helpContentIt,
      helpContentEn,
    });

    return successResponse(session, "Sessione creata con successo", 201);
  } catch (error) {
    console.error("Error creating session:", error);
    return errorResponse("Failed to create session", 500);
  }
}
