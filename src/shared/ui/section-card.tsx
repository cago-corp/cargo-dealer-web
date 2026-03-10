type SectionCardProps = Readonly<{
  title: string;
  description?: string;
  children: React.ReactNode;
}>;

export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <section className="rounded-[28px] border border-line bg-white p-6 shadow-[0_12px_32px_rgba(0,0,0,0.04)]">
      <header className="mb-5 space-y-1">
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        {description ? (
          <p className="text-sm text-slate-600">{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}
