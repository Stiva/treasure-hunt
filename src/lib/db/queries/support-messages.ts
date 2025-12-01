import { eq, and, desc, asc, sql } from "drizzle-orm";
import {
  db,
  supportMessages,
  teams,
  players,
  adminUsers,
  type SupportMessage,
  type NewSupportMessage,
  type GameContext,
} from "../index";

export interface SupportMessageWithDetails extends SupportMessage {
  team?: {
    id: number;
    name: string;
  };
  player?: {
    id: number;
    firstName: string;
    lastName: string;
  } | null;
  adminUser?: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
}

export interface TeamWithMessages {
  teamId: number;
  teamName: string;
  unreadCount: number;
  lastMessage: SupportMessage | null;
  messages: SupportMessageWithDetails[];
}

// Get all messages for a team
export async function getMessagesByTeam(
  teamId: number
): Promise<SupportMessageWithDetails[]> {
  const messages = await db
    .select()
    .from(supportMessages)
    .where(eq(supportMessages.teamId, teamId))
    .orderBy(asc(supportMessages.createdAt));

  // Fetch related data
  const result: SupportMessageWithDetails[] = [];
  for (const msg of messages) {
    const enriched: SupportMessageWithDetails = { ...msg };

    if (msg.playerId) {
      const [player] = await db
        .select({
          id: players.id,
          firstName: players.firstName,
          lastName: players.lastName,
        })
        .from(players)
        .where(eq(players.id, msg.playerId))
        .limit(1);
      enriched.player = player || null;
    }

    if (msg.adminUserId) {
      const [admin] = await db
        .select({
          id: adminUsers.id,
          firstName: adminUsers.firstName,
          lastName: adminUsers.lastName,
          email: adminUsers.email,
        })
        .from(adminUsers)
        .where(eq(adminUsers.id, msg.adminUserId))
        .limit(1);
      enriched.adminUser = admin || null;
    }

    result.push(enriched);
  }

  return result;
}

// Get all messages for a session grouped by team
export async function getMessagesBySession(
  sessionId: number
): Promise<TeamWithMessages[]> {
  // Get all teams with messages in this session
  const teamsWithMessages = await db
    .selectDistinct({
      teamId: supportMessages.teamId,
    })
    .from(supportMessages)
    .where(eq(supportMessages.sessionId, sessionId));

  const result: TeamWithMessages[] = [];

  for (const { teamId } of teamsWithMessages) {
    // Get team info
    const [team] = await db
      .select({ id: teams.id, name: teams.name })
      .from(teams)
      .where(eq(teams.id, teamId))
      .limit(1);

    if (!team) continue;

    // Get messages for this team
    const messages = await getMessagesByTeam(teamId);

    // Count unread messages (from players, not from admin)
    const unreadCount = messages.filter(
      (m) => !m.isFromAdmin && !m.isRead
    ).length;

    // Get last message
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

    result.push({
      teamId: team.id,
      teamName: team.name,
      unreadCount,
      lastMessage,
      messages,
    });
  }

  // Sort by unread first, then by last message time
  result.sort((a, b) => {
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
    if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
    const aTime = a.lastMessage?.createdAt?.getTime() || 0;
    const bTime = b.lastMessage?.createdAt?.getTime() || 0;
    return bTime - aTime;
  });

  return result;
}

// Get unread count for a session
export async function getUnreadCountBySession(
  sessionId: number
): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(supportMessages)
    .where(
      and(
        eq(supportMessages.sessionId, sessionId),
        eq(supportMessages.isFromAdmin, false),
        eq(supportMessages.isRead, false)
      )
    );
  return result[0]?.count || 0;
}

// Get unread count for a team (admin replies)
export async function getUnreadCountByTeam(teamId: number): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(supportMessages)
    .where(
      and(
        eq(supportMessages.teamId, teamId),
        eq(supportMessages.isFromAdmin, true),
        eq(supportMessages.isRead, false)
      )
    );
  return result[0]?.count || 0;
}

// Create a new message
export async function createSupportMessage(
  data: NewSupportMessage
): Promise<SupportMessage> {
  const [message] = await db.insert(supportMessages).values(data).returning();
  return message;
}

// Create player message with game context
export async function createPlayerMessage(
  teamId: number,
  sessionId: number,
  playerId: number,
  message: string,
  gameContext: GameContext,
  attachmentUrl?: string,
  attachmentType?: string
): Promise<SupportMessage> {
  return createSupportMessage({
    sessionId,
    teamId,
    playerId,
    message,
    attachmentUrl,
    attachmentType,
    isFromAdmin: false,
    isRead: false,
    gameContext,
  });
}

// Create admin reply
export async function createAdminReply(
  teamId: number,
  sessionId: number,
  adminUserId: number,
  message: string,
  attachmentUrl?: string,
  attachmentType?: string
): Promise<SupportMessage> {
  return createSupportMessage({
    sessionId,
    teamId,
    adminUserId,
    message,
    attachmentUrl,
    attachmentType,
    isFromAdmin: true,
    isRead: false,
  });
}

// Mark messages as read
export async function markMessagesAsRead(teamId: number): Promise<void> {
  await db
    .update(supportMessages)
    .set({ isRead: true })
    .where(
      and(
        eq(supportMessages.teamId, teamId),
        eq(supportMessages.isFromAdmin, false)
      )
    );
}

// Mark admin replies as read (for player)
export async function markAdminRepliesAsRead(teamId: number): Promise<void> {
  await db
    .update(supportMessages)
    .set({ isRead: true })
    .where(
      and(
        eq(supportMessages.teamId, teamId),
        eq(supportMessages.isFromAdmin, true)
      )
    );
}
