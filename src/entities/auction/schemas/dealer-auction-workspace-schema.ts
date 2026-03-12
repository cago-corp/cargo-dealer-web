import { z } from "zod";
import { dealerAuctionBriefSchema } from "@/entities/auction/schemas/dealer-auction-brief-schema";

export const dealerAuctionWorkspaceModeSchema = z.enum(["home", "favorites"]);
export const dealerAuctionImportFilterSchema = z.enum([
  "all",
  "domestic",
  "imported",
]);
export const dealerAuctionSortSchema = z.enum(["latest", "price"]);

export const dealerAuctionWorkspaceFiltersSchema = z.object({
  search: z.string(),
  importFilter: dealerAuctionImportFilterSchema,
  sort: dealerAuctionSortSchema,
});

export const dealerAuctionWorkspaceSummarySchema = z.object({
  totalAuctions: z.number().int().nonnegative(),
  favoriteAuctions: z.number().int().nonnegative(),
  bidCount: z.number().int().nonnegative(),
  dealCount: z.number().int().nonnegative(),
  visibleCount: z.number().int().nonnegative(),
});

export const dealerAuctionWorkspaceDataSchema = z.object({
  items: dealerAuctionBriefSchema.array(),
  summary: dealerAuctionWorkspaceSummarySchema,
});

export type DealerAuctionWorkspaceMode = z.infer<
  typeof dealerAuctionWorkspaceModeSchema
>;
export type DealerAuctionImportFilter = z.infer<
  typeof dealerAuctionImportFilterSchema
>;
export type DealerAuctionSort = z.infer<typeof dealerAuctionSortSchema>;
export type DealerAuctionWorkspaceFilters = z.infer<
  typeof dealerAuctionWorkspaceFiltersSchema
>;
export type DealerAuctionWorkspaceSummary = z.infer<
  typeof dealerAuctionWorkspaceSummarySchema
>;
export type DealerAuctionWorkspaceData = z.infer<
  typeof dealerAuctionWorkspaceDataSchema
>;
