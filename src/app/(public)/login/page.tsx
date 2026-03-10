import { redirect } from "next/navigation";
import { DealerLoginPage } from "@/features/auth/dealer-login-page";
import { getDealerSession } from "@/shared/auth/session";
import { appRoutes } from "@/shared/config/routes";

export default async function LoginRoutePage() {
  const session = await getDealerSession();
  if (session) {
    redirect(appRoutes.dashboard());
  }

  return <DealerLoginPage />;
}
