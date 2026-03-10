"use client";

import { useQuery } from "@tanstack/react-query";
import {
  dealerDealListQueryKey,
  fetchDealerDealList,
} from "@/features/deals/lib/dealer-deal-query";

export function useDealerDealListQuery() {
  return useQuery({
    queryKey: dealerDealListQueryKey,
    queryFn: fetchDealerDealList,
  });
}
