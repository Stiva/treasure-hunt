import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  uniqueIndex,
  pgEnum,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const adminStatusEnum = pgEnum("admin_status", ["pending", "approved", "rejected"]);

// ============================================
// SESSIONS TABLE
// ============================================
export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    keyword: varchar("keyword", { length: 100 }).notNull(),
    teamSize: integer("team_size").notNull().default(2),
    isActive: boolean("is_active").notNull().default(false),
    adminDisplayName: varchar("admin_display_name", { length: 100 }),
    victoryMessageIt: text("victory_message_it"),
    victoryMessageEn: text("victory_message_en"),
    helpContentIt: jsonb("help_content_it"),
    helpContentEn: jsonb("help_content_en"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("sessions_keyword_idx").on(table.keyword)]
);

export const sessionsRelations = relations(sessions, ({ many }) => ({
  locations: many(locations),
  teams: many(teams),
  players: many(players),
}));

// ============================================
// LOCATIONS TABLE
// ============================================
export const locations = pgTable(
  "locations",
  {
    id: serial("id").primaryKey(),
    sessionId: integer("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 50 }).notNull(),
    nameIt: varchar("name_it", { length: 255 }).notNull(),
    nameEn: varchar("name_en", { length: 255 }).notNull(),
    riddleIt: text("riddle_it"),
    riddleEn: text("riddle_en"),
    hint1It: text("hint1_it"),
    hint1En: text("hint1_en"),
    hint2It: text("hint2_it"),
    hint2En: text("hint2_en"),
    hint3It: text("hint3_it"),
    hint3En: text("hint3_en"),
    latitude: varchar("latitude", { length: 20 }),
    longitude: varchar("longitude", { length: 20 }),
    isStart: boolean("is_start").notNull().default(false),
    isEnd: boolean("is_end").notNull().default(false),
    orderIndex: integer("order_index").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("locations_code_session_idx").on(table.code, table.sessionId),
  ]
);

export const locationsRelations = relations(locations, ({ one, many }) => ({
  session: one(sessions, {
    fields: [locations.sessionId],
    references: [sessions.id],
  }),
  teamPaths: many(teamPaths),
}));

// ============================================
// TEAMS TABLE
// ============================================
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  currentStage: integer("current_stage").notNull().default(0),
  hintsUsedCurrentStage: integer("hints_used_current_stage").notNull().default(0),
  lastHintRequestedAt: timestamp("last_hint_requested_at"),
  gpsHintEnabled: boolean("gps_hint_enabled").notNull().default(false),
  gpsHintStage: integer("gps_hint_stage"),
  startedAt: timestamp("started_at"),
  finishedAt: timestamp("finished_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const teamsRelations = relations(teams, ({ one, many }) => ({
  session: one(sessions, {
    fields: [teams.sessionId],
    references: [sessions.id],
  }),
  players: many(players),
  paths: many(teamPaths),
}));

// ============================================
// PLAYERS TABLE
// ============================================
export const players = pgTable(
  "players",
  {
    id: serial("id").primaryKey(),
    sessionId: integer("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    teamId: integer("team_id").references(() => teams.id, {
      onDelete: "set null",
    }),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("players_email_session_idx").on(table.email, table.sessionId),
  ]
);

export const playersRelations = relations(players, ({ one, many }) => ({
  session: one(sessions, {
    fields: [players.sessionId],
    references: [sessions.id],
  }),
  team: one(teams, {
    fields: [players.teamId],
    references: [teams.id],
  }),
  playerSessions: many(playerSessions),
}));

// ============================================
// TEAM_PATHS TABLE
// ============================================
export const teamPaths = pgTable(
  "team_paths",
  {
    id: serial("id").primaryKey(),
    teamId: integer("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    locationId: integer("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),
    stageOrder: integer("stage_order").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("team_paths_team_stage_idx").on(table.teamId, table.stageOrder),
  ]
);

export const teamPathsRelations = relations(teamPaths, ({ one }) => ({
  team: one(teams, {
    fields: [teamPaths.teamId],
    references: [teams.id],
  }),
  location: one(locations, {
    fields: [teamPaths.locationId],
    references: [locations.id],
  }),
}));

// ============================================
// PLAYER_SESSIONS TABLE (Custom Auth)
// ============================================
export const playerSessions = pgTable(
  "player_sessions",
  {
    id: serial("id").primaryKey(),
    playerId: integer("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    sessionToken: varchar("session_token", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("player_sessions_token_idx").on(table.sessionToken),
  ]
);

export const playerSessionsRelations = relations(playerSessions, ({ one }) => ({
  player: one(players, {
    fields: [playerSessions.playerId],
    references: [players.id],
  }),
}));

// ============================================
// ADMIN_USERS TABLE
// ============================================
export const adminUsers = pgTable(
  "admin_users",
  {
    id: serial("id").primaryKey(),
    clerkId: varchar("clerk_id", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    status: adminStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    approvedAt: timestamp("approved_at"),
    approvedBy: varchar("approved_by", { length: 255 }),
  },
  (table) => [uniqueIndex("admin_users_clerk_id_idx").on(table.clerkId)]
);

// ============================================
// SUPPORT_MESSAGES TABLE
// ============================================
export const supportMessages = pgTable(
  "support_messages",
  {
    id: serial("id").primaryKey(),
    sessionId: integer("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    teamId: integer("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    playerId: integer("player_id").references(() => players.id, {
      onDelete: "set null",
    }),
    adminUserId: integer("admin_user_id").references(() => adminUsers.id, {
      onDelete: "set null",
    }),
    message: text("message").notNull(),
    attachmentUrl: varchar("attachment_url", { length: 500 }),
    attachmentType: varchar("attachment_type", { length: 20 }), // 'image' | 'video'
    isFromAdmin: boolean("is_from_admin").notNull().default(false),
    isRead: boolean("is_read").notNull().default(false),
    gameContext: jsonb("game_context"), // {teamName, currentStage, totalStages, locationName}
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("support_messages_session_idx").on(table.sessionId),
    index("support_messages_team_idx").on(table.teamId),
  ]
);

export const supportMessagesRelations = relations(supportMessages, ({ one }) => ({
  session: one(sessions, {
    fields: [supportMessages.sessionId],
    references: [sessions.id],
  }),
  team: one(teams, {
    fields: [supportMessages.teamId],
    references: [teams.id],
  }),
  player: one(players, {
    fields: [supportMessages.playerId],
    references: [players.id],
  }),
  adminUser: one(adminUsers, {
    fields: [supportMessages.adminUserId],
    references: [adminUsers.id],
  }),
}));

// ============================================
// TYPE EXPORTS
// ============================================
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Location = typeof locations.$inferSelect;
export type NewLocation = typeof locations.$inferInsert;

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;

export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;

export type TeamPath = typeof teamPaths.$inferSelect;
export type NewTeamPath = typeof teamPaths.$inferInsert;

export type PlayerSession = typeof playerSessions.$inferSelect;
export type NewPlayerSession = typeof playerSessions.$inferInsert;

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;

export type SupportMessage = typeof supportMessages.$inferSelect;
export type NewSupportMessage = typeof supportMessages.$inferInsert;

export interface GameContext {
  teamName: string;
  currentStage: number;
  totalStages: number;
  locationName?: string;
}
