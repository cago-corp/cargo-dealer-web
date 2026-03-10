import type { FormEvent } from "react";
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
  isRefreshing: boolean;
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
  onRefresh: () => void;
  onSearchInputChange: (nextValue: string) => void;
  onSearchSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSortToggle: () => void;
};

export function HomeAuctionListSection({
  currentPage,
  filters,
  itemLabel,
  isFavoriteMutationPending,
  isLoading,
  isRefreshing,
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
  onRefresh,
  onSearchInputChange,
  onSearchSubmit,
  onSortToggle,
}: HomeAuctionListSectionProps) {
  return (
    <SectionCard
      title={mode === "favorites" ? "찜한 차량" : "경매 목록"}
      description="검색, 필터, 정렬 기준으로 차량 현황과 다음 액션을 바로 확인합니다."
    >
      <form className="rounded-[28px] bg-slate-50 px-4 py-4" onSubmit={onSearchSubmit}>
        <div className="flex flex-col gap-3 xl:flex-row">
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
              className="rounded-2xl border border-line bg-white px-4 py-3 text-sm font-medium text-slate-700"
              type="button"
              onClick={() => onFilterChipClick("상세")}
            >
              상세 필터
            </button>
            <button
              className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
              type="submit"
            >
              검색
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {filterChipLabels.map((label) => (
            <button
              key={label}
              className="rounded-xl border border-line bg-white px-3 py-2 text-sm text-slate-600"
              type="button"
              onClick={() => onFilterChipClick(label)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {importTabs.map((tab) => (
              <button
                key={tab.value}
                className={
                  filters.importFilter === tab.value
                    ? "rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                    : "rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-500"
                }
                type="button"
                onClick={() => onImportFilterChange(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>
              현재 <strong className="text-slate-900">{visibleCount}</strong>대
            </span>
            <button
              className="rounded-full border border-line bg-white px-3 py-1.5 text-sm font-medium text-slate-600"
              type="button"
              onClick={onSortToggle}
            >
              {sortLabel}
            </button>
            <button
              className="rounded-full border border-line bg-white px-3 py-1.5 text-sm font-medium text-slate-600"
              type="button"
              onClick={onRefresh}
            >
              {isRefreshing ? "갱신 중" : "새로고침"}
            </button>
          </div>
        </div>

        {pendingMessage ? (
          <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {pendingMessage}
          </p>
        ) : null}
      </form>

      {isLoading ? (
        <div className="mt-5 space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              className="h-[110px] animate-pulse rounded-[22px] border border-line bg-slate-100"
              key={`home-skeleton-${index}`}
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-5 rounded-[28px] border border-dashed border-line bg-slate-50 px-6 py-12 text-center">
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
        <div className="mt-5 space-y-2">
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
