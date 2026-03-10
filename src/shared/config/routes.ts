export const appRoutes = {
  login: () => "/login",
  home: () => "/home",
  homeAuctionDetail: (auctionId: string) => `/home/auctions/${auctionId}`,
  favorites: () => "/favorites",
  bids: () => "/bids",
  deals: () => "/deals",
  chat: () => "/chat",
  mypage: () => "/mypage",
} as const;
