import { DealerHomeWorkspace } from "@/features/home/components/dealer-home-workspace";
import type {
  DealerAuctionWorkspaceFilters,
  DealerAuctionWorkspaceMode,
} from "@/features/home/lib/dealer-auction-workspace-query";

type DealerHomePageProps = {
  mode: DealerAuctionWorkspaceMode;
  initialFilters: DealerAuctionWorkspaceFilters;
};

export function DealerHomePage({
  mode,
  initialFilters,
}: DealerHomePageProps) {
  return <DealerHomeWorkspace initialFilters={initialFilters} mode={mode} />;
}
