"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchDealerDealDetail,
  getDealerDealDetailQueryKey,
} from "@/features/deals/lib/dealer-deal-query";

export function useDealerDealDetailQuery(dealId: string) {
  return useQuery({
    queryKey: getDealerDealDetailQueryKey(dealId),
    queryFn: () => fetchDealerDealDetail(dealId),
  });
}
