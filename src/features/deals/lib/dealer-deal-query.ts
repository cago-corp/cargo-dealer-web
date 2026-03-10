import {
  fetchDealerDealDetail,
  fetchDealerDealList,
} from "@/shared/api/dealer-marketplace";

export const dealerDealListQueryKey = ["dealer-deals"] as const;
export const dealerDealDetailQueryRoot = ["dealer-deal-detail"] as const;

export function getDealerDealDetailQueryKey(dealId: string) {
  return [...dealerDealDetailQueryRoot, dealId] as const;
}

export {
  fetchDealerDealDetail,
  fetchDealerDealList,
};
