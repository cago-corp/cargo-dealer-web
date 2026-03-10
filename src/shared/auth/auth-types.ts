export type DealerApprovalStatus = "active" | "pending";

export type DealerAuthBackend = "mock" | "supabase" | "spring";

export type DealerLoginCredentials = {
  email: string;
  password: string;
};

export type DealerSession = {
  backend: DealerAuthBackend;
  dealerId: string;
  email: string;
  approvalStatus: DealerApprovalStatus;
  accessToken?: string;
  refreshToken?: string;
  expiresAt: string;
};
