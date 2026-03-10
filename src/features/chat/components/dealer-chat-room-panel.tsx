"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  DealerChatMessage,
  DealerChatRoom,
  DealerChatRoomListItem,
} from "@/entities/chat/schemas/dealer-chat-schema";
import { useDealerChatRoomQuery } from "@/features/chat/hooks/use-dealer-chat-room-query";
import {
  dealerChatRoomListQueryKey,
  getDealerChatRoomQueryKey,
} from "@/features/chat/lib/dealer-chat-query";
import { sendDealerChatMessage } from "@/shared/api/dealer-marketplace";
import { appRoutes } from "@/shared/config/routes";

type DealerChatRoomPanelProps = {
  mode: "page" | "rail";
  roomId: string | null;
};

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function applyRoomPreview(
  rooms: DealerChatRoomListItem[] | undefined,
  roomId: string,
  body: string,
  createdAt: string,
) {
  if (!rooms) {
    return rooms;
  }

  return [...rooms]
    .map((room) =>
      room.id === roomId
        ? {
            ...room,
            lastMessage: body,
            lastMessageAt: createdAt,
            unreadCount: 0,
          }
        : room,
    )
    .sort((left, right) => Date.parse(right.lastMessageAt) - Date.parse(left.lastMessageAt));
}

export function DealerChatRoomPanel({
  mode,
  roomId,
}: DealerChatRoomPanelProps) {
  const queryClient = useQueryClient();
  const roomQuery = useDealerChatRoomQuery(roomId);
  const [messageInput, setMessageInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMessageInput("");
    setErrorMessage(null);
  }, [roomId]);

  const sendMessageMutation = useMutation({
    mutationFn: async (body: string) => {
      if (!roomId) {
        throw new Error("채팅방을 먼저 선택해 주세요.");
      }

      return sendDealerChatMessage({ roomId, body });
    },
    onMutate: async (body: string) => {
      if (!roomId) {
        return {};
      }

      const trimmedBody = body.trim();

      if (!trimmedBody) {
        return {};
      }

      await queryClient.cancelQueries({ queryKey: getDealerChatRoomQueryKey(roomId) });
      await queryClient.cancelQueries({ queryKey: dealerChatRoomListQueryKey });

      const createdAt = new Date().toISOString();
      const optimisticMessage: DealerChatMessage = {
        id: `optimistic-${createdAt}`,
        roomId,
        senderRole: "dealer",
        body: trimmedBody,
        createdAt,
      };

      const previousRoom = queryClient.getQueryData<DealerChatRoom>(
        getDealerChatRoomQueryKey(roomId),
      );
      const previousRooms = queryClient.getQueryData<DealerChatRoomListItem[]>(
        dealerChatRoomListQueryKey,
      );

      queryClient.setQueryData<DealerChatRoom>(
        getDealerChatRoomQueryKey(roomId),
        (current) =>
          current
            ? {
                ...current,
                lastMessage: trimmedBody,
                lastMessageAt: createdAt,
                unreadCount: 0,
                messages: [...current.messages, optimisticMessage],
              }
            : current,
      );

      queryClient.setQueryData<DealerChatRoomListItem[]>(
        dealerChatRoomListQueryKey,
        (current) => applyRoomPreview(current, roomId, trimmedBody, createdAt),
      );

      return {
        previousRoom,
        previousRooms,
      };
    },
    onError: (_error, _body, context) => {
      if (!roomId) {
        return;
      }

      if (context?.previousRoom) {
        queryClient.setQueryData(getDealerChatRoomQueryKey(roomId), context.previousRoom);
      }

      if (context?.previousRooms) {
        queryClient.setQueryData(dealerChatRoomListQueryKey, context.previousRooms);
      }

      setErrorMessage("메시지를 전송하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    },
    onSuccess: () => {
      setMessageInput("");
      setErrorMessage(null);
    },
    onSettled: () => {
      if (roomId) {
        queryClient.invalidateQueries({ queryKey: getDealerChatRoomQueryKey(roomId) });
      }

      queryClient.invalidateQueries({ queryKey: dealerChatRoomListQueryKey });
    },
  });

  if (!roomId) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center rounded-[28px] border border-dashed border-line bg-slate-50 px-6 py-12 text-center">
        <div>
          <p className="text-lg font-semibold text-slate-900">대화할 고객을 선택해 주세요.</p>
          <p className="mt-2 text-sm text-slate-500">
            거래 진행 중인 고객과의 대화 내용을 바로 확인할 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  if (roomQuery.isLoading) {
    return <div className="h-[420px] animate-pulse rounded-[28px] bg-slate-100" />;
  }

  if (roomQuery.isError || !roomQuery.data) {
    return (
      <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-12 text-center">
        <p className="text-base font-semibold text-rose-700">
          채팅 내용을 불러오지 못했습니다.
        </p>
      </div>
    );
  }

  const room = roomQuery.data;
  const isRailMode = mode === "rail";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextMessage = messageInput.trim();

    if (!nextMessage || sendMessageMutation.isPending || room.isClosed) {
      return;
    }

    sendMessageMutation.mutate(nextMessage);
  }

  return (
    <section className="flex h-full flex-col rounded-[28px] border border-line bg-white">
      <header className="border-b border-line px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-slate-950">
              {room.customerName}
            </p>
            <p className="mt-1 truncate text-sm text-slate-500">{room.vehicleLabel}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {room.stageLabel}
            </span>
            <Link
              className="rounded-full border border-line px-3 py-1 text-xs font-medium text-slate-700"
              href={appRoutes.dealDetail(room.dealId)}
            >
              거래 상세
            </Link>
            {isRailMode ? (
              <Link
                className="rounded-full border border-line px-3 py-1 text-xs font-medium text-slate-700"
                href={appRoutes.chat(room.id)}
              >
                크게 보기
              </Link>
            ) : null}
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-600">{room.stageDescription}</p>
      </header>

      <div
        className={
          isRailMode
            ? "flex-1 space-y-3 overflow-y-auto px-5 py-5"
            : "flex-1 space-y-3 overflow-y-auto px-6 py-6"
        }
      >
        {room.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      <footer className="border-t border-line px-5 py-4">
        {errorMessage ? (
          <p className="mb-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </p>
        ) : null}
        {room.isClosed ? (
          <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
            출고 완료된 거래는 더 이상 채팅을 보낼 수 없습니다.
          </p>
        ) : (
          <form className="space-y-3" onSubmit={handleSubmit}>
            <textarea
              className="min-h-24 w-full rounded-3xl border border-line px-4 py-4 text-sm outline-none transition focus:border-slate-400"
              placeholder="고객에게 보낼 메시지를 입력하세요."
              value={messageInput}
              onChange={(event) => setMessageInput(event.target.value)}
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                최근 메시지 {formatMessageTime(room.lastMessageAt)}
              </p>
              <button
                className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={sendMessageMutation.isPending || messageInput.trim().length === 0}
                type="submit"
              >
                {sendMessageMutation.isPending ? "전송 중..." : "보내기"}
              </button>
            </div>
          </form>
        )}
      </footer>
    </section>
  );
}

type MessageBubbleProps = {
  message: DealerChatMessage;
};

function MessageBubble({ message }: MessageBubbleProps) {
  if (message.senderRole === "system") {
    return (
      <div className="flex justify-center">
        <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-600">
          {message.body}
        </div>
      </div>
    );
  }

  const isDealer = message.senderRole === "dealer";

  return (
    <div className={isDealer ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          isDealer
            ? "max-w-[82%] rounded-[24px] rounded-br-md bg-slate-950 px-4 py-3 text-sm text-white"
            : "max-w-[82%] rounded-[24px] rounded-bl-md bg-slate-100 px-4 py-3 text-sm text-slate-800"
        }
      >
        <p>{message.body}</p>
        <p
          className={
            isDealer ? "mt-2 text-right text-xs text-slate-300" : "mt-2 text-xs text-slate-500"
          }
        >
          {formatMessageTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
