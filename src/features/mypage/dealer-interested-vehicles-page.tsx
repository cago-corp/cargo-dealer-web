"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  dealerInterestedVehiclesQueryKey,
  fetchDealerInterestedVehicles,
} from "@/features/mypage/lib/dealer-mypage-query";
import { SectionCard } from "@/shared/ui/section-card";

type InterestedVehicleTab = "domestic" | "imported";

export function DealerInterestedVehiclesPage() {
  const vehiclesQuery = useQuery({
    queryKey: dealerInterestedVehiclesQueryKey,
    queryFn: fetchDealerInterestedVehicles,
  });
  const [selectedTab, setSelectedTab] = useState<InterestedVehicleTab>("domestic");

  const vehicles = vehiclesQuery.data ?? [];
  const filteredVehicles = vehicles.filter((item) => item.category === selectedTab);

  if (vehiclesQuery.isLoading) {
    return <div className="h-[520px] animate-pulse rounded-[32px] bg-slate-100" />;
  }

  if (vehiclesQuery.isError) {
    return (
      <section className="rounded-[32px] border border-rose-200 bg-rose-50 px-6 py-12 text-center">
        <p className="text-lg font-semibold text-rose-700">관심 차량을 불러오지 못했습니다.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-700">
            Interested Vehicles
          </p>
          <h1 className="text-3xl font-semibold text-slate-950">관심 차량</h1>
          <p className="text-sm text-slate-600">
            원하는 차종을 등록해두면 향후 해당 경매 알림이나 추천 목록과 연결할 수 있습니다.
          </p>
        </div>
        <button
          className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          disabled
          type="button"
        >
          + 추가하기 준비 중
        </button>
      </header>

      <SectionCard title="차종 분류">
        <div className="flex flex-wrap items-center gap-3">
          <CategoryChip
            isSelected={selectedTab === "domestic"}
            label={`국산차 ${vehicles.filter((item) => item.category === "domestic").length}`}
            onClick={() => setSelectedTab("domestic")}
          />
          <CategoryChip
            isSelected={selectedTab === "imported"}
            label={`수입차 ${vehicles.filter((item) => item.category === "imported").length}`}
            onClick={() => setSelectedTab("imported")}
          />
        </div>
      </SectionCard>

      <SectionCard title="등록 목록">
        {filteredVehicles.length === 0 ? (
          <div className="rounded-[28px] bg-slate-50 px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl text-slate-300 shadow-sm">
              ☆
            </div>
            <p className="mt-5 text-xl font-semibold text-slate-950">
              등록된 관심 차량이 없습니다.
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              원하는 차량 모델을 등록해두면 해당 경매가 시작될 때 더 빠르게 확인할 수 있습니다.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredVehicles.map((item) => (
              <div
                className="rounded-2xl border border-line bg-white px-5 py-4"
                key={item.id}
              >
                <p className="text-base font-semibold text-slate-950">{item.label}</p>
                <p className="mt-2 text-sm text-slate-600">{item.modelDetail}</p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </section>
  );
}

function CategoryChip({
  label,
  isSelected,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={
        isSelected
          ? "rounded-full bg-slate-700 px-5 py-2.5 text-sm font-semibold text-white"
          : "rounded-full bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-500"
      }
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}
