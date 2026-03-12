import { redirect } from "next/navigation";
import { DealerFindPasswordPage } from "@/features/auth/dealer-find-password-page";
import { getDealerEntryRoute } from "@/shared/auth/auth-routing";
import { getDealerSession } from "@/shared/auth/session";

export default async function FindPasswordRoutePage() {
  const session = await getDealerSession();

  if (session) {
    redirect(getDealerEntryRoute(session.accessState));
  }

  return <DealerFindPasswordPage />;
}
