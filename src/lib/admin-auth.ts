import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateAdminUser, getAdminUserByClerkId } from "@/lib/db/queries/admin-users";

export type AdminStatus = "pending" | "approved" | "rejected" | "unauthenticated";

export interface AdminAuthResult {
  isAuthenticated: boolean;
  isApproved: boolean;
  status: AdminStatus;
  clerkId: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
}

export async function checkAdminAuth(): Promise<AdminAuthResult> {
  const { userId } = await auth();

  if (!userId) {
    return {
      isAuthenticated: false,
      isApproved: false,
      status: "unauthenticated",
      clerkId: null,
      email: null,
      firstName: null,
      lastName: null,
    };
  }

  const user = await currentUser();
  if (!user) {
    return {
      isAuthenticated: true,
      isApproved: false,
      status: "pending",
      clerkId: userId,
      email: null,
      firstName: null,
      lastName: null,
    };
  }

  // Get or create admin user record
  const adminUser = await getOrCreateAdminUser(
    userId,
    user.emailAddresses[0]?.emailAddress || "",
    user.firstName,
    user.lastName
  );

  return {
    isAuthenticated: true,
    isApproved: adminUser.status === "approved",
    status: adminUser.status,
    clerkId: userId,
    email: adminUser.email,
    firstName: adminUser.firstName,
    lastName: adminUser.lastName,
  };
}

export async function isFirstAdmin(): Promise<boolean> {
  // Check if there are any approved admins in the system
  const { getAllAdminUsers } = await import("@/lib/db/queries/admin-users");
  const users = await getAllAdminUsers();
  const approvedUsers = users.filter((u) => u.status === "approved");
  return approvedUsers.length === 0;
}
