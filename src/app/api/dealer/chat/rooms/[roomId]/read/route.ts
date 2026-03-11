import { NextResponse } from "next/server";
import { z } from "zod";
import { getDealerSession } from "@/shared/auth/session";
import { markDealerChatRoomReadForSession } from "@/shared/api/dealer-chat-server";

const markChatReadRequestSchema = z.object({
  lastMessageId: z.string().min(1),
});

type RouteContext = {
  params: Promise<{
    roomId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const session = await getDealerSession();

  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsedPayload = markChatReadRequestSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return NextResponse.json({ message: "읽음 처리 입력값이 올바르지 않습니다." }, { status: 400 });
  }

  const { roomId } = await context.params;

  try {
    await markDealerChatRoomReadForSession(session, {
      roomId,
      lastMessageId: parsedPayload.data.lastMessageId,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "읽음 처리에 실패했습니다.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
