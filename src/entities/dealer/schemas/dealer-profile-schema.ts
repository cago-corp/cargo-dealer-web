import { z } from "zod";

export const dealerProfileSchema = z.object({
  id: z.string(),
  dealerName: z.string(),
  dealerNickname: z.string().nullable(),
  companyName: z.string(),
  ownerName: z.string(),
  approvalStatus: z.enum(["active", "pending"]),
  branchCount: z.number().int().nonnegative(),
});

export type DealerProfile = z.infer<typeof dealerProfileSchema>;
