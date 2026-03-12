import {
  fetchDealerDealDetailFromApi,
  fetchDealerDealListFromApi,
} from "@/features/deals/lib/dealer-deal-api";

export const dealerDealListQueryKey = ["dealer-deals"] as const;
export const dealerDealDetailQueryRoot = ["dealer-deal-detail"] as const;

export function getDealerDealDetailQueryKey(dealId: string) {
  return [...dealerDealDetailQueryRoot, dealId] as const;
}

export {
  fetchDealerDealDetailFromApi as fetchDealerDealDetail,
  fetchDealerDealListFromApi as fetchDealerDealList,
};
