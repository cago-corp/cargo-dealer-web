"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { DealerChatRoomList } from "@/features/chat/components/dealer-chat-room-list";
import { DealerChatRoomPanel } from "@/features/chat/components/dealer-chat-room-panel";
import { useDealerChatRoomListQuery } from "@/features/chat/hooks/use-dealer-chat-room-list-query";
import { useChatRail } from "@/shared/ui/chat-rail-provider";
import { SectionCard } from "@/shared/ui/section-card";

export function DealerChatWorkspace() {
  const searchParams = useSearchParams();
  const roomListQuery = useDealerChatRoomListQuery();
  const { selectedRoomId, selectRoom } = useChatRail();
  const roomIdFromQuery = searchParams.get("roomId");
  const rooms = roomListQuery.data;

  useEffect(() => {
    if (!roomIdFromQuery || !rooms || rooms.length === 0) {
      return;
    }

    const hasRequestedRoom = rooms.some((room) => room.id === roomIdFromQuery);

    if (!hasRequestedRoom) {
      if (!selectedRoomId) {
        selectRoom(rooms[0].id);
      }
      return;
    }

    if (roomIdFromQuery !== selectedRoomId) {
      selectRoom(roomIdFromQuery);
    }
  }, [roomIdFromQuery, rooms, selectRoom, selectedRoomId]);

  useEffect(() => {
    if (selectedRoomId || !rooms || rooms.length === 0) {
      return;
    }

    selectRoom(rooms[0].id);
  }, [rooms, selectRoom, selectedRoomId]);

  const summary = {
    activeRooms: (rooms ?? []).filter((room) => !room.isClosed).length,
    unreadMessages: (rooms ?? []).reduce(
      (total, room) => total + room.unreadCount,
      0,
    ),
    needsAction: (rooms ?? []).filter((room) => room.unreadCount > 0).length,
  };

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
              rooms={rooms ?? []}
              selectedRoomId={selectedRoomId}
              onSelectRoom={selectRoom}
            />
          )}
        </SectionCard>

        <DealerChatRoomPanel mode="page" roomId={selectedRoomId} />
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
