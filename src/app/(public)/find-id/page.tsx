import { redirect } from "next/navigation";
import { DealerFindIdPage } from "@/features/auth/dealer-find-id-page";
import { getDealerEntryRoute } from "@/shared/auth/auth-routing";
import { getDealerSession } from "@/shared/auth/session";

export default async function FindIdRoutePage() {
  const session = await getDealerSession();

  if (session) {
    redirect(getDealerEntryRoute(session.accessState));
  }

  return <DealerFindIdPage />;
}
