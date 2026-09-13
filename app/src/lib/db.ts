import postgres from "postgres";

// One pooled client. Cached on globalThis so Next's dev HMR doesn't open a new
// pool on every reload.
declare global {
  var __sql: ReturnType<typeof postgres> | undefined;
}

export const sql = globalThis.__sql ?? postgres(process.env.DATABASE_URL!, { max: 5 });

if (process.env.NODE_ENV !== "production") {
  globalThis.__sql = sql;
}
