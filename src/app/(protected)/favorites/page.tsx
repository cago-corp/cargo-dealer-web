import { DealerHomePage } from "@/features/home/dealer-home-page";
import { parseDealerAuctionWorkspaceFilters } from "@/features/home/lib/dealer-home-search-params";

type FavoritesRoutePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FavoritesRoutePage({
  searchParams,
}: FavoritesRoutePageProps) {
  const resolvedSearchParams = await searchParams;
  const initialFilters = parseDealerAuctionWorkspaceFilters(resolvedSearchParams);

  return <DealerHomePage initialFilters={initialFilters} mode="favorites" />;
}
