import { NextResponse } from "next/server";
import {
  dealerAuctionWorkspaceFiltersSchema,
  dealerAuctionWorkspaceModeSchema,
} from "@/entities/auction/schemas/dealer-auction-workspace-schema";
import { getDealerSession } from "@/shared/auth/session";
import { fetchDealerHomeWorkspaceForSession } from "@/shared/api/dealer-home-server";
import { getSafeRouteErrorMessage, getSafeRouteErrorStatus } from "@/shared/api/route-error";

export async function GET(request: Request) {
  const session = await getDealerSession();

  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const url = new URL(request.url);
  const parsedMode = dealerAuctionWorkspaceModeSchema.safeParse(
    url.searchParams.get("mode") ?? "home",
  );
  const parsedFilters = dealerAuctionWorkspaceFiltersSchema.safeParse({
    search: url.searchParams.get("search") ?? "",
    importFilter: url.searchParams.get("importFilter") ?? "all",
    sort: url.searchParams.get("sort") ?? "latest",
  });

  if (!parsedMode.success || !parsedFilters.success) {
    return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });
  }

  try {
    const workspace = await fetchDealerHomeWorkspaceForSession(
      session,
      parsedMode.data,
      parsedFilters.data,
    );

    return NextResponse.json(workspace);
  } catch (error) {
    return NextResponse.json(
      { message: getSafeRouteErrorMessage(error, "경매장 홈 데이터를 불러오지 못했습니다.") },
      { status: getSafeRouteErrorStatus(error, 500) },
    );
  }
}
