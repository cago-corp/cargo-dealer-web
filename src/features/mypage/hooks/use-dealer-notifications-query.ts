"use client";

import { useQuery } from "@tanstack/react-query";
import {
  dealerNotificationsQueryKey,
  fetchDealerNotifications,
} from "@/features/mypage/lib/dealer-mypage-query";

export function useDealerNotificationsQuery() {
  return useQuery({
    queryKey: dealerNotificationsQueryKey,
    queryFn: fetchDealerNotifications,
  });
}
