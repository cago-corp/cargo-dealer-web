import {
  dealerQuoteListResponseSchema,
  type DealerQuoteListResponse,
} from "@/features/quotes/schemas/dealer-quote-list-response-schema";

const mockQuoteList: DealerQuoteListResponse = {
  items: [
    {
      id: "Q-240318",
      customerName: "김민수",
      vehicleLabel: "BMW 5 Series 520i",
      status: "open",
      receivedAt: "2026-03-10T09:00:00+09:00",
      bidCount: 3,
    },
    {
      id: "Q-240319",
      customerName: "박서연",
      vehicleLabel: "Kia Carnival Hybrid",
      status: "bidding",
      receivedAt: "2026-03-10T10:30:00+09:00",
      bidCount: 5,
    },
    {
      id: "Q-240320",
      customerName: "이준호",
      vehicleLabel: "Mercedes-Benz E 220d",
      status: "won",
      receivedAt: "2026-03-09T18:10:00+09:00",
      bidCount: 4,
    },
  ],
};

export const dealerQuoteListQueryKey = ["dealer-quotes"] as const;

export async function fetchDealerQuoteList() {
  const parsed = dealerQuoteListResponseSchema.parse(mockQuoteList);
  return Promise.resolve(parsed.items);
}
