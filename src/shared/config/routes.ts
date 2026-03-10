export const appRoutes = {
  login: () => "/login",
  home: () => "/home",
  homeAuctionDetail: (auctionId: string) => `/home/auctions/${auctionId}`,
  homeAuctionBidWizard: (auctionId: string) => `/home/auctions/${auctionId}/bid`,
  favorites: () => "/favorites",
  bids: () => "/bids",
  bidDetail: (auctionId: string) => `/bids/${auctionId}`,
  bidSuccess: (submissionId: string) => `/bids/success/${submissionId}`,
  deals: () => "/deals",
  dealDetail: (dealId: string) => `/deals/${dealId}`,
  chat: (roomId?: string) => (roomId ? `/chat?roomId=${encodeURIComponent(roomId)}` : "/chat"),
  mypage: () => "/mypage",
} as const;
