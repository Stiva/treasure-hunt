import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateAdminUser } from "@/lib/db/queries/admin-users";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );
  }

  // Get or create admin user record
  const adminUser = await getOrCreateAdminUser(
    userId,
    user.emailAddresses[0]?.emailAddress || "",
    user.firstName,
    user.lastName
  );

  return NextResponse.json({
    success: true,
    data: {
      status: adminUser.status,
      email: adminUser.email,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
    },
  });
}
