"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { HomeAuctionListSection } from "@/features/home/components/home-auction-list-section";
import { HomeSummaryPanel } from "@/features/home/components/home-summary-panel";
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
import { toggleDealerAuctionFavorite } from "@/shared/api/dealer-marketplace";

type DealerHomeWorkspaceProps = {
  mode: DealerAuctionWorkspaceMode;
  initialFilters: DealerAuctionWorkspaceFilters;
};

const modeCopy = {
  home: {
    eyebrow: "Auction Home",
    title: "경매장 홈",
    description:
      "Flutter dealer의 전체 경매 탭을 웹 작업대에 맞게 확장했습니다. 검색, 차종 전환, 낙관적 찜 토글을 한 화면에서 정리합니다.",
    operationsLabel: "10초마다 자동으로 경매 목록을 다시 확인합니다.",
  },
  favorites: {
    eyebrow: "Favorites",
    title: "찜한 차",
    description:
      "모바일의 찜 탭을 별도 메뉴로 분리했습니다. 해제 즉시 목록에서 빠지고, 다시 홈으로 돌아가도 같은 즐겨찾기 상태가 유지됩니다.",
    operationsLabel: "찜 해제는 낙관적으로 반영하고 전체 홈 목록도 함께 갱신합니다.",
  },
} as const;

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
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const currentQueryKey = getDealerAuctionWorkspaceQueryKey(mode, filters);

  const workspaceQuery = useDealerAuctionWorkspaceQuery(mode, filters);
  const favoriteMutation = useMutation({
    mutationFn: toggleDealerAuctionFavorite,
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

  const queryData = workspaceQuery.data;
  const copy = modeCopy[mode];

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

  return (
    <section className="space-y-6">
      <header className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[32px] border border-white/80 bg-white/92 px-6 py-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
            {copy.eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">
            {copy.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            {copy.description}
          </p>
        </div>
        <div className="rounded-[32px] border border-slate-200 bg-slate-950 px-6 py-6 text-white shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-teal-300">
            Operations
          </p>
          <p className="mt-4 text-lg font-semibold">Flutter 의미를 그대로 유지</p>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {copy.operationsLabel}
          </p>
        </div>
      </header>

      <HomeSummaryPanel
        mode={mode}
        summary={
          queryData?.summary ?? {
            totalAuctions: 0,
            favoriteAuctions: 0,
            bidCount: 0,
            dealCount: 0,
            visibleCount: 0,
          }
        }
      />

      <HomeAuctionListSection
        filters={filters}
        isFavoriteMutationPending={favoriteMutation.isPending}
        isLoading={workspaceQuery.isLoading}
        isRefreshing={workspaceQuery.isRefetching}
        items={queryData?.items ?? []}
        mode={mode}
        pendingMessage={pendingMessage}
        searchInput={searchInput}
        sortLabel={filters.sort === "latest" ? "최신순" : "가격순"}
        visibleCount={queryData?.summary.visibleCount ?? 0}
        onFavoriteToggle={(auctionId) => favoriteMutation.mutate(auctionId)}
        onFilterChipClick={(label) => {
          setPendingMessage(`${label} 상세 필터는 API 계약 이후 연결합니다.`);
        }}
        onImportFilterChange={(importFilter) => {
          replaceFilters({
            ...filters,
            importFilter,
          });
        }}
        onRefresh={() => {
          workspaceQuery.refetch();
        }}
        onSearchInputChange={setSearchInput}
        onSearchSubmit={handleSearchSubmit}
        onSortToggle={() => {
          replaceFilters({
            ...filters,
            sort: filters.sort === "latest" ? "price" : "latest",
          });
        }}
      />
    </section>
  );
}
