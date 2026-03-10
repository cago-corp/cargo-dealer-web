export const appRoutes = {
  login: () => "/login",
  home: (options?: { tab?: "all" | "favorite" }) =>
    options?.tab === "favorite" ? "/home?tab=favorite" : "/home",
  quote: () => "/quote",
  chat: () => "/chat",
  mypage: () => "/mypage",
} as const;
