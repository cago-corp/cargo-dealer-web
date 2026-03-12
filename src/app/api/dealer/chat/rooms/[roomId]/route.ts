import { NextResponse } from "next/server";
import { getDealerSession } from "@/shared/auth/session";
import { fetchDealerChatRoomForSession } from "@/shared/api/dealer-chat-server";
import { getSafeRouteErrorMessage, getSafeRouteErrorStatus } from "@/shared/api/route-error";

type RouteContext = {
  params: Promise<{
    roomId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await getDealerSession();

  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const { roomId } = await context.params;

  try {
    const item = await fetchDealerChatRoomForSession(session, roomId);
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json(
      { message: getSafeRouteErrorMessage(error, "채팅방을 불러오지 못했습니다.") },
      { status: getSafeRouteErrorStatus(error, 500) },
    );
  }
}
