"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  dealerAnnouncementInfoQueryKey,
  dealerAnnouncementsQueryKey,
  fetchDealerAnnouncementInfo,
  fetchDealerAnnouncementsPage,
  getDealerAnnouncementDetailQueryKey,
  getDealerAnnouncementInfoDetailQueryKey,
  fetchDealerAnnouncementDetail,
  fetchDealerAnnouncementInfoDetail,
} from "@/features/mypage/lib/dealer-mypage-query";

export function useDealerAnnouncementInfoQuery() {
  return useQuery({
    queryKey: dealerAnnouncementInfoQueryKey,
    queryFn: fetchDealerAnnouncementInfo,
  });
}

export function useDealerAnnouncementsInfiniteQuery() {
  return useInfiniteQuery({
    queryKey: dealerAnnouncementsQueryKey,
    queryFn: ({ pageParam }) => fetchDealerAnnouncementsPage(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useDealerAnnouncementDetailQuery(noticeId: string) {
  return useQuery({
    queryKey: getDealerAnnouncementDetailQueryKey(noticeId),
    queryFn: () => fetchDealerAnnouncementDetail(noticeId),
  });
}

export function useDealerAnnouncementInfoDetailQuery(infoId: string) {
  return useQuery({
    queryKey: getDealerAnnouncementInfoDetailQueryKey(infoId),
    queryFn: () => fetchDealerAnnouncementInfoDetail(infoId),
  });
}
