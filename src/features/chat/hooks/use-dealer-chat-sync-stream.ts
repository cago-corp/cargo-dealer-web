"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  dealerChatRoomListQueryKey,
  getDealerChatRoomQueryKey,
} from "@/features/chat/lib/dealer-chat-query";

export function useDealerChatSyncStream(selectedRoomId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const eventSource = new EventSource("/api/dealer/chat/stream");

    const handleSync = () => {
      queryClient.invalidateQueries({ queryKey: dealerChatRoomListQueryKey });

      if (selectedRoomId) {
        queryClient.invalidateQueries({
          queryKey: getDealerChatRoomQueryKey(selectedRoomId),
        });
      }
    };

    eventSource.addEventListener("sync", handleSync);

    return () => {
      eventSource.removeEventListener("sync", handleSync);
      eventSource.close();
    };
  }, [queryClient, selectedRoomId]);
}
