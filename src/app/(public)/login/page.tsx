import { redirect } from "next/navigation";
import { DealerLoginPage } from "@/features/auth/dealer-login-page";
import { getDealerEntryRoute, sanitizeDealerRedirectPath } from "@/shared/auth/auth-routing";
import { getDealerSession } from "@/shared/auth/session";

type LoginRoutePageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function LoginRoutePage({
  searchParams,
}: LoginRoutePageProps) {
  const session = await getDealerSession();
  const { next } = await searchParams;

  if (session) {
    redirect(getDealerEntryRoute(session.accessState, sanitizeDealerRedirectPath(next)));
  }

  return <DealerLoginPage />;
}
