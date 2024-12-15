import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { SessionManager } from "../utils/session.util";

dotenv.config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase environment variables");
}

const persistedSession = SessionManager.getSession();

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      // Initialize with persisted session if available
      ...(persistedSession && {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        storage: {
          getItem: () => JSON.stringify(persistedSession),
          setItem: (key, value) =>
            SessionManager.saveSession(JSON.parse(value)),
          removeItem: () => SessionManager.clearSession(),
        },
      }),
    },
  }
);
