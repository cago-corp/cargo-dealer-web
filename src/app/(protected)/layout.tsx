import { requireDealerActiveSession } from "@/shared/auth/require-dealer-session";
import { AppShell } from "@/shared/ui/app-shell";

type ProtectedLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const session = await requireDealerActiveSession();

  return <AppShell session={session}>{children}</AppShell>;
}
