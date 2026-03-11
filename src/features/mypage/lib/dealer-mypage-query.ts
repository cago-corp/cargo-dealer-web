import {
  fetchDealerAnnouncementDetail,
  fetchDealerAnnouncementInfo,
  fetchDealerAnnouncementInfoDetail,
  fetchDealerAnnouncementsPage,
  createDealerInterestedVehicle,
  fetchDealerCustomerService,
  fetchDealerInterestedVehicles,
  fetchDealerMyInfo,
  fetchDealerNotifications,
  fetchDealerNotificationSettings,
  fetchDealerProfile,
  fetchDealerReviewWorkspace,
  fetchDealerTerm,
  fetchDealerTermTypes,
  updateDealerNotificationSettings,
  removeDealerInterestedVehicle,
  updateDealerNickname,
  updateDealerPhone,
  updateDealerCompanyName,
  updateDealerRecruiterRegistrationNumber,
} from "@/shared/api/dealer-mypage";

export const dealerProfileQueryKey = ["dealer-profile"] as const;
export const dealerMyInfoQueryKey = ["dealer-my-info"] as const;
export const dealerNotificationsQueryKey = ["dealer-notifications"] as const;
export const dealerNotificationSettingsQueryKey = ["dealer-notification-settings"] as const;
export const dealerInterestedVehiclesQueryKey = ["dealer-interested-vehicles"] as const;
export const dealerTermTypesQueryKey = ["dealer-term-types"] as const;
export const dealerTermQueryRoot = ["dealer-term"] as const;
export const dealerCustomerServiceQueryKey = ["dealer-customer-service"] as const;
export const dealerReviewWorkspaceQueryKey = ["dealer-review-workspace"] as const;
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

export function getDealerTermQueryKey(termTypeId: string) {
  return [...dealerTermQueryRoot, termTypeId] as const;
}

export {
  fetchDealerAnnouncementDetail,
  fetchDealerAnnouncementInfo,
  fetchDealerAnnouncementInfoDetail,
  fetchDealerAnnouncementsPage,
  createDealerInterestedVehicle,
  fetchDealerCustomerService,
  fetchDealerInterestedVehicles,
  fetchDealerMyInfo,
  fetchDealerNotifications,
  fetchDealerNotificationSettings,
  fetchDealerProfile,
  fetchDealerReviewWorkspace,
  fetchDealerTerm,
  fetchDealerTermTypes,
  removeDealerInterestedVehicle,
  updateDealerNotificationSettings,
  updateDealerNickname,
  updateDealerPhone,
  updateDealerCompanyName,
  updateDealerRecruiterRegistrationNumber,
};
