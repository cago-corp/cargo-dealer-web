import { z } from "zod";

export const dealerQuoteSummarySchema = z.object({
  id: z.string(),
  customerName: z.string(),
  vehicleLabel: z.string(),
  status: z.enum(["open", "bidding", "won", "closed"]),
  receivedAt: z.string(),
  bidCount: z.number().int().nonnegative(),
});

export type DealerQuoteSummary = z.infer<typeof dealerQuoteSummarySchema>;
