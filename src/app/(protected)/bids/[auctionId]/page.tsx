import { DealerBidDetailPage } from "@/features/bids/dealer-bid-detail-page";

type BidDetailRoutePageProps = {
  params: Promise<{
    auctionId: string;
  }>;
};

export default async function BidDetailRoutePage({
  params,
}: BidDetailRoutePageProps) {
  const resolvedParams = await params;

  return <DealerBidDetailPage auctionId={resolvedParams.auctionId} />;
}
