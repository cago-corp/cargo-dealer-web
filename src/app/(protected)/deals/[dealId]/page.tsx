import { DealerDealDetailPage } from "@/features/deals/dealer-deal-detail-page";

type DealDetailRoutePageProps = {
  params: Promise<{
    dealId: string;
  }>;
};

export default async function DealDetailRoutePage({
  params,
}: DealDetailRoutePageProps) {
  const { dealId } = await params;

  return <DealerDealDetailPage dealId={dealId} />;
}
