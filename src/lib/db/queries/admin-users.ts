import { eq, desc } from "drizzle-orm";
import { db, adminUsers, type AdminUser, type NewAdminUser } from "../index";

export async function getAdminUserByClerkId(
  clerkId: string
): Promise<AdminUser | undefined> {
  const [user] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.clerkId, clerkId))
    .limit(1);
  return user;
}

export async function getAllAdminUsers(): Promise<AdminUser[]> {
  return db.select().from(adminUsers).orderBy(desc(adminUsers.createdAt));
}

export async function createAdminUser(
  data: NewAdminUser
): Promise<AdminUser> {
  const [user] = await db.insert(adminUsers).values(data).returning();
  return user;
}

export async function updateAdminUserStatus(
  id: number,
  status: "pending" | "approved" | "rejected",
  approvedBy?: string
): Promise<AdminUser | undefined> {
  const updateData: Partial<AdminUser> = { status };

  if (status === "approved" && approvedBy) {
    updateData.approvedAt = new Date();
    updateData.approvedBy = approvedBy;
  }

  const [user] = await db
    .update(adminUsers)
    .set(updateData)
    .where(eq(adminUsers.id, id))
    .returning();
  return user;
}

export async function isAdminApproved(clerkId: string): Promise<boolean> {
  const user = await getAdminUserByClerkId(clerkId);
  return user?.status === "approved";
}

export async function getOrCreateAdminUser(
  clerkId: string,
  email: string,
  firstName?: string | null,
  lastName?: string | null
): Promise<AdminUser> {
  const existing = await getAdminUserByClerkId(clerkId);
  if (existing) {
    return existing;
  }

  return createAdminUser({
    clerkId,
    email,
    firstName: firstName || null,
    lastName: lastName || null,
    status: "pending",
  });
}

export async function deleteAdminUser(id: number): Promise<void> {
  await db.delete(adminUsers).where(eq(adminUsers.id, id));
}
