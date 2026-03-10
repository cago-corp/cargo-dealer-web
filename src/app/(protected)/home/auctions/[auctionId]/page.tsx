import { notFound } from "next/navigation";
import { DealerAuctionDetailPage } from "@/features/home/dealer-auction-detail-page";
import { findDealerAuctionById } from "@/features/home/lib/dealer-auction-workspace-query";

type AuctionDetailRoutePageProps = {
  params: Promise<{
    auctionId: string;
  }>;
};

export default async function AuctionDetailRoutePage({
  params,
}: AuctionDetailRoutePageProps) {
  const resolvedParams = await params;
  const auction = findDealerAuctionById(resolvedParams.auctionId);

  if (!auction) {
    notFound();
  }

  return <DealerAuctionDetailPage auction={auction} />;
}
