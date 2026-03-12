export type DealerAccessState = "active" | "pending_approval" | "incomplete_signup";

export type DealerAuthBackend = "mock" | "supabase" | "spring";

export type DealerLoginCredentials = {
  email: string;
  password: string;
};

export type DealerSignupPayload = {
  email: string;
  password: string;
  name: string;
  companyName: string;
  phone: string;
  tosAgreed: boolean;
  marketingNotificationOptIn: boolean;
  nickname?: string;
  businessCardImageUrl?: string;
};

export type DealerSession = {
  backend: DealerAuthBackend;
  dealerId: string;
  email: string;
  accessState: DealerAccessState;
  accessToken?: string;
  refreshToken?: string;
  expiresAt: string;
};
