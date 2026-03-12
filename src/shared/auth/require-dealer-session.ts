import { redirect } from "next/navigation";
import { getDealerSession } from "@/shared/auth/session";
import { getDealerEntryRoute } from "@/shared/auth/auth-routing";
import { appRoutes } from "@/shared/config/routes";

export async function requireDealerSession() {
  const session = await getDealerSession();
  if (!session) {
    redirect(appRoutes.login());
  }

  return session;
}

export async function requireDealerActiveSession() {
  const session = await requireDealerSession();

  if (session.accessState !== "active") {
    redirect(getDealerEntryRoute(session.accessState));
  }

  return session;
}
