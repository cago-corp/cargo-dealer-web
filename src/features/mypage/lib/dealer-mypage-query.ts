import {
  fetchDealerAnnouncementDetail,
  fetchDealerAnnouncementInfo,
  fetchDealerAnnouncementInfoDetail,
  fetchDealerAnnouncementsPage,
  fetchDealerNotifications,
  fetchDealerProfile,
} from "@/shared/api/dealer-mypage";

export const dealerProfileQueryKey = ["dealer-profile"] as const;
export const dealerNotificationsQueryKey = ["dealer-notifications"] as const;
export const dealerAnnouncementInfoQueryKey = ["dealer-announcement-info"] as const;
export const dealerAnnouncementsQueryKey = ["dealer-announcements"] as const;
export const dealerAnnouncementDetailQueryRoot = ["dealer-announcement-detail"] as const;
export const dealerAnnouncementInfoDetailQueryRoot = [
  "dealer-announcement-info-detail",
] as const;

export function getDealerAnnouncementDetailQueryKey(noticeId: string) {
  return [...dealerAnnouncementDetailQueryRoot, noticeId] as const;
}

export function getDealerAnnouncementInfoDetailQueryKey(infoId: string) {
  return [...dealerAnnouncementInfoDetailQueryRoot, infoId] as const;
}

export {
  fetchDealerAnnouncementDetail,
  fetchDealerAnnouncementInfo,
  fetchDealerAnnouncementInfoDetail,
  fetchDealerAnnouncementsPage,
  fetchDealerNotifications,
  fetchDealerProfile,
};
