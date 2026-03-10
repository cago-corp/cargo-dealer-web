import { SiteFooter } from "@/shared/ui/site-footer";

type DealerAuthScaffoldProps = Readonly<{
  children: React.ReactNode;
}>;

export function DealerAuthScaffold({ children }: DealerAuthScaffoldProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-6xl flex-1 px-6 py-10">
        {children}
      </main>
      <SiteFooter containerClassName="max-w-6xl" />
    </div>
  );
}
