import { redirect } from "next/navigation";
import { getDealerEntryRoute } from "@/shared/auth/auth-routing";
import { getDealerSession } from "@/shared/auth/session";
import { appRoutes } from "@/shared/config/routes";

export default async function RootPage() {
  const session = await getDealerSession();

  if (session) {
    redirect(getDealerEntryRoute(session.accessState));
  }

  redirect(appRoutes.login());
}
