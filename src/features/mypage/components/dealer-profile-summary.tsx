import type { DealerProfile } from "@/entities/dealer/schemas/dealer-profile-schema";
import { SectionCard } from "@/shared/ui/section-card";

type DealerProfileSummaryProps = {
  profile: DealerProfile;
};

export function DealerProfileSummary({ profile }: DealerProfileSummaryProps) {
  const approvalStatusLabel =
    profile.approvalStatus === "active" ? "운영 가능" : "승인 대기";

  return (
    <SectionCard title="딜러 계정 개요">
      <dl className="divide-y divide-slate-200 rounded-[24px] bg-slate-50 px-5">
        <ProfileRow label="상호명" value={profile.companyName} />
        <ProfileRow label="대표자" value={profile.ownerName} />
        <ProfileRow label="승인 상태" value={approvalStatusLabel} valueTone={profile.approvalStatus} />
        <ProfileRow label="지점 수" value={`${profile.branchCount}개`} />
      </dl>
    </SectionCard>
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
    <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className={`text-base font-semibold ${toneClassName}`}>{value}</dd>
    </div>
  );
}
