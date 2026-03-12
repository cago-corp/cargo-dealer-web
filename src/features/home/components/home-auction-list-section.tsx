"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import type { DealerAuctionBrief } from "@/entities/auction/schemas/dealer-auction-brief-schema";
import type {
  DealerAuctionImportFilter,
  DealerAuctionWorkspaceFilters,
  DealerAuctionWorkspaceMode,
} from "@/features/home/lib/dealer-auction-workspace-query";
import { HomeAuctionCard } from "@/features/home/components/home-auction-card";
import { PaginationControls } from "@/shared/ui/pagination-controls";
import { SectionCard } from "@/shared/ui/section-card";

const filterChipLabels = ["브랜드", "차종", "지역", "주행거리", "구매방식"] as const;
const importTabs: Array<{
  label: string;
  value: DealerAuctionImportFilter;
}> = [
  { label: "전체", value: "all" },
  { label: "국산차", value: "domestic" },
  { label: "수입차", value: "imported" },
] as const;

type HomeAuctionListSectionProps = {
  currentPage: number;
  filters: DealerAuctionWorkspaceFilters;
  itemLabel: string;
  isFavoriteMutationPending: boolean;
  isLoading: boolean;
  items: DealerAuctionBrief[];
  mode: DealerAuctionWorkspaceMode;
  pendingMessage: string | null;
  pageSize: number;
  searchInput: string;
  sortLabel: string;
  totalItems: number;
  totalPages: number;
  visibleCount: number;
  onFavoriteToggle: (auctionId: string) => void;
  onFilterChipClick: (label: string) => void;
  onImportFilterChange: (importFilter: DealerAuctionImportFilter) => void;
  onPageChange: (page: number) => void;
  onSearchInputChange: (nextValue: string) => void;
  onSearchSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function HomeAuctionListSection({
  currentPage,
  filters,
  itemLabel,
  isFavoriteMutationPending,
  isLoading,
  items,
  mode,
  pendingMessage,
  pageSize,
  searchInput,
  sortLabel,
  totalItems,
  totalPages,
  visibleCount,
  onFavoriteToggle,
  onFilterChipClick,
  onImportFilterChange,
  onPageChange,
  onSearchInputChange,
  onSearchSubmit,
}: HomeAuctionListSectionProps) {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  return (
    <SectionCard
      title={mode === "favorites" ? "찜한 차 목록" : "경매 목록"}
      headerAction={
        <button
          className="inline-flex rounded-full border border-line bg-white px-3 py-1.5 text-sm font-medium text-slate-700 sm:hidden"
          type="button"
          onClick={() => setIsMobileFilterOpen((current) => !current)}
        >
          필터
        </button>
      }
      className="p-4 sm:p-6"
    >
      <form
        className="rounded-[24px] bg-slate-50 px-3 py-3 sm:rounded-[28px] sm:px-4 sm:py-4"
        onSubmit={onSearchSubmit}
      >
        {isMobileFilterOpen ? (
          <div className="mb-3 rounded-2xl border border-dashed border-line bg-white px-3 py-3 sm:hidden">
            <div className="flex flex-wrap gap-2">
              {filterChipLabels.map((label) => (
                <span
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"
                  key={label}
                >
                  {label}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              상세 필터는 다음 단계에서 연결 예정입니다.
            </p>
          </div>
        ) : null}

        <div className="flex items-center gap-2 sm:gap-3">
          <label className="flex min-h-12 flex-1 items-center gap-3 rounded-2xl border border-line bg-white px-4">
            <span className="text-lg text-slate-500">⌕</span>
            <input
              className="w-full border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="차량명, 브랜드, 트림 검색"
              type="search"
              value={searchInput}
              onChange={(event) => onSearchInputChange(event.target.value)}
            />
          </label>
          <div className="flex gap-2">
            <button
              className="hidden rounded-2xl border border-line bg-white px-3 py-3 text-sm font-medium text-slate-700 sm:inline-flex sm:px-4"
              type="button"
              onClick={() => setIsMobileFilterOpen((current) => !current)}
            >
              필터
            </button>
            <button
              className="rounded-2xl bg-slate-950 px-3 py-3 text-sm font-semibold text-white sm:px-4"
              type="submit"
            >
              검색
            </button>
          </div>
        </div>

        <div className="-mx-1 mt-3 hidden gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:mt-4 sm:flex sm:flex-wrap sm:px-0 sm:pb-0">
          {filterChipLabels.map((label) => (
            <button
              key={label}
              className="shrink-0 rounded-xl border border-line bg-white px-3 py-2 text-sm text-slate-600"
              type="button"
              onClick={() => onFilterChipClick(label)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-col gap-2.5 sm:mt-4 sm:gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:gap-2 sm:px-0 sm:pb-0">
            {importTabs.map((tab) => (
              <button
                key={tab.value}
                className={
                  filters.importFilter === tab.value
                    ? "shrink-0 px-0 py-1 text-sm font-semibold text-slate-950 underline decoration-2 underline-offset-4 sm:rounded-full sm:bg-slate-950 sm:px-4 sm:py-2 sm:text-sm sm:text-white sm:no-underline"
                    : "shrink-0 px-0 py-1 text-sm font-medium text-slate-500 sm:rounded-full sm:bg-white sm:px-4 sm:py-2"
                }
                type="button"
                onClick={() => onImportFilterChange(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500 lg:justify-start">
            <span>
              현재 <strong className="text-slate-900">{visibleCount}</strong>대
            </span>
            <span>정렬 {sortLabel}</span>
          </div>
        </div>

        {pendingMessage ? (
          <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:mt-4">
            {pendingMessage}
          </p>
        ) : null}
      </form>

      {isLoading ? (
        <div className="mt-4 space-y-2 sm:mt-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              className="h-[96px] animate-pulse rounded-[22px] border border-line bg-slate-100 sm:h-[110px]"
              key={`home-skeleton-${index}`}
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-4 rounded-[24px] border border-dashed border-line bg-slate-50 px-5 py-10 text-center sm:mt-5 sm:rounded-[28px] sm:px-6 sm:py-12">
          <p className="text-lg font-semibold text-slate-900">
            {mode === "favorites" ? "찜한 차량이 없습니다." : "검색 결과가 없습니다."}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {mode === "favorites"
              ? "홈에서 하트를 누른 차량이 여기에 모입니다."
              : "검색어 또는 차종 필터를 다시 확인해 주세요."}
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-2 sm:mt-5">
          {items.map((item) => (
            <HomeAuctionCard
              key={item.id}
              isFavoritePending={isFavoriteMutationPending}
              item={item}
              onFavoriteToggle={onFavoriteToggle}
            />
          ))}

          <PaginationControls
            currentPage={currentPage}
            itemLabel={itemLabel}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}

    </SectionCard>
  );
}
