"use client";

import { useQuery } from "@tanstack/react-query";
import {
  dealerBidListQueryKey,
  fetchDealerBidList,
} from "@/features/bids/lib/dealer-bid-query";

export function useDealerBidListQuery() {
  return useQuery({
    queryKey: dealerBidListQueryKey,
    queryFn: fetchDealerBidList,
  });
}
