import { z } from "zod";

export const dealerAccessStateSchema = z.enum([
  "active",
  "pending_approval",
  "incomplete_signup",
]);

export const dealerSessionSchema = z.object({
  backend: z.enum(["mock", "supabase", "spring"]),
  dealerId: z.string(),
  email: z.string().email(),
  accessState: dealerAccessStateSchema,
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  expiresAt: z.string().datetime(),
});

export const dealerSessionCookieName = "cargo_dealer_session";
