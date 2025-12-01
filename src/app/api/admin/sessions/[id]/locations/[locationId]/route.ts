import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/utils";
import {
  getLocationById,
  updateLocation,
  deleteLocation,
  isLocationCodeUnique,
} from "@/lib/db/queries";
import { updateLocationSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string; locationId: string }>;
}

// GET /api/admin/sessions/[id]/locations/[locationId] - Get location by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    const { locationId } = await params;
    const id = parseInt(locationId);

    if (isNaN(id)) {
      return errorResponse("Invalid location ID");
    }

    const location = await getLocationById(id);

    if (!location) {
      return notFoundResponse("Tappa non trovata");
    }

    return successResponse(location);
  } catch (error) {
    console.error("Error fetching location:", error);
    return errorResponse("Failed to fetch location", 500);
  }
}

// PUT /api/admin/sessions/[id]/locations/[locationId] - Update location
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    const { id: sessionId, locationId } = await params;
    const id = parseInt(locationId);
    const sId = parseInt(sessionId);

    if (isNaN(id) || isNaN(sId)) {
      return errorResponse("Invalid ID");
    }

    const body = await request.json();
    const validation = updateLocationSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message);
    }

    // Check if location exists
    const existingLocation = await getLocationById(id);
    if (!existingLocation) {
      return notFoundResponse("Tappa non trovata");
    }

    // Check if code is unique (excluding current location)
    if (validation.data.code) {
      const isUnique = await isLocationCodeUnique(
        sId,
        validation.data.code,
        id
      );
      if (!isUnique) {
        return errorResponse("Il codice è già in uso in questa sessione");
      }
    }

    const updatedLocation = await updateLocation(id, validation.data);

    return successResponse(updatedLocation, "Tappa aggiornata con successo");
  } catch (error) {
    console.error("Error updating location:", error);
    return errorResponse("Failed to update location", 500);
  }
}

// DELETE /api/admin/sessions/[id]/locations/[locationId] - Delete location
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    const { locationId } = await params;
    const id = parseInt(locationId);

    if (isNaN(id)) {
      return errorResponse("Invalid location ID");
    }

    const existingLocation = await getLocationById(id);
    if (!existingLocation) {
      return notFoundResponse("Tappa non trovata");
    }

    await deleteLocation(id);

    return successResponse(null, "Tappa eliminata con successo");
  } catch (error) {
    console.error("Error deleting location:", error);
    return errorResponse("Failed to delete location", 500);
  }
}
