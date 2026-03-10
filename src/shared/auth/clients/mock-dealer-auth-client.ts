import type { DealerAuthClient } from "@/shared/auth/clients/dealer-auth-client";

export const mockDealerAuthClient: DealerAuthClient = {
  async login({ email }) {
    return {
      backend: "mock",
      dealerId: "mock-dealer-001",
      email,
      approvalStatus: email.includes("pending") ? "pending" : "active",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
    };
  },

  async logout() {},
};
