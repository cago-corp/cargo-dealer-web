import type { DealerProfile } from "@/entities/dealer/schemas/dealer-profile-schema";

type DealerProfileSummaryProps = {
  profile: DealerProfile;
};

export function DealerProfileSummary({ profile }: DealerProfileSummaryProps) {
  const approvalStatusLabel =
    profile.approvalStatus === "active" ? "운영 가능" : "승인 대기";

  return (
    <section className="border-t border-line pt-3.5 sm:pt-4">
      <h2 className="text-base font-semibold text-slate-950 sm:text-lg">딜러 계정 개요</h2>
      <dl className="mt-3 divide-y divide-slate-200">
        <ProfileRow label="상호명" value={profile.companyName} />
        <ProfileRow label="대표자" value={profile.ownerName} />
        <ProfileRow label="승인 상태" value={approvalStatusLabel} valueTone={profile.approvalStatus} />
        <ProfileRow label="지점 수" value={`${profile.branchCount}개`} />
      </dl>
    </section>
  );
}

type ProfileRowProps = {
  label: string;
  value: string;
  valueTone?: DealerProfile["approvalStatus"] | "default";
};

function ProfileRow({ label, value, valueTone = "default" }: ProfileRowProps) {
  const toneClassName = {
    default: "text-slate-950",
    active: "text-emerald-700",
    pending: "text-amber-700",
  }[valueTone];

  return (
    <div className="flex flex-col gap-1.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className={`text-base font-semibold ${toneClassName}`}>{value}</dd>
    </div>
  );
}
