import { z } from "zod";
import type { DealerAuctionWorkspaceFilters } from "@/entities/auction/schemas/dealer-auction-workspace-schema";

const dealerHomeSearchParamsSchema = z.object({
  search: z.string().trim().max(50).optional(),
  imported: z.enum(["all", "domestic", "imported"]).optional(),
  sort: z.enum(["latest", "price"]).optional(),
});

type SearchParamInput = Partial<
  Record<"search" | "imported" | "sort", string | string[] | undefined>
>;

function pickFirstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseDealerAuctionWorkspaceFilters(
  input?: SearchParamInput,
): DealerAuctionWorkspaceFilters {
  const parsed = dealerHomeSearchParamsSchema.safeParse({
    search: pickFirstValue(input?.search),
    imported: pickFirstValue(input?.imported),
    sort: pickFirstValue(input?.sort),
  });

  return {
    search: parsed.data?.search ?? "",
    importFilter: parsed.data?.imported ?? "all",
    sort: parsed.data?.sort ?? "latest",
  };
}

export function buildDealerAuctionWorkspaceHref(
  pathname: string,
  filters: DealerAuctionWorkspaceFilters,
) {
  const nextSearchParams = new URLSearchParams();

  if (filters.search) {
    nextSearchParams.set("search", filters.search);
  }

  if (filters.importFilter !== "all") {
    nextSearchParams.set("imported", filters.importFilter);
  }

  if (filters.sort !== "latest") {
    nextSearchParams.set("sort", filters.sort);
  }

  const nextQueryString = nextSearchParams.toString();

  return nextQueryString ? `${pathname}?${nextQueryString}` : pathname;
}
