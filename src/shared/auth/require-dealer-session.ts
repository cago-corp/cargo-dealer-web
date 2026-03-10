import { redirect } from "next/navigation";
import { getDealerSession } from "@/shared/auth/session";
import { appRoutes } from "@/shared/config/routes";

export async function requireDealerSession() {
  const session = await getDealerSession();
  if (!session) {
    redirect(appRoutes.login());
  }

  return session;
}
