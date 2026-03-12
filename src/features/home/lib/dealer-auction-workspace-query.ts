import { queryOptions } from "@tanstack/react-query";
import type {
  DealerAuctionWorkspaceFilters,
  DealerAuctionWorkspaceMode,
} from "@/entities/auction/schemas/dealer-auction-workspace-schema";
import { fetchDealerAuctionWorkspaceFromApi } from "@/features/home/lib/dealer-home-api";

export type {
  DealerAuctionImportFilter,
  DealerAuctionSort,
  DealerAuctionWorkspaceData,
  DealerAuctionWorkspaceFilters,
  DealerAuctionWorkspaceMode,
  DealerAuctionWorkspaceSummary,
} from "@/entities/auction/schemas/dealer-auction-workspace-schema";

export const dealerAuctionWorkspaceQueryRoot = [
  "dealer-auction-workspace",
] as const;

export function getDealerAuctionWorkspaceQueryKey(
  mode: DealerAuctionWorkspaceMode,
  filters: DealerAuctionWorkspaceFilters,
) {
  return [
    ...dealerAuctionWorkspaceQueryRoot,
    mode,
    filters.search,
    filters.importFilter,
    filters.sort,
  ] as const;
}

export function getDealerAuctionWorkspaceQueryOptions(
  mode: DealerAuctionWorkspaceMode,
  filters: DealerAuctionWorkspaceFilters,
) {
  return queryOptions({
    queryKey: getDealerAuctionWorkspaceQueryKey(mode, filters),
    queryFn: () => fetchDealerAuctionWorkspaceFromApi(mode, filters),
  });
}
