"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDealerAuctionDetail } from "@/shared/api/dealer-marketplace";

export const dealerAuctionDetailQueryRoot = ["dealer-auction-detail"] as const;

export function getDealerAuctionDetailQueryKey(auctionId: string) {
  return [...dealerAuctionDetailQueryRoot, auctionId] as const;
}

export function useDealerAuctionDetailQuery(auctionId: string) {
  return useQuery({
    queryKey: getDealerAuctionDetailQueryKey(auctionId),
    queryFn: () => fetchDealerAuctionDetail(auctionId),
  });
}
