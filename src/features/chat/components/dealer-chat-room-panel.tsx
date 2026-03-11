"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
import {
  markDealerChatRoomReadFromApi,
  sendDealerChatMessageFromApi,
} from "@/features/chat/lib/dealer-chat-api";
import { appRoutes } from "@/shared/config/routes";
import { CachedImage } from "@/shared/ui/cached-image";

type DealerChatRoomPanelProps = {
  mode: "page" | "rail";
  roomId: string | null;
  onBack?: () => void;
};

const DEAL_STAGE_STEPPER = ["견적비교", "계약", "배정", "입금", "출고"] as const;

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

function getDealStageIndex(stageLabel: string) {
  const normalized = stageLabel.replaceAll(/\s+/g, "");

  if (normalized.includes("견적")) {
    return 0;
  }

  if (normalized.includes("계약") || normalized.includes("서류확인")) {
    return 1;
  }

  if (normalized.includes("배정")) {
    return 2;
  }

  if (normalized.includes("입금") || normalized.includes("결제")) {
    return 3;
  }

  if (normalized.includes("출고")) {
    return 4;
  }

  return 1;
}

export function DealerChatRoomPanel({
  mode,
  roomId,
  onBack,
}: DealerChatRoomPanelProps) {
  const queryClient = useQueryClient();
  const roomQuery = useDealerChatRoomQuery(roomId);
  const [messageInput, setMessageInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isStatusExpanded, setIsStatusExpanded] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessageInput("");
    setErrorMessage(null);
    setIsStatusExpanded(false);
  }, [roomId]);

  const sendMessageMutation = useMutation({
    mutationFn: async (body: string) => {
      if (!roomId) {
        throw new Error("채팅방을 먼저 선택해 주세요.");
      }

      return sendDealerChatMessageFromApi({ roomId, body });
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
        editedAt: null,
        kind: "text",
        attachment: null,
        customPayload: null,
        metadata: null,
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

  const isRailMode = mode === "rail";
  const lastMessageId = roomQuery.data?.messages.at(-1)?.id ?? null;

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [lastMessageId, roomId]);

  useEffect(() => {
    if (!roomId || !lastMessageId) {
      return;
    }

    void markDealerChatRoomReadFromApi({
      roomId,
      lastMessageId,
    })
      .then(() => {
        queryClient.setQueryData<DealerChatRoomListItem[]>(
          dealerChatRoomListQueryKey,
          (current) =>
            current?.map((item) =>
              item.id === roomId ? { ...item, unreadCount: 0 } : item,
            ) ?? current,
        );
      })
      .catch(() => null);
  }, [lastMessageId, queryClient, roomId]);

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
    return (
      <section className="rounded-[28px] border border-line bg-white">
        {isRailMode && onBack ? (
          <header className="border-b border-line px-5 py-4">
            <button
              className="rounded-full border border-line px-3 py-1.5 text-sm font-medium text-slate-700"
              type="button"
              onClick={onBack}
            >
              목록으로
            </button>
          </header>
        ) : null}
        <div className="h-[420px] animate-pulse rounded-[28px] bg-slate-100" />
      </section>
    );
  }

  if (roomQuery.isError || !roomQuery.data) {
    return (
      <section className="rounded-[28px] border border-rose-200 bg-rose-50">
        {isRailMode && onBack ? (
          <header className="border-b border-rose-200 px-5 py-4">
            <button
              className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-sm font-medium text-rose-700"
              type="button"
              onClick={onBack}
            >
              목록으로
            </button>
          </header>
        ) : null}
        <div className="px-6 py-12 text-center">
          <p className="text-base font-semibold text-rose-700">
            채팅 내용을 불러오지 못했습니다.
          </p>
        </div>
      </section>
    );
  }

  const room = roomQuery.data;
  const currentStageIndex = getDealStageIndex(room.stageLabel);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextMessage = messageInput.trim();

    if (!nextMessage || sendMessageMutation.isPending || room.isClosed) {
      return;
    }

    sendMessageMutation.mutate(nextMessage);
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-line bg-white">
      <header className="border-b border-line px-5 py-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            {isRailMode && onBack ? (
              <button
                className="rounded-full border border-line px-3 py-1.5 text-sm font-medium text-slate-700"
                type="button"
                onClick={onBack}
              >
                목록으로
              </button>
            ) : null}
          </div>
          <Link
            className="rounded-full border border-line px-3 py-1.5 text-sm font-medium text-slate-700"
            href={appRoutes.chatWindow(room.id)}
            rel="noreferrer"
            target="_blank"
          >
            새 창으로 보기
          </Link>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold text-slate-950">{room.customerName}</p>
            <p className="mt-1 truncate text-sm text-slate-500">{room.vehicleLabel}</p>
          </div>
          <Link
            className="rounded-full border border-line px-3 py-1 text-xs font-medium text-slate-700"
            href={appRoutes.dealDetail(room.dealId)}
            >
            거래 상세
          </Link>
        </div>
        <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50">
          <button
            className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
            type="button"
            onClick={() => setIsStatusExpanded((current) => !current)}
          >
            <div className="min-w-0">
              <p className="text-sm text-slate-700">
                현재 <span className="font-semibold text-violet-700">{room.stageLabel}</span> 단계입니다.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={
                  room.isClosed
                    ? "rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700"
                    : "rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"
                }
              >
                {room.isClosed ? "채팅 종료" : "진행 중"}
              </span>
              <span className="text-slate-500">{isStatusExpanded ? "⌃" : "⌄"}</span>
            </div>
          </button>
          {isStatusExpanded ? (
            <div className="border-t border-slate-200 px-4 py-4">
              <div className="mb-4 flex items-start">
                {DEAL_STAGE_STEPPER.map((stage, index) => {
                  const isActive = index === currentStageIndex;
                  const isPassed = index <= currentStageIndex;
                  const isLast = index === DEAL_STAGE_STEPPER.length - 1;
                  const isFirst = index === 0;

                  return (
                    <div className="min-w-0 flex-1" key={stage}>
                      <div className="flex min-w-0 flex-col items-center">
                        <div className="relative flex h-5 w-full items-center justify-center">
                          <div
                            className={
                              isFirst
                                ? "absolute left-1/2 right-0 top-1/2 h-px -translate-y-1/2 bg-slate-200"
                                : isLast
                                  ? "absolute left-0 right-1/2 top-1/2 h-px -translate-y-1/2 bg-slate-200"
                                  : "absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-slate-200"
                            }
                          />
                          {isFirst ? null : (
                            <div
                              className={
                                isPassed
                                  ? "absolute left-0 right-1/2 top-1/2 h-px -translate-y-1/2 bg-violet-600"
                                  : "hidden"
                              }
                            />
                          )}
                          {isLast ? null : (
                            <div
                              className={
                                index < currentStageIndex
                                  ? "absolute left-1/2 right-0 top-1/2 h-px -translate-y-1/2 bg-violet-600"
                                  : "hidden"
                              }
                            />
                          )}
                          <div
                            className={
                              isActive
                                ? "relative z-10 h-3 w-3 rounded-full border-2 border-violet-600 bg-white"
                                : isPassed
                                  ? "relative z-10 h-2.5 w-2.5 rounded-full bg-violet-600"
                                  : "relative z-10 h-2.5 w-2.5 rounded-full bg-slate-200"
                            }
                          />
                        </div>
                        <p
                          className={
                            isActive
                              ? "mt-2 text-center text-[11px] font-semibold text-violet-700"
                              : isPassed
                                ? "mt-2 text-center text-[11px] font-semibold text-violet-600"
                                : "mt-2 text-center text-[11px] font-medium text-slate-400"
                          }
                        >
                          {isActive ? room.stageLabel : stage}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-slate-600">{room.stageDescription}</p>
            </div>
          ) : null}
        </div>
      </header>

      <div
        ref={messagesContainerRef}
        className={
          isRailMode
            ? "min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-5"
            : "min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-6"
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
        {message.kind === "custom" && message.customPayload ? (
          <div className={isDealer ? "space-y-2" : "space-y-2"}>
            <p className={isDealer ? "text-xs text-slate-300" : "text-xs text-slate-500"}>
              {message.customPayload.type}
            </p>
            <p className="font-semibold">
              {message.customPayload.title ?? message.body}
            </p>
            {message.customPayload.description ? (
              <p>{message.customPayload.description}</p>
            ) : null}
          </div>
        ) : null}

        {(message.kind === "text" || message.kind === "system") && message.body ? (
          <p>{message.body}</p>
        ) : null}

        {message.attachment ? (
          <AttachmentPreview attachment={message.attachment} isDealer={isDealer} />
        ) : null}

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

type AttachmentPreviewProps = {
  attachment: NonNullable<DealerChatMessage["attachment"]>;
  isDealer: boolean;
};

function AttachmentPreview({ attachment, isDealer }: AttachmentPreviewProps) {
  if (attachment.kind === "image") {
    return (
      <a
        className="mt-2 block overflow-hidden rounded-2xl"
        href={attachment.url}
        rel="noreferrer"
        target="_blank"
      >
        <div className="relative h-64 w-full">
          <CachedImage
            alt={attachment.fileName ?? "첨부 이미지"}
            className="object-cover"
            sizes="(min-width: 1024px) 420px, 80vw"
            src={attachment.url}
          />
        </div>
      </a>
    );
  }

  if (attachment.kind === "video") {
    return (
      <div className="mt-2 overflow-hidden rounded-2xl bg-black">
        <video className="max-h-72 w-full" controls preload="metadata" src={attachment.url} />
      </div>
    );
  }

  return (
    <a
      className={
        isDealer
          ? "mt-2 flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-3"
          : "mt-2 flex items-center gap-3 rounded-2xl bg-white px-3 py-3"
      }
      href={attachment.url}
      rel="noreferrer"
      target="_blank"
    >
      <span className="text-lg">↗</span>
      <span className="min-w-0">
        <span className="block truncate font-medium">
          {attachment.fileName ?? "첨부 파일"}
        </span>
        <span className={isDealer ? "text-xs text-slate-300" : "text-xs text-slate-500"}>
          새 창으로 열기
        </span>
      </span>
    </a>
  );
}
