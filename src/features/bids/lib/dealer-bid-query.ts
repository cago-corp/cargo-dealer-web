import { fetchDealerBidDetail, fetchDealerBidList, fetchDealerBidRank, fetchDealerBidSuccess } from "@/shared/api/dealer-marketplace";

export const dealerBidListQueryKey = ["dealer-bids"] as const;
export const dealerBidDetailQueryRoot = ["dealer-bid-detail"] as const;
export const dealerBidSuccessQueryRoot = ["dealer-bid-success"] as const;

export function getDealerBidDetailQueryKey(auctionId: string) {
  return [...dealerBidDetailQueryRoot, auctionId] as const;
}

export function getDealerBidSuccessQueryKey(submissionId: string) {
  return [...dealerBidSuccessQueryRoot, submissionId] as const;
}

export function getDealerBidRankQueryKey(auctionId: string) {
  return [...dealerBidDetailQueryRoot, auctionId, "rank"] as const;
}

export {
  fetchDealerBidDetail,
  fetchDealerBidList,
  fetchDealerBidRank,
  fetchDealerBidSuccess,
};
