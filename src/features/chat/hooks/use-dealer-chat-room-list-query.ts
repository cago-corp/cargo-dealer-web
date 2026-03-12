"use client";

import { useQuery } from "@tanstack/react-query";
import {
  dealerChatRoomListQueryKey,
  fetchDealerChatRoomList,
} from "@/features/chat/lib/dealer-chat-query";

export function useDealerChatRoomListQuery() {
  return useQuery({
    queryKey: dealerChatRoomListQueryKey,
    queryFn: fetchDealerChatRoomList,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
