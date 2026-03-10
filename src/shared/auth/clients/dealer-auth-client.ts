import type {
  DealerLoginCredentials,
  DealerSignupPayload,
  DealerSession,
} from "@/shared/auth/auth-types";

export interface DealerAuthClient {
  login(credentials: DealerLoginCredentials): Promise<DealerSession>;
  signup(payload: DealerSignupPayload): Promise<DealerSession>;
  refreshSession(session: DealerSession): Promise<DealerSession>;
  logout(session: DealerSession | null): Promise<void>;
}
