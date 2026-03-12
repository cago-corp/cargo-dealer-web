type SectionCardProps = Readonly<{
  title: string;
  description?: string;
  headerAction?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  titleClassName?: string;
  children: React.ReactNode;
}>;

export function SectionCard({
  title,
  description,
  headerAction,
  className,
  contentClassName,
  titleClassName,
  children,
}: SectionCardProps) {
  return (
    <section
      className={`rounded-[28px] border border-line bg-white p-6 shadow-[0_12px_32px_rgba(0,0,0,0.04)] ${className ?? ""}`.trim()}
    >
      <header className="mb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className={`text-xl font-semibold text-slate-950 ${titleClassName ?? ""}`.trim()}>
              {title}
            </h2>
            {description ? (
              <p className="text-sm text-slate-600">{description}</p>
            ) : null}
          </div>
          {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
        </div>
      </header>
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
