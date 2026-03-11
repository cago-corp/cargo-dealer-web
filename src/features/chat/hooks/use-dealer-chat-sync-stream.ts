"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  dealerChatRoomListQueryKey,
  getDealerChatRoomQueryKey,
} from "@/features/chat/lib/dealer-chat-query";

export function useDealerChatSyncStream(selectedRoomId: string | null) {
  const queryClient = useQueryClient();
  const selectedRoomIdRef = useRef<string | null>(selectedRoomId);

  useEffect(() => {
    selectedRoomIdRef.current = selectedRoomId;
  }, [selectedRoomId]);

  useEffect(() => {
    const eventSource = new EventSource("/api/dealer/chat/stream");

    const handleSync = () => {
      queryClient.invalidateQueries({ queryKey: dealerChatRoomListQueryKey });

      if (selectedRoomIdRef.current) {
        queryClient.invalidateQueries({
          queryKey: getDealerChatRoomQueryKey(selectedRoomIdRef.current),
        });
      }
    };

    eventSource.addEventListener("sync", handleSync);

    return () => {
      eventSource.removeEventListener("sync", handleSync);
      eventSource.close();
    };
  }, [queryClient]);
}
