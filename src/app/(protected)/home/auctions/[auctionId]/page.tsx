import { DealerAuctionDetailPage } from "@/features/home/dealer-auction-detail-page";

type AuctionDetailRoutePageProps = {
  params: Promise<{
    auctionId: string;
  }>;
};

export default async function AuctionDetailRoutePage({
  params,
}: AuctionDetailRoutePageProps) {
  const resolvedParams = await params;

  return <DealerAuctionDetailPage auctionId={resolvedParams.auctionId} />;
}
