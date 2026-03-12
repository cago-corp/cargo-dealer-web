"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  DealerChatMessage,
  DealerChatRoom,
  DealerChatRoomListItem,
} from "@/entities/chat/schemas/dealer-chat-schema";
import { DealerChatCustomMessageCard } from "@/features/chat/components/dealer-chat-custom-message-card";
import { useDealerChatRoomQuery } from "@/features/chat/hooks/use-dealer-chat-room-query";
import {
  dealerChatRoomListQueryKey,
  getDealerChatRoomQueryKey,
} from "@/features/chat/lib/dealer-chat-query";
import {
  markDealerChatRoomReadFromApi,
  sendDealerChatAttachmentFromApi,
  sendDealerChatMessageFromApi,
} from "@/features/chat/lib/dealer-chat-api";
import { appRoutes } from "@/shared/config/routes";
import { useChatRail } from "@/shared/ui/chat-rail-provider";

type DealerChatRoomPanelProps = {
  mode: "page" | "rail";
  roomId: string | null;
  onBack?: () => void;
  allowPopout?: boolean;
  density?: "default" | "compact";
};

type PendingAttachment = {
  file: File;
  label: "사진" | "영상" | "파일";
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

function getAttachmentLabel(file: File): PendingAttachment["label"] {
  if (file.type.startsWith("image/")) {
    return "사진";
  }

  if (file.type.startsWith("video/")) {
    return "영상";
  }

  return "파일";
}

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)}MB`;
  }

  if (size >= 1024) {
    return `${(size / 1024).toFixed(1)}KB`;
  }

  return `${size}B`;
}

export function DealerChatRoomPanel({
  mode,
  roomId,
  onBack,
  allowPopout = true,
  density = "default",
}: DealerChatRoomPanelProps) {
  const queryClient = useQueryClient();
  const { markPoppedOutModule } = useChatRail();
  const roomQuery = useDealerChatRoomQuery(roomId);
  const [messageInput, setMessageInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isStatusExpanded, setIsStatusExpanded] = useState(false);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<PendingAttachment | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesContentRef = useRef<HTMLDivElement | null>(null);
  const shouldStickToBottomRef = useRef(true);
  const attachmentMenuRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMessageInput("");
    setErrorMessage(null);
    setIsStatusExpanded(false);
    setIsAttachmentMenuOpen(false);
    setPendingAttachment(null);
    shouldStickToBottomRef.current = true;
  }, [roomId]);

  useEffect(() => {
    if (!isAttachmentMenuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (attachmentMenuRef.current?.contains(target)) {
        return;
      }

      setIsAttachmentMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isAttachmentMenuOpen]);

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

  const sendAttachmentMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!roomId) {
        throw new Error("채팅방을 먼저 선택해 주세요.");
      }

      return sendDealerChatAttachmentFromApi({ roomId, file });
    },
    onMutate: () => {
      setErrorMessage(null);
      setPendingAttachment(null);
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "첨부 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      );
    },
    onSettled: () => {
      if (roomId) {
        queryClient.invalidateQueries({ queryKey: getDealerChatRoomQueryKey(roomId) });
      }

      queryClient.invalidateQueries({ queryKey: dealerChatRoomListQueryKey });
    },
  });

  const isRailMode = mode === "rail";
  const isCompactDensity = density === "compact";
  const lastMessageId = roomQuery.data?.messages.at(-1)?.id ?? null;

  const scrollMessagesToBottom = useCallback(() => {
    const container = messagesContainerRef.current;

    if (!container) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, []);

  useEffect(() => {
    const element = messagesContainerRef.current;

    if (!element) {
      return;
    }

    const scrollElement: HTMLDivElement = element;

    function handleScroll() {
      const distanceFromBottom =
        scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight;

      shouldStickToBottomRef.current = distanceFromBottom < 64;
    }

    handleScroll();
    scrollElement.addEventListener("scroll", handleScroll);

    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    scrollMessagesToBottom();
  }, [lastMessageId, roomId, scrollMessagesToBottom]);

  useEffect(() => {
    const content = messagesContentRef.current;

    if (!content) {
      return;
    }

    const observer = new ResizeObserver(() => {
      if (!shouldStickToBottomRef.current) {
        return;
      }

      requestAnimationFrame(() => {
        scrollMessagesToBottom();
      });
    });

    observer.observe(content);

    return () => {
      observer.disconnect();
    };
  }, [scrollMessagesToBottom]);

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
              className="inline-flex items-center gap-1 text-sm font-medium text-slate-700"
              type="button"
              onClick={onBack}
            >
              <span aria-hidden="true">&lt;</span>
              목록으로
            </button>
          </header>
        ) : null}
        <div className="flex h-[420px] flex-col items-center justify-center gap-4 rounded-[28px] bg-slate-50 px-6 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
            <svg
              aria-hidden="true"
              className="h-5 w-5 animate-spin text-violet-700"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-20"
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="2.5"
              />
              <path
                d="M21 12a9 9 0 0 0-9-9"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2.5"
              />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-slate-900">
              채팅 내용을 불러오는 중입니다.
            </p>
            <p className="text-sm text-slate-500">
              선택한 대화방의 최근 메시지와 첨부 파일을 준비하고 있습니다.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (roomQuery.isError || !roomQuery.data) {
    return (
      <section className="rounded-[28px] border border-rose-200 bg-rose-50">
        {isRailMode && onBack ? (
          <header className="border-b border-rose-200 px-5 py-4">
            <button
              className="inline-flex items-center gap-1 text-sm font-medium text-rose-700"
              type="button"
              onClick={onBack}
            >
              <span aria-hidden="true">&lt;</span>
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
  const contractEntrySource = allowPopout ? "deal" : "chat-window";

  function openChatPopout(nextRoomId: string) {
    markPoppedOutModule();

    window.open(
      appRoutes.chatWindow(nextRoomId),
      "_blank",
      "popup=yes,width=1280,height=900,resizable=yes,scrollbars=yes",
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextMessage = messageInput.trim();

    if (!nextMessage || sendMessageMutation.isPending || room.isClosed) {
      return;
    }

    sendMessageMutation.mutate(nextMessage);
  }

  function handleAttachmentSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];
    event.target.value = "";

    if (!nextFile || sendAttachmentMutation.isPending || room.isClosed) {
      return;
    }

    setPendingAttachment({
      file: nextFile,
      label: getAttachmentLabel(nextFile),
    });
    setIsAttachmentMenuOpen(false);
  }

  function handleConfirmAttachment() {
    if (!pendingAttachment) {
      return;
    }

    sendAttachmentMutation.mutate(pendingAttachment.file);
  }

  return (
    <section className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-line bg-white">
      <header
        className={
          isCompactDensity
            ? "border-b border-line px-4 py-3"
            : "border-b border-line px-5 py-4"
        }
      >
        <div
          className={
            isCompactDensity
              ? "mb-2 flex items-center justify-between gap-3"
              : "mb-4 flex items-center justify-between gap-3"
          }
        >
          <div>
            {isRailMode && onBack ? (
              <button
                className="inline-flex items-center gap-1 text-sm font-medium text-slate-700"
                type="button"
                onClick={onBack}
              >
                <span aria-hidden="true">&lt;</span>
                목록으로
              </button>
            ) : null}
          </div>
          {allowPopout ? (
            <button
              aria-label="새 창으로 보기"
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              title="새 창으로 보기"
              type="button"
              onClick={() => openChatPopout(room.id)}
            >
              <span>새 창</span>
              <PopoutIcon />
            </button>
          ) : null}
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p
              className={
                isCompactDensity
                  ? "truncate text-base font-semibold text-slate-950"
                  : "truncate text-lg font-semibold text-slate-950"
              }
            >
              {room.customerName}
            </p>
            <p className="mt-1 truncate text-sm text-slate-500">{room.vehicleLabel}</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {!room.isClosed ? (
              <Link
                className="rounded-full bg-violet-700 px-3 py-1.5 text-xs font-semibold text-white shadow-[0_10px_20px_rgba(90,42,235,0.16)]"
                href={appRoutes.dealContract(room.dealId, {
                  roomId: room.id,
                  source: contractEntrySource,
                })}
              >
                최종 계약
              </Link>
            ) : null}
            <Link
              className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-slate-700"
              href={appRoutes.dealDetail(room.dealId)}
            >
              거래 상세
            </Link>
          </div>
        </div>
        <div
          className={
            isCompactDensity
              ? "mt-3 rounded-3xl border border-slate-200 bg-slate-50"
              : "mt-4 rounded-3xl border border-slate-200 bg-slate-50"
          }
        >
          <button
            className={
              isCompactDensity
                ? "flex w-full items-center justify-between gap-3 px-3 py-3 text-left"
                : "flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
            }
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
            <div
              className={
                isCompactDensity
                  ? "border-t border-slate-200 px-3 py-3"
                  : "border-t border-slate-200 px-4 py-4"
              }
            >
              <div className={isCompactDensity ? "mb-3 flex items-start" : "mb-4 flex items-start"}>
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
                              ? isCompactDensity
                                ? "mt-1.5 text-center text-[10px] font-semibold text-violet-700"
                                : "mt-2 text-center text-[11px] font-semibold text-violet-700"
                              : isPassed
                                ? isCompactDensity
                                  ? "mt-1.5 text-center text-[10px] font-semibold text-violet-600"
                                  : "mt-2 text-center text-[11px] font-semibold text-violet-600"
                                : isCompactDensity
                                  ? "mt-1.5 text-center text-[10px] font-medium text-slate-400"
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
            ? "min-h-0 flex-1 overflow-y-auto px-5 py-5"
            : "min-h-0 flex-1 overflow-y-auto px-6 py-6"
        }
      >
        <div className="space-y-3" ref={messagesContentRef}>
          {room.messages.map((message) => (
            <MessageBubble
              contractHref={appRoutes.dealContract(room.dealId, {
                roomId: room.id,
                source: contractEntrySource,
              })}
              detailHref={appRoutes.dealDetail(room.dealId)}
              key={message.id}
              message={message}
              room={room}
            />
          ))}
        </div>
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
              className={
                isCompactDensity
                  ? "min-h-16 w-full rounded-3xl border border-line px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                  : "min-h-20 w-full rounded-3xl border border-line px-4 py-3 text-sm outline-none transition focus:border-slate-400"
              }
              placeholder="고객에게 보낼 메시지를 입력하세요."
              value={messageInput}
              onChange={(event) => setMessageInput(event.target.value)}
            />
            <input
              accept="image/*"
              className="hidden"
              ref={imageInputRef}
              type="file"
              onChange={handleAttachmentSelection}
            />
            <input
              accept="video/*"
              className="hidden"
              ref={videoInputRef}
              type="file"
              onChange={handleAttachmentSelection}
            />
            <input
              className="hidden"
              ref={fileInputRef}
              type="file"
              onChange={handleAttachmentSelection}
            />
            <div className="flex items-center justify-between gap-3">
              <div className="relative" ref={attachmentMenuRef}>
                <button
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-line text-lg font-medium text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
                  disabled={sendAttachmentMutation.isPending || pendingAttachment !== null}
                  type="button"
                  onClick={() => setIsAttachmentMenuOpen((current) => !current)}
                >
                  +
                </button>
                {isAttachmentMenuOpen ? (
                  <div className="absolute bottom-14 left-0 z-10 flex min-w-[108px] flex-col rounded-2xl border border-line bg-white p-2 shadow-xl">
                    <button
                      className="rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                    >
                      사진
                    </button>
                    <button
                      className="rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                    >
                      영상
                    </button>
                    <button
                      className="rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      파일
                    </button>
                  </div>
                ) : null}
              </div>
              <button
                className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={
                  sendMessageMutation.isPending ||
                  sendAttachmentMutation.isPending ||
                  messageInput.trim().length === 0
                }
                type="submit"
              >
                {sendMessageMutation.isPending ? "전송 중..." : "보내기"}
              </button>
            </div>
          </form>
        )}
      </footer>
      {pendingAttachment ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/28 px-4">
          <div className="w-full max-w-sm rounded-[28px] bg-white p-5 shadow-2xl">
            <p className="text-lg font-semibold text-slate-950">첨부 전송</p>
            <p className="mt-3 text-sm text-slate-700">
              {pendingAttachment.label}을 정말 보내겠습니까?
            </p>
            <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3">
              <p className="truncate text-sm font-medium text-slate-900">
                {pendingAttachment.file.name}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {pendingAttachment.label} · {formatFileSize(pendingAttachment.file.size)}
              </p>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                className="rounded-full border border-line px-4 py-2 text-sm font-medium text-slate-700"
                type="button"
                onClick={() => setPendingAttachment(null)}
              >
                취소
              </button>
              <button
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white"
                type="button"
                onClick={handleConfirmAttachment}
              >
                보내기
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function PopoutIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M14 5h5v5M19 5l-8 8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M10 7H7.8A2.8 2.8 0 0 0 5 9.8v6.4A2.8 2.8 0 0 0 7.8 19h6.4a2.8 2.8 0 0 0 2.8-2.8V14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

type MessageBubbleProps = {
  contractHref: string;
  detailHref: string;
  message: DealerChatMessage;
  room: Pick<DealerChatRoom, "dealId" | "id" | "vehicleLabel">;
};

function MessageBubble({ message, room, contractHref, detailHref }: MessageBubbleProps) {
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

  if (message.kind === "custom" && message.customPayload) {
    return (
      <div className={isDealer ? "flex justify-end" : "flex justify-start"}>
        <DealerChatCustomMessageCard
          contractHref={contractHref}
          detailHref={detailHref}
          message={message}
          room={room}
        />
      </div>
    );
  }

  return (
    <div className={isDealer ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          isDealer
            ? "max-w-[82%] rounded-[24px] rounded-br-md bg-slate-950 px-4 py-3 text-sm text-white"
            : "max-w-[82%] rounded-[24px] rounded-bl-md bg-slate-100 px-4 py-3 text-sm text-slate-800"
        }
      >
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
        className="mt-2 inline-flex max-w-[70%] overflow-hidden rounded-2xl bg-slate-50"
        href={attachment.url}
        rel="noreferrer"
        target="_blank"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={attachment.fileName ?? "첨부 이미지"}
          className="block max-h-[360px] w-auto max-w-full object-contain"
          src={attachment.url}
        />
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
