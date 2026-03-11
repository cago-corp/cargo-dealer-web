import {
  fetchDealerBidDetailFromApi,
  fetchDealerBidListFromApi,
  fetchDealerBidRankFromApi,
  fetchDealerBidSuccessFromApi,
} from "@/features/bids/lib/dealer-bid-api";

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
  fetchDealerBidDetailFromApi as fetchDealerBidDetail,
  fetchDealerBidListFromApi as fetchDealerBidList,
  fetchDealerBidRankFromApi as fetchDealerBidRank,
  fetchDealerBidSuccessFromApi as fetchDealerBidSuccess,
};
