import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  updateAdminUserStatus,
  deleteAdminUser,
  isAdminApproved,
} from "@/lib/db/queries/admin-users";

interface RouteParams {
  params: Promise<{ userId: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Check if current user is an approved admin
  const isApproved = await isAdminApproved(clerkUserId);
  if (!isApproved) {
    return NextResponse.json(
      { success: false, error: "Only approved admins can manage users" },
      { status: 403 }
    );
  }

  const { userId } = await params;
  const userIdNum = parseInt(userId);

  if (isNaN(userIdNum)) {
    return NextResponse.json(
      { success: false, error: "Invalid user ID" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { action } = body;

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { success: false, error: "Invalid action" },
        { status: 400 }
      );
    }

    const user = await currentUser();
    const approverInfo = user?.emailAddresses[0]?.emailAddress || clerkUserId;

    const status = action === "approve" ? "approved" : "rejected";
    const updatedUser = await updateAdminUserStatus(
      userIdNum,
      status,
      action === "approve" ? approverInfo : undefined
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Error updating user status:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Check if current user is an approved admin
  const isApproved = await isAdminApproved(clerkUserId);
  if (!isApproved) {
    return NextResponse.json(
      { success: false, error: "Only approved admins can manage users" },
      { status: 403 }
    );
  }

  const { userId } = await params;
  const userIdNum = parseInt(userId);

  if (isNaN(userIdNum)) {
    return NextResponse.json(
      { success: false, error: "Invalid user ID" },
      { status: 400 }
    );
  }

  try {
    await deleteAdminUser(userIdNum);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
