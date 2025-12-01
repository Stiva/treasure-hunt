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
  getLocationsBySessionId,
  createLocation,
  isLocationCodeUnique,
} from "@/lib/db/queries";
import { createLocationSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/sessions/[id]/locations - List all locations for a session
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

    const locations = await getLocationsBySessionId(sessionId);
    return successResponse(locations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    return errorResponse("Failed to fetch locations", 500);
  }
}

// POST /api/admin/sessions/[id]/locations - Create a new location
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
    const validation = createLocationSchema.safeParse({
      ...body,
      sessionId,
    });

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message);
    }

    const data = validation.data;

    // Check if code is unique within the session
    const isUnique = await isLocationCodeUnique(sessionId, data.code);
    if (!isUnique) {
      return errorResponse("Il codice è già in uso in questa sessione");
    }

    const location = await createLocation(data);

    return successResponse(location, "Tappa creata con successo", 201);
  } catch (error) {
    console.error("Error creating location:", error);
    return errorResponse("Failed to create location", 500);
  }
}
