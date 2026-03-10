import type {
  DealerLoginCredentials,
  DealerSession,
} from "@/shared/auth/auth-types";

export interface DealerAuthClient {
  login(credentials: DealerLoginCredentials): Promise<DealerSession>;
  logout(session: DealerSession | null): Promise<void>;
}
