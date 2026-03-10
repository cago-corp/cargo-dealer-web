import { redirect } from "next/navigation";
import { DealerAuthScaffold } from "@/features/auth/dealer-auth-scaffold";
import { DealerPendingApprovalPage } from "@/features/auth/dealer-pending-approval-page";
import { getDealerSession } from "@/shared/auth/session";
import { appRoutes } from "@/shared/config/routes";

export default async function PendingApprovalRoutePage() {
  const session = await getDealerSession();

  if (!session) {
    redirect(appRoutes.login());
  }

  return (
    <DealerAuthScaffold>
      <DealerPendingApprovalPage email={session.email} />
    </DealerAuthScaffold>
  );
}
