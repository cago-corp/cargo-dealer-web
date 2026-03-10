"use client";

import { useQuery } from "@tanstack/react-query";
import {
  dealerProfileQueryKey,
  fetchDealerProfile,
} from "@/features/mypage/lib/dealer-mypage-query";

export function useDealerProfileQuery() {
  return useQuery({
    queryKey: dealerProfileQueryKey,
    queryFn: fetchDealerProfile,
  });
}
