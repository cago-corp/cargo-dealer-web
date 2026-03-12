import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  AUTH_BACKEND: z.enum(["mock", "supabase", "spring"]).optional(),
  DEALER_DATA_BACKEND: z.enum(["mock", "supabase", "spring"]).optional(),
  AUTH_SESSION_SECRET: z.string().min(16).optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_IMAGE_BASE_URL: z.string().url().optional(),
});

export function getServerEnv() {
  return serverEnvSchema.parse({
    AUTH_BACKEND: process.env.AUTH_BACKEND,
    DEALER_DATA_BACKEND: process.env.DEALER_DATA_BACKEND,
    AUTH_SESSION_SECRET: process.env.AUTH_SESSION_SECRET,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_IMAGE_BASE_URL: process.env.SUPABASE_IMAGE_BASE_URL,
  });
}
