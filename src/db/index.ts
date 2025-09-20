import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

let databaseUrl = process.env.DATABASE_URL || "postgresql://localhost:5432/shipany_ai";

// Node.js environment with connection pool configuration
const client = postgres(databaseUrl, {
  prepare: false,
  max: 10, // Maximum connections in pool
  idle_timeout: 30, // Idle connection timeout (seconds)
  connect_timeout: 10, // Connection timeout (seconds)
});

export const db = drizzle(client);
