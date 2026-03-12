"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchDealerBidDetail,
  getDealerBidDetailQueryKey,
} from "@/features/bids/lib/dealer-bid-query";

export function useDealerBidDetailQuery(auctionId: string) {
  return useQuery({
    queryKey: getDealerBidDetailQueryKey(auctionId),
    queryFn: () => fetchDealerBidDetail(auctionId),
  });
}
