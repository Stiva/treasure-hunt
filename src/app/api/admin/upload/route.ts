import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  uploadToCloudinary,
  getResourceType,
  MAX_FILE_SIZES,
} from "@/lib/cloudinary";

export async function POST(request: Request) {
  // Check admin authentication
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json(
      { success: false, error: "Non autorizzato" },
      { status: 401 }
    );
  }

  // Verify admin status
  const adminUser = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.clerkId, clerkId),
  });

  if (!adminUser || adminUser.status !== "approved") {
    return NextResponse.json(
      { success: false, error: "Non autorizzato" },
      { status: 403 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Nessun file caricato" },
        { status: 400 }
      );
    }

    // Validate file type
    const resourceType = getResourceType(file.type);
    if (!resourceType) {
      return NextResponse.json(
        {
          success: false,
          error: "Tipo di file non supportato. Sono accettati solo immagini e video.",
        },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = MAX_FILE_SIZES[resourceType];
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return NextResponse.json(
        {
          success: false,
          error: `Il file è troppo grande. Dimensione massima: ${maxSizeMB}MB`,
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, resourceType, file.name);

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        type: result.resourceType,
      },
    });
  } catch (error) {
    console.error("Admin upload error:", error);
    return NextResponse.json(
      { success: false, error: "Errore durante il caricamento del file" },
      { status: 500 }
    );
  }
}

// Export route segment config for larger body size
export const maxDuration = 60;
