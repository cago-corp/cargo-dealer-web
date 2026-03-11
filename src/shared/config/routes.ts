export const appRoutes = {
  login: () => "/login",
  signupTerms: () => "/signup-terms",
  signupForm: () => "/signup-form",
  signupCard: () => "/signup-card",
  signupComplete: () => "/signup-complete",
  pendingApproval: () => "/pending-approval",
  home: () => "/home",
  homeAuctionDetail: (auctionId: string) => `/home/auctions/${auctionId}`,
  homeAuctionBidWizard: (auctionId: string) => `/home/auctions/${auctionId}/bid`,
  favorites: () => "/favorites",
  bids: () => "/bids",
  bidDetail: (auctionId: string) => `/bids/${auctionId}`,
  bidSuccess: (submissionId: string) => `/bids/success/${submissionId}`,
  deals: () => "/deals",
  dealDetail: (dealId: string) => `/deals/${dealId}`,
  dealContract: (dealId: string, roomId?: string) =>
    roomId
      ? `/deals/${dealId}/contract?roomId=${encodeURIComponent(roomId)}`
      : `/deals/${dealId}/contract`,
  chat: (roomId?: string) => (roomId ? `/chat?roomId=${encodeURIComponent(roomId)}` : "/chat"),
  chatWindow: (roomId?: string) =>
    roomId ? `/chat-window?roomId=${encodeURIComponent(roomId)}` : "/chat-window",
  mypage: () => "/mypage",
  mypageNotifications: () => "/mypage/notifications",
  mypageAnnouncements: () => "/mypage/announcements",
  mypageAnnouncementDetail: (noticeId: string) => `/mypage/announcements/${noticeId}`,
  mypageAnnouncementInfoDetail: (infoId: string) =>
    `/mypage/announcements/information/${infoId}`,
  mypageMyInfo: () => "/mypage/my-info",
  mypageReview: () => "/mypage/review",
  mypageInterestedVehicles: () => "/mypage/interested-vehicles",
  mypageNotificationSettings: () => "/mypage/notification-settings",
  mypageTerms: () => "/mypage/terms",
  mypageCustomerService: () => "/mypage/customer-service",
} as const;
