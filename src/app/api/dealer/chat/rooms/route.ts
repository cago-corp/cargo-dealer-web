import { NextResponse } from "next/server";
import { getDealerSession } from "@/shared/auth/session";
import { fetchDealerChatRoomListForSession } from "@/shared/api/dealer-chat-server";

export async function GET() {
  const session = await getDealerSession();

  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const items = await fetchDealerChatRoomListForSession(session);
    return NextResponse.json(items);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "채팅 목록을 불러오지 못했습니다.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
