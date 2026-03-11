import { NextResponse } from "next/server";
import { getDealerSession } from "@/shared/auth/session";
import { fetchDealerChatRoomForSession } from "@/shared/api/dealer-chat-server";

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
    const message =
      error instanceof Error ? error.message : "채팅방을 불러오지 못했습니다.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
