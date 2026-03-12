"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { DealerChatRoomList } from "@/features/chat/components/dealer-chat-room-list";
import { useDealerChatSyncStream } from "@/features/chat/hooks/use-dealer-chat-sync-stream";
import { filterLiveChatRooms } from "@/features/chat/lib/filter-live-chat-rooms";
import { DealerChatRoomPanel } from "@/features/chat/components/dealer-chat-room-panel";
import { useDealerChatRoomListQuery } from "@/features/chat/hooks/use-dealer-chat-room-list-query";
import { useChatRail } from "@/shared/ui/chat-rail-provider";
import { SectionCard } from "@/shared/ui/section-card";

type DealerChatWorkspaceProps = {
  variant?: "default" | "window";
};

export function DealerChatWorkspace({
  variant = "default",
}: DealerChatWorkspaceProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const roomListQuery = useDealerChatRoomListQuery();
  const {
    clearSelectedRoom,
    isPoppedOutModule,
    markPoppedOutModule,
    releasePoppedOutModule,
    selectedRoomId,
    selectRoom,
  } = useChatRail();
  const roomIdFromQuery = searchParams.get("roomId");
  const rooms = filterLiveChatRooms(roomListQuery.data);
  const isWindowVariant = variant === "window";
  const [isXlUp, setIsXlUp] = useState(false);
  const isSplitWindowLayout = !isWindowVariant || isXlUp;
  const detailPanelClassName = isWindowVariant
    ? "min-h-0 h-full"
    : "min-h-[680px] xl:h-[calc(100vh-18rem)]";

  useEffect(() => {
    if (!isWindowVariant) {
      return;
    }

    const mediaQuery = window.matchMedia("(min-width: 1280px)");
    const update = () => setIsXlUp(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => {
      mediaQuery.removeEventListener("change", update);
    };
  }, [isWindowVariant]);

  const handleSelectRoom = useCallback((nextRoomId: string) => {
    selectRoom(nextRoomId);

    if (!isWindowVariant) {
      return;
    }

    const nextSearchParams = new URLSearchParams(window.location.search);
    nextSearchParams.set("roomId", nextRoomId);
    window.history.replaceState(
      window.history.state,
      "",
      `${pathname}?${nextSearchParams.toString()}`,
    );
  }, [isWindowVariant, pathname, selectRoom]);

  const handleWindowBack = useCallback(() => {
    clearSelectedRoom();

    if (!isWindowVariant) {
      return;
    }

    const nextSearchParams = new URLSearchParams(window.location.search);
    nextSearchParams.delete("roomId");
    const nextQuery = nextSearchParams.toString();

    window.history.replaceState(
      window.history.state,
      "",
      nextQuery ? `${pathname}?${nextQuery}` : pathname,
    );
  }, [clearSelectedRoom, isWindowVariant, pathname]);

  useDealerChatSyncStream(selectedRoomId);

  useEffect(() => {
    if (!roomIdFromQuery || rooms.length === 0) {
      return;
    }

    const hasRequestedRoom = rooms.some((room) => room.id === roomIdFromQuery);

    if (!hasRequestedRoom) {
      if (!selectedRoomId && isSplitWindowLayout) {
        handleSelectRoom(rooms[0].id);
      }
      return;
    }

    if (roomIdFromQuery !== selectedRoomId) {
      selectRoom(roomIdFromQuery);
    }
  }, [handleSelectRoom, isSplitWindowLayout, roomIdFromQuery, rooms, selectRoom, selectedRoomId]);

  useEffect(() => {
    if (selectedRoomId || rooms.length === 0 || !isSplitWindowLayout) {
      return;
    }

    handleSelectRoom(rooms[0].id);
  }, [handleSelectRoom, isSplitWindowLayout, rooms, selectedRoomId]);

  useEffect(() => {
    if (!selectedRoomId) {
      return;
    }

    const hasSelectedRoom = rooms.some((room) => room.id === selectedRoomId);

    if (!hasSelectedRoom) {
      clearSelectedRoom();
    }
  }, [clearSelectedRoom, rooms, selectedRoomId]);

  useEffect(() => {
    if (!isWindowVariant || !selectedRoomId) {
      return;
    }

    markPoppedOutModule();

    return () => {
      releasePoppedOutModule();
    };
  }, [isWindowVariant, markPoppedOutModule, releasePoppedOutModule, selectedRoomId]);

  useEffect(() => {
    if (!isWindowVariant) {
      return;
    }

    function handleBeforeUnload() {
      releasePoppedOutModule();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isWindowVariant, releasePoppedOutModule]);

  const summary = {
    activeRooms: rooms.length,
    unreadMessages: rooms.reduce(
      (total, room) => total + room.unreadCount,
      0,
    ),
    needsAction: rooms.filter((room) => room.unreadCount > 0).length,
  };

  if (isWindowVariant) {
    const header = (
      <header className="rounded-[24px] border border-white/80 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
              Chat
            </p>
            <h1 className="mt-1 text-xl font-semibold text-slate-950">채팅 전용 창</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <button
              className="rounded-full border border-line px-3 py-1 font-medium text-slate-700 transition hover:bg-slate-50"
              type="button"
              onClick={() => {
                releasePoppedOutModule();
                window.close();
              }}
            >
              도킹으로 돌아가기
            </button>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
              진행 중 {rooms.length}건
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
              읽지 않음 {summary.unreadMessages}건
            </span>
          </div>
        </div>
      </header>
    );

    if (!isXlUp) {
      return (
        <section className="flex h-full min-h-0 flex-col gap-4">
          {header}
          <div className="min-h-0 flex-1">
            {selectedRoomId ? (
              <DealerChatRoomPanel
                allowPopout={false}
                density="compact"
                mode="rail"
                roomId={selectedRoomId}
                onBack={handleWindowBack}
              />
            ) : (
              <SectionCard
                className="flex h-full min-h-0 flex-col"
                contentClassName="min-h-0 flex-1 overflow-y-auto"
                title="대화 목록"
              >
                {roomListQuery.isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div
                        className="h-[106px] animate-pulse rounded-[28px] bg-slate-100"
                        key={`chat-room-window-compact-skeleton-${index}`}
                      />
                    ))}
                  </div>
                ) : roomListQuery.isError ? (
                  <p className="text-sm text-rose-600">
                    채팅 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
                  </p>
                ) : (
                  <DealerChatRoomList
                    rooms={rooms}
                    selectedRoomId={selectedRoomId}
                    onSelectRoom={handleSelectRoom}
                  />
                )}
              </SectionCard>
            )}
          </div>
        </section>
      );
    }

    return (
      <section className="flex h-full min-h-0 flex-col gap-5">
        {header}

        <div className="grid min-h-0 flex-1 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
          <SectionCard
            className="flex min-h-0 flex-col"
            contentClassName="min-h-0 flex-1 overflow-y-auto"
            title="대화 목록"
          >
            {roomListQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    className="h-[106px] animate-pulse rounded-[28px] bg-slate-100"
                    key={`chat-room-window-skeleton-${index}`}
                  />
                ))}
              </div>
            ) : roomListQuery.isError ? (
              <p className="text-sm text-rose-600">
                채팅 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
              </p>
            ) : (
              <DealerChatRoomList
                rooms={rooms}
                selectedRoomId={selectedRoomId}
                onSelectRoom={handleSelectRoom}
              />
            )}
          </SectionCard>

          <div className={detailPanelClassName}>
            <DealerChatRoomPanel
              allowPopout={false}
              density="compact"
              mode="page"
              roomId={selectedRoomId}
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
          Chat
        </p>
        <h1 className="text-3xl font-semibold text-slate-950">채팅</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          진행 중인 상담과 거래 대화를 한 곳에서 확인하고 바로 응답할 수 있습니다.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryTile label="진행 중인 방" value={summary.activeRooms} />
        <SummaryTile label="읽지 않은 메시지" value={summary.unreadMessages} />
        <SummaryTile label="응답 필요" value={summary.needsAction} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <SectionCard
          title="대화 목록"
          description="고객과 진행 중인 대화를 최신 순으로 확인할 수 있습니다."
        >
          {roomListQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  className="h-[106px] animate-pulse rounded-[28px] bg-slate-100"
                  key={`chat-room-skeleton-${index}`}
                />
              ))}
            </div>
          ) : roomListQuery.isError ? (
            <p className="text-sm text-rose-600">
              채팅 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
            </p>
          ) : (
              <DealerChatRoomList
                rooms={rooms}
                selectedRoomId={selectedRoomId}
                onSelectRoom={handleSelectRoom}
              />
          )}
        </SectionCard>

        {isPoppedOutModule ? (
          <SectionCard
            className={detailPanelClassName}
            title="새 창에서 진행 중"
            description="채팅 모듈 전체가 새 창에서 열려 있습니다."
          >
            <div className="rounded-3xl border border-dashed border-violet-200 bg-violet-50 px-5 py-5 text-sm text-violet-700">
              새 창을 닫거나 상단의 `도킹으로 돌아가기`를 누르면 이 자리에서 다시 이어서 볼 수 있습니다.
            </div>
          </SectionCard>
        ) : (
          <div className={detailPanelClassName}>
            <DealerChatRoomPanel mode="page" roomId={selectedRoomId} />
          </div>
        )}
      </div>
    </section>
  );
}

type SummaryTileProps = {
  label: string;
  value: number;
};

function SummaryTile({ label, value }: SummaryTileProps) {
  return (
    <div className="rounded-3xl bg-slate-950 px-5 py-5 text-white">
      <p className="text-sm text-slate-300">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}
