import { SiteFooter } from "@/shared/ui/site-footer";

type DealerAuthScaffoldProps = Readonly<{
  children: React.ReactNode;
  mainClassName?: string;
  footerContainerClassName?: string;
  showFooter?: boolean;
  fullBleed?: boolean;
}>;

export function DealerAuthScaffold({
  children,
  mainClassName,
  footerContainerClassName = "max-w-6xl",
  showFooter = true,
  fullBleed = false,
}: DealerAuthScaffoldProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <main
        className={[
          fullBleed
            ? "flex min-h-screen w-full flex-1"
            : "mx-auto flex w-full max-w-6xl flex-1 px-6 py-10",
          mainClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </main>
      {showFooter ? <SiteFooter containerClassName={footerContainerClassName} /> : null}
    </div>
  );
}
