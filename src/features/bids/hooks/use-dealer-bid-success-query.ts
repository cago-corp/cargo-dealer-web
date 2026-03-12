"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchDealerBidSuccess,
  getDealerBidSuccessQueryKey,
} from "@/features/bids/lib/dealer-bid-query";

export function useDealerBidSuccessQuery(submissionId: string) {
  return useQuery({
    queryKey: getDealerBidSuccessQueryKey(submissionId),
    queryFn: () => fetchDealerBidSuccess(submissionId),
  });
}
