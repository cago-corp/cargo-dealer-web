import { DealerBidSuccessPage } from "@/features/bids/dealer-bid-success-page";

type BidSuccessRoutePageProps = {
  params: Promise<{
    submissionId: string;
  }>;
};

export default async function BidSuccessRoutePage({
  params,
}: BidSuccessRoutePageProps) {
  const resolvedParams = await params;

  return <DealerBidSuccessPage submissionId={resolvedParams.submissionId} />;
}
