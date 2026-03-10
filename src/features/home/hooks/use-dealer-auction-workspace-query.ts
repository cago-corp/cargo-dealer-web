"use client";

import { useQuery } from "@tanstack/react-query";
import {
  type DealerAuctionWorkspaceFilters,
  type DealerAuctionWorkspaceMode,
  getDealerAuctionWorkspaceQueryOptions,
} from "@/features/home/lib/dealer-auction-workspace-query";

export function useDealerAuctionWorkspaceQuery(
  mode: DealerAuctionWorkspaceMode,
  filters: DealerAuctionWorkspaceFilters,
) {
  return useQuery(getDealerAuctionWorkspaceQueryOptions(mode, filters));
}
