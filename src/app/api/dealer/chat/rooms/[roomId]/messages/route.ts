import { NextResponse } from "next/server";
import { z } from "zod";
import { getDealerSession } from "@/shared/auth/session";
import { sendDealerChatMessageForSession } from "@/shared/api/dealer-chat-server";

const sendDealerChatMessageRequestSchema = z.object({
  body: z.string().trim().min(1).max(2000),
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
  const parsedPayload = sendDealerChatMessageRequestSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return NextResponse.json({ message: "메시지 입력값이 올바르지 않습니다." }, { status: 400 });
  }

  const { roomId } = await context.params;

  try {
    const message = await sendDealerChatMessageForSession(session, {
      roomId,
      body: parsedPayload.data.body,
    });
    return NextResponse.json(message);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "메시지 전송에 실패했습니다.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
