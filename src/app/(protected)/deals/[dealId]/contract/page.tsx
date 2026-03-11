import { DealerContractPage } from "@/features/deals/dealer-contract-page";

type DealContractRoutePageProps = {
  params: Promise<{
    dealId: string;
  }>;
};

export default async function DealContractRoutePage({
  params,
}: DealContractRoutePageProps) {
  const { dealId } = await params;

  return <DealerContractPage dealId={dealId} />;
}
