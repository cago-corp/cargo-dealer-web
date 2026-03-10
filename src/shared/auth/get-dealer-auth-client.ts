import type { DealerAuthClient } from "@/shared/auth/clients/dealer-auth-client";
import { mockDealerAuthClient } from "@/shared/auth/clients/mock-dealer-auth-client";
import { springDealerAuthClient } from "@/shared/auth/clients/spring-dealer-auth-client";
import { supabaseDealerAuthClient } from "@/shared/auth/clients/supabase-dealer-auth-client";
import { getServerEnv } from "@/shared/config/env";

export function getDealerAuthClient(): DealerAuthClient {
  const env = getServerEnv();
  const backend =
    env.AUTH_BACKEND ??
    (env.SUPABASE_URL && env.SUPABASE_ANON_KEY ? "supabase" : "mock");

  switch (backend) {
    case "supabase":
      return supabaseDealerAuthClient;
    case "spring":
      return springDealerAuthClient;
    case "mock":
    default:
      return mockDealerAuthClient;
  }
}
