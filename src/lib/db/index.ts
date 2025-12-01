import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Create database connection
const sql = neon(process.env.DATABASE_URL!);

// Create drizzle instance with schema
export const db = drizzle(sql, { schema });

// Export schema for convenience
export * from "./schema";
