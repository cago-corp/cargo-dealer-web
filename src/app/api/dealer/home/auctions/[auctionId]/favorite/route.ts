import { NextResponse } from "next/server";
import { getDealerSession } from "@/shared/auth/session";
import { toggleDealerHomeAuctionFavoriteForSession } from "@/shared/api/dealer-home-server";

type RouteContext = {
  params: Promise<{
    auctionId: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const session = await getDealerSession();

  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const { auctionId } = await context.params;

  try {
    const result = await toggleDealerHomeAuctionFavoriteForSession(session, auctionId);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "찜 상태를 변경하지 못했습니다.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
