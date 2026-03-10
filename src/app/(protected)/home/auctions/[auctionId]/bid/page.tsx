import { DealerBidWizardPage } from "@/features/bids/dealer-bid-wizard-page";

type BidWizardRoutePageProps = {
  params: Promise<{
    auctionId: string;
  }>;
};

export default async function BidWizardRoutePage({
  params,
}: BidWizardRoutePageProps) {
  const resolvedParams = await params;

  return <DealerBidWizardPage auctionId={resolvedParams.auctionId} />;
}
