import { NextResponse } from "next/server";
import { getDealerSession } from "@/shared/auth/session";
import { fetchDealerBidRankForSession } from "@/shared/api/dealer-bid-server";

type RouteContext = {
  params: Promise<{
    auctionId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await getDealerSession();

  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const { auctionId } = await context.params;

  try {
    const rank = await fetchDealerBidRankForSession(session, auctionId);
    return NextResponse.json(rank);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "입찰 순위를 불러오지 못했습니다.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
