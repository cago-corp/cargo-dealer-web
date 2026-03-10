import type { DealerAuthClient } from "@/shared/auth/clients/dealer-auth-client";

export const mockDealerAuthClient: DealerAuthClient = {
  async login({ email }) {
    const accessState = email.includes("signup")
      ? "incomplete_signup"
      : email.includes("pending")
        ? "pending_approval"
        : "active";

    return {
      backend: "mock",
      dealerId: "mock-dealer-001",
      email,
      accessState,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
    };
  },

  async refreshSession(session) {
    const accessState = session.email.includes("signup")
      ? "incomplete_signup"
      : session.email.includes("pending")
        ? "pending_approval"
        : "active";

    return {
      ...session,
      accessState,
    };
  },

  async logout() {},
};
