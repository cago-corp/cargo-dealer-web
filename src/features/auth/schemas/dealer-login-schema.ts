import { z } from "zod";

export const dealerLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type DealerLoginInput = z.infer<typeof dealerLoginSchema>;
