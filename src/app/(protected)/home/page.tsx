import { DealerHomePage } from "@/features/home/dealer-home-page";

type HomeRoutePageProps = {
  searchParams?: Promise<{
    tab?: string;
  }>;
};

export default async function HomeRoutePage({ searchParams }: HomeRoutePageProps) {
  const resolvedSearchParams = await searchParams;
  const tab = resolvedSearchParams?.tab === "favorite" ? "favorite" : "all";

  return <DealerHomePage currentTab={tab} />;
}
