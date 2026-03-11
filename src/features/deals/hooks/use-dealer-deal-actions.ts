"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DealerDealDetail } from "@/entities/deal/schemas/dealer-deal-schema";
import {
  cancelDealerDealFromApi,
  updateDealerDealScheduleFromApi,
  updateDealerDealStatusFromApi,
} from "@/features/deals/lib/dealer-deal-api";
import {
  dealerDealListQueryKey,
  getDealerDealDetailQueryKey,
} from "@/features/deals/lib/dealer-deal-query";
import {
  dealerChatRoomListQueryKey,
  getDealerChatRoomQueryKey,
} from "@/features/chat/lib/dealer-chat-query";

export function useDealerDealActions(detail: DealerDealDetail) {
  const queryClient = useQueryClient();

  async function invalidateRelatedQueries() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: dealerDealListQueryKey }),
      queryClient.invalidateQueries({
        queryKey: getDealerDealDetailQueryKey(detail.id),
      }),
      queryClient.invalidateQueries({ queryKey: dealerChatRoomListQueryKey }),
      detail.chatRoomId.startsWith("pending:")
        ? Promise.resolve()
        : queryClient.invalidateQueries({
            queryKey: getDealerChatRoomQueryKey(detail.chatRoomId),
          }),
    ]);
  }

  const updateStatusMutation = useMutation({
    mutationFn: updateDealerDealStatusFromApi,
    onSuccess: invalidateRelatedQueries,
  });

  const updateScheduleMutation = useMutation({
    mutationFn: updateDealerDealScheduleFromApi,
    onSuccess: invalidateRelatedQueries,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelDealerDealFromApi,
    onSuccess: invalidateRelatedQueries,
  });

  return {
    isPending:
      updateStatusMutation.isPending ||
      updateScheduleMutation.isPending ||
      cancelMutation.isPending,
    errorMessage:
      readMutationError(updateStatusMutation.error) ??
      readMutationError(updateScheduleMutation.error) ??
      readMutationError(cancelMutation.error),
    async updateStatus(input: {
      targetStatusCode: string;
      reason?: string;
    }) {
      return updateStatusMutation.mutateAsync({
        dealId: detail.id,
        targetStatusCode: input.targetStatusCode,
        reason: input.reason,
      });
    },
    async updateDateAndStatus(input: {
      kind: "assignment" | "release";
      date: string;
      targetStatusCode: string;
    }) {
      await updateScheduleMutation.mutateAsync({
        dealId: detail.id,
        kind: input.kind,
        date: input.date,
      });

      return updateStatusMutation.mutateAsync({
        dealId: detail.id,
        targetStatusCode: input.targetStatusCode,
        reason: "단계 진행 (예상일 입력됨)",
      });
    },
    async modifyDateOnly(input: {
      kind: "assignment" | "release";
      date: string;
    }) {
      return updateScheduleMutation.mutateAsync({
        dealId: detail.id,
        kind: input.kind,
        date: input.date,
      });
    },
    async cancelDeal(reason: string) {
      return cancelMutation.mutateAsync({
        dealId: detail.id,
        reason,
      });
    },
  };
}

function readMutationError(error: unknown) {
  return error instanceof Error ? error.message : null;
}
