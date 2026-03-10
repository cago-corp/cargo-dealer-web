type SectionCardProps = Readonly<{
  title: string;
  description: string;
  children: React.ReactNode;
}>;

export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <section className="rounded-[28px] border border-line bg-white/80 p-6">
      <header className="mb-5 space-y-1">
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        <p className="text-sm text-slate-600">{description}</p>
      </header>
      {children}
    </section>
  );
}
