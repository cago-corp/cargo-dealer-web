import { z } from "zod";
import { dealerQuoteSummarySchema } from "@/entities/quote/schemas/dealer-quote-summary-schema";

export const dealerQuoteListResponseSchema = z.object({
  items: z.array(dealerQuoteSummarySchema),
});

export type DealerQuoteListResponse = z.infer<typeof dealerQuoteListResponseSchema>;
