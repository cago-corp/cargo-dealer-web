"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DealerChatRoomList } from "@/features/chat/components/dealer-chat-room-list";
import { DealerChatRoomPanel } from "@/features/chat/components/dealer-chat-room-panel";
import { useDealerChatRoomListQuery } from "@/features/chat/hooks/use-dealer-chat-room-list-query";
import { useDealerDealListQuery } from "@/features/deals/hooks/use-dealer-deal-list-query";
import { appRoutes } from "@/shared/config/routes";
import { PaginationControls } from "@/shared/ui/pagination-controls";
import { SectionCard } from "@/shared/ui/section-card";

const ARCHIVE_DEAL_PAGE_SIZE = 8;
const ARCHIVE_CHAT_PANEL_CLASS_NAME = "min-h-[720px] xl:h-[calc(100vh-17rem)]";

function formatUpdatedAt(updatedAt: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(updatedAt));
}

export function ArchivePageClient() {
  const dealListQuery = useDealerDealListQuery();
  const chatRoomListQuery = useDealerChatRoomListQuery();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedArchivedRoomId, setSelectedArchivedRoomId] = useState<string | null>(null);

  const completedDeals = (dealListQuery.data ?? []).filter((item) => item.stage === "출고 완료");
  const archivedRooms = (chatRoomListQuery.data ?? []).filter((item) => item.isClosed);
  const archivedRoomIds = useMemo(
    () => new Set(archivedRooms.map((room) => room.id)),
    [archivedRooms],
  );
  const totalPages = Math.max(1, Math.ceil(completedDeals.length / ARCHIVE_DEAL_PAGE_SIZE));
  const pagedCompletedDeals = completedDeals.slice(
    (currentPage - 1) * ARCHIVE_DEAL_PAGE_SIZE,
    currentPage * ARCHIVE_DEAL_PAGE_SIZE,
  );
  useEffect(() => {
    setCurrentPage(1);
  }, [completedDeals.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (archivedRooms.length === 0) {
      setSelectedArchivedRoomId(null);
      return;
    }

    const hasSelectedRoom = archivedRooms.some((room) => room.id === selectedArchivedRoomId);

    if (!hasSelectedRoom) {
      setSelectedArchivedRoomId(archivedRooms[0].id);
    }
  }, [archivedRooms, selectedArchivedRoomId]);

  function focusArchivedChat(roomId: string) {
    setSelectedArchivedRoomId(roomId);
    document.getElementById("mypage-archive-chat")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-700">
          Archive
        </p>
        <h1 className="text-3xl font-semibold text-slate-950">거래 아카이브</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          출고 완료된 거래와 종료된 채팅 기록을 함께 확인할 수 있습니다. 진행이 끝난
          상담 이력은 이 화면에서 모아봅니다.
        </p>
      </header>

      <SectionCard
        title="거래 이력"
        description="출고 완료된 거래의 최종 상태와 고객 정보를 다시 확인할 수 있습니다."
      >
        {dealListQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                className="h-[174px] animate-pulse rounded-[28px] bg-slate-100"
                key={`archive-deal-skeleton-${index}`}
              />
            ))}
          </div>
        ) : dealListQuery.isError ? (
          <p className="text-sm text-rose-600">
            종료된 거래 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        ) : completedDeals.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-line bg-slate-50 px-6 py-12 text-center">
            <p className="text-lg font-semibold text-slate-900">종료된 거래가 없습니다.</p>
            <p className="mt-2 text-sm text-slate-500">
              출고 완료된 거래가 생기면 이 영역에 자동으로 정리됩니다.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pagedCompletedDeals.map((item) => (
              <article
                className="rounded-[24px] border border-line bg-white px-5 py-4 shadow-sm"
                key={item.id}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-500">
                      {item.customerName}
                    </p>
                    <Link
                      className="mt-0.5 block text-lg font-semibold text-slate-950"
                      href={appRoutes.dealDetail(item.id)}
                    >
                      {item.vehicleLabel}
                    </Link>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.statusDescription}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                      출고 완료
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {item.purchaseMethod}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {item.deliveryRegion}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-400">
                    종료 시점 기준 최근 업데이트 {formatUpdatedAt(item.updatedAt)}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {archivedRoomIds.has(item.chatRoomId) ? (
                      <button
                        className="rounded-full border border-line px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        type="button"
                        onClick={() => focusArchivedChat(item.chatRoomId)}
                      >
                        채팅 기록
                      </button>
                    ) : null}
                    <Link
                      className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                      href={appRoutes.dealDetail(item.id)}
                    >
                      거래 상세
                    </Link>
                  </div>
                </div>
              </article>
            ))}

            <PaginationControls
              currentPage={currentPage}
              itemLabel="건"
              pageSize={ARCHIVE_DEAL_PAGE_SIZE}
              totalItems={completedDeals.length}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </SectionCard>

      <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]" id="mypage-archive-chat">
        <SectionCard
          className={`flex min-h-[720px] flex-col ${ARCHIVE_CHAT_PANEL_CLASS_NAME}`}
          contentClassName="min-h-0 flex-1 overflow-y-auto"
          title="종료된 채팅 기록"
          description="출고 완료 이후 종료된 상담 기록을 다시 열람할 수 있습니다."
        >
          {chatRoomListQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  className="h-[106px] animate-pulse rounded-[28px] bg-slate-100"
                  key={`archive-chat-skeleton-${index}`}
                />
              ))}
            </div>
          ) : chatRoomListQuery.isError ? (
            <p className="text-sm text-rose-600">
              종료된 채팅 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
            </p>
          ) : (
            <DealerChatRoomList
              emptyDescription="출고 완료된 거래의 채팅 기록이 생기면 이 영역에서 다시 확인할 수 있습니다."
              emptyTitle="종료된 채팅 기록이 없습니다."
              rooms={archivedRooms}
              selectedRoomId={selectedArchivedRoomId}
              onSelectRoom={setSelectedArchivedRoomId}
            />
          )}
        </SectionCard>

        <div className={ARCHIVE_CHAT_PANEL_CLASS_NAME}>
          <DealerChatRoomPanel
            allowPopout={false}
            mode="page"
            roomId={selectedArchivedRoomId}
          />
        </div>
      </section>
    </section>
  );
}
