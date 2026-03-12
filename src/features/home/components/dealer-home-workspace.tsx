"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { HomeAuctionListSection } from "@/features/home/components/home-auction-list-section";
import { useDealerAuctionWorkspaceQuery } from "@/features/home/hooks/use-dealer-auction-workspace-query";
import {
  buildDealerAuctionWorkspaceHref,
  parseDealerAuctionWorkspaceFilters,
} from "@/features/home/lib/dealer-home-search-params";
import {
  dealerAuctionWorkspaceQueryRoot,
  getDealerAuctionWorkspaceQueryKey,
  type DealerAuctionWorkspaceData,
  type DealerAuctionWorkspaceFilters,
  type DealerAuctionWorkspaceMode,
} from "@/features/home/lib/dealer-auction-workspace-query";
import { toggleDealerAuctionFavoriteFromApi } from "@/features/home/lib/dealer-home-api";

type DealerHomeWorkspaceProps = {
  mode: DealerAuctionWorkspaceMode;
  initialFilters: DealerAuctionWorkspaceFilters;
};

const HOME_PAGE_SIZE = 10;
const HOME_REFRESH_SECONDS = 10;

const modeCopy = {
  home: {
    title: "경매장 홈",
    description: "실시간 경매 상태를 확인하고 바로 상세와 입찰로 이동합니다.",
    refreshLabel: "10초 자동 새로고침",
  },
  favorites: {
    title: "찜한 차",
    description: "찜한 차량만 빠르게 모아 보고 상태를 확인합니다.",
    refreshLabel: "찜 상태 즉시 반영",
  },
} as const;

function formatUpdatedAt(timestamp: number) {
  if (!timestamp) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(timestamp));
}

function applyFavoriteToggle(
  current: DealerAuctionWorkspaceData | undefined,
  auctionId: string,
  mode: DealerAuctionWorkspaceMode,
) {
  if (!current) {
    return current;
  }

  const target = current.items.find((item) => item.id === auctionId);

  if (!target) {
    return current;
  }

  const nextFavoriteCount =
    current.summary.favoriteAuctions + (target.isFavorited ? -1 : 1);

  const nextItems = current.items
    .map((item) =>
      item.id === auctionId ? { ...item, isFavorited: !item.isFavorited } : item,
    )
    .filter((item) => (mode === "favorites" ? item.isFavorited : true));

  return {
    ...current,
    items: nextItems,
    summary: {
      ...current.summary,
      favoriteAuctions: Math.max(nextFavoriteCount, 0),
      visibleCount: nextItems.length,
    },
  };
}

export function DealerHomeWorkspace({
  mode,
  initialFilters,
}: DealerHomeWorkspaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const searchParamSearch = searchParams.get("search");
  const searchParamImported = searchParams.get("imported");
  const searchParamSort = searchParams.get("sort");

  const filters = parseDealerAuctionWorkspaceFilters({
    search: searchParamSearch ?? (initialFilters.search || undefined),
    imported: searchParamImported ?? initialFilters.importFilter,
    sort: searchParamSort ?? initialFilters.sort,
  });

  const [searchInput, setSearchInput] = useState(initialFilters.search);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [refreshCountdown, setRefreshCountdown] = useState(HOME_REFRESH_SECONDS);
  const currentQueryKey = getDealerAuctionWorkspaceQueryKey(mode, filters);

  const workspaceQuery = useDealerAuctionWorkspaceQuery(mode, filters);
  const { dataUpdatedAt, refetch } = workspaceQuery;
  const favoriteMutation = useMutation({
    mutationFn: toggleDealerAuctionFavoriteFromApi,
    onMutate: async (auctionId: string) => {
      await queryClient.cancelQueries({ queryKey: currentQueryKey });

      const previousData =
        queryClient.getQueryData<DealerAuctionWorkspaceData>(currentQueryKey);

      queryClient.setQueryData<DealerAuctionWorkspaceData>(
        currentQueryKey,
        (current) => applyFavoriteToggle(current, auctionId, mode),
      );

      return { previousData };
    },
    onError: (_error, _auctionId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(currentQueryKey, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: dealerAuctionWorkspaceQueryRoot });
    },
  });

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, filters.importFilter, filters.sort, mode]);

  useEffect(() => {
    if (!pendingMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setPendingMessage(null);
    }, 2400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pendingMessage]);

  useEffect(() => {
    if (mode !== "home") {
      return undefined;
    }

    setRefreshCountdown(HOME_REFRESH_SECONDS);

    const intervalId = window.setInterval(() => {
      setRefreshCountdown((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [dataUpdatedAt, mode, refetch]);

  useEffect(() => {
    if (mode !== "home" || refreshCountdown !== 0) {
      return;
    }

    setRefreshCountdown(HOME_REFRESH_SECONDS);
    void refetch();
  }, [mode, refreshCountdown, refetch]);

  const queryData = workspaceQuery.data;
  const filteredItems = queryData?.items ?? [];
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / HOME_PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedItems = filteredItems.slice(
    (safeCurrentPage - 1) * HOME_PAGE_SIZE,
    safeCurrentPage * HOME_PAGE_SIZE,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const copy = modeCopy[mode];
  const summary = queryData?.summary ?? {
    totalAuctions: 0,
    favoriteAuctions: 0,
    bidCount: 0,
    dealCount: 0,
    visibleCount: 0,
  };
  const stats = [
    { label: "현재 노출", value: `${summary.visibleCount.toLocaleString("ko-KR")}대` },
    { label: "찜한 차", value: `${summary.favoriteAuctions.toLocaleString("ko-KR")}대` },
    { label: "내 입찰", value: `${summary.bidCount.toLocaleString("ko-KR")}건` },
    { label: "내 거래", value: `${summary.dealCount.toLocaleString("ko-KR")}건` },
  ] as const;

  function replaceFilters(nextFilters: DealerAuctionWorkspaceFilters) {
    router.replace(buildDealerAuctionWorkspaceHref(pathname, nextFilters), {
      scroll: false,
    });
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    replaceFilters({
      ...filters,
      search: searchInput.trim(),
    });
  }

  function handleRefreshNow() {
    setRefreshCountdown(HOME_REFRESH_SECONDS);
    refetch();
  }

  return (
    <section className="space-y-3 sm:space-y-4">
      <header className="rounded-[24px] border border-line bg-white/90 px-4 py-3 shadow-sm sm:rounded-[28px] sm:px-5 sm:py-5">
        <div className="flex items-start justify-between gap-3 sm:items-center 2xl:items-start">
          <div>
            <h1 className="text-lg font-semibold text-slate-950 sm:text-2xl">{copy.title}</h1>
            <p className="mt-1.5 hidden text-sm text-slate-600 sm:mt-2 sm:block">{copy.description}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2.5 text-[10px] text-slate-500 sm:gap-4 sm:text-xs">
            {mode === "home" ? (
              <button
                aria-label={copy.refreshLabel}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line bg-slate-950 text-sm text-white transition hover:bg-slate-800"
                type="button"
                onClick={handleRefreshNow}
              >
                ↻
              </button>
            ) : (
              <span className="font-medium text-slate-600">{copy.refreshLabel}</span>
            )}
            <span>갱신 {formatUpdatedAt(dataUpdatedAt)}</span>
            <span>정렬 최신순</span>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2 sm:mt-4">
          {mode === "favorites" ? (
            <div className="col-span-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span>
                찜한 차량 <strong className="text-slate-950">{summary.favoriteAuctions.toLocaleString("ko-KR")}대</strong>
              </span>
              <span className="text-slate-300">|</span>
              <span>
                내 입찰 <strong className="text-slate-950">{summary.bidCount.toLocaleString("ko-KR")}건</strong>
              </span>
              <span className="text-slate-300">|</span>
              <span>
                내 거래 <strong className="text-slate-950">{summary.dealCount.toLocaleString("ko-KR")}건</strong>
              </span>
            </div>
          ) : (
            stats.map((stat) => (
              <div className="text-center" key={stat.label}>
                <p className="text-[10px] font-medium text-slate-500 sm:text-[11px]">{stat.label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-950 sm:text-base">
                  {stat.value}
                </p>
              </div>
            ))
          )}
        </div>
      </header>

      <HomeAuctionListSection
        filters={filters}
        isFavoriteMutationPending={favoriteMutation.isPending}
        isLoading={workspaceQuery.isLoading}
        currentPage={safeCurrentPage}
        itemLabel="대"
        items={pagedItems}
        mode={mode}
        pendingMessage={pendingMessage}
        pageSize={HOME_PAGE_SIZE}
        searchInput={searchInput}
        sortLabel="최신순"
        totalItems={filteredItems.length}
        totalPages={totalPages}
        visibleCount={queryData?.summary.visibleCount ?? 0}
        onFavoriteToggle={(auctionId) => favoriteMutation.mutate(auctionId)}
        onFilterChipClick={(label) => {
          setPendingMessage(`${label} 상세 필터는 준비 중입니다.`);
        }}
        onPageChange={setCurrentPage}
        onImportFilterChange={(importFilter) => {
          replaceFilters({
            ...filters,
            importFilter,
          });
        }}
        onSearchInputChange={setSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />
    </section>
  );
}
