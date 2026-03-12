"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  dealerTermTypesQueryKey,
  fetchDealerTerm,
  fetchDealerTermTypes,
  getDealerTermQueryKey,
} from "@/features/mypage/lib/dealer-mypage-query";
import { SectionCard } from "@/shared/ui/section-card";

export function DealerTermsPage() {
  const termTypesQuery = useQuery({
    queryKey: dealerTermTypesQueryKey,
    queryFn: fetchDealerTermTypes,
  });
  const [selectedTermTypeId, setSelectedTermTypeId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedTermTypeId && termTypesQuery.data?.[0]) {
      setSelectedTermTypeId(termTypesQuery.data[0].id);
    }
  }, [selectedTermTypeId, termTypesQuery.data]);

  const selectedTermQuery = useQuery({
    enabled: selectedTermTypeId !== null,
    queryKey: getDealerTermQueryKey(selectedTermTypeId ?? "none"),
    queryFn: () => fetchDealerTerm(selectedTermTypeId ?? ""),
  });

  if (termTypesQuery.isLoading) {
    return <div className="h-[560px] animate-pulse rounded-[32px] bg-slate-100" />;
  }

  if (termTypesQuery.isError || !termTypesQuery.data) {
    return (
      <section className="rounded-[32px] border border-rose-200 bg-rose-50 px-6 py-12 text-center">
        <p className="text-lg font-semibold text-rose-700">약관 목록을 불러오지 못했습니다.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-700">Terms</p>
        <h1 className="text-3xl font-semibold text-slate-950">약관 및 정책</h1>
        <p className="text-sm text-slate-600">
          앱의 리스트 + 상세 구조를 웹에서는 좌측 목록, 우측 본문으로 정리했습니다.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <SectionCard title="약관 목록" className="xl:sticky xl:top-4 xl:self-start">
          <div className="space-y-2">
            {termTypesQuery.data.map((item) => {
              const isSelected = item.id === selectedTermTypeId;

              return (
                <button
                  className={
                    isSelected
                      ? "w-full rounded-2xl border border-slate-950 bg-slate-950 px-4 py-4 text-left text-white"
                      : "w-full rounded-2xl border border-line bg-white px-4 py-4 text-left text-slate-900"
                  }
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedTermTypeId(item.id)}
                >
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className={isSelected ? "mt-2 text-xs text-slate-300" : "mt-2 text-xs text-slate-500"}>
                    {item.summary}
                  </p>
                </button>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          title={selectedTermQuery.data?.name ?? "약관 상세"}
          description="운영 정책과 이용 기준은 이 화면에서 바로 확인할 수 있습니다."
        >
          {selectedTermQuery.isLoading ? (
            <div className="h-[420px] animate-pulse rounded-[24px] bg-slate-100" />
          ) : selectedTermQuery.isError || !selectedTermQuery.data ? (
            <div className="rounded-[24px] bg-rose-50 px-6 py-8 text-sm text-rose-700">
              약관 내용을 불러오지 못했습니다.
            </div>
          ) : (
            <div className="rounded-[24px] bg-slate-50 px-6 py-6">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">
                {selectedTermQuery.data.content}
              </pre>
            </div>
          )}
        </SectionCard>
      </div>
    </section>
  );
}
