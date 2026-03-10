import { DealerAuthError } from "@/shared/auth/auth-error";
import type { DealerAuthClient } from "@/shared/auth/clients/dealer-auth-client";

export const springDealerAuthClient: DealerAuthClient = {
  async login() {
    throw new DealerAuthError("Spring auth adapter is not implemented yet.", 501);
  },

  async signup() {
    throw new DealerAuthError("Spring signup adapter is not implemented yet.", 501);
  },

  async refreshSession(session) {
    return session;
  },

  async logout() {},
};
