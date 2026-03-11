import { NextResponse } from "next/server";
import { getDealerSession } from "@/shared/auth/session";
import {
  DEALER_CHAT_VIDEO_UPLOAD_LIMIT_BYTES,
  sendDealerChatAttachmentForSession,
} from "@/shared/api/dealer-chat-server";

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

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "첨부 파일이 필요합니다." }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ message: "비어 있는 파일은 전송할 수 없습니다." }, { status: 400 });
  }

  if (file.type.startsWith("video/") && file.size > DEALER_CHAT_VIDEO_UPLOAD_LIMIT_BYTES) {
    return NextResponse.json(
      { message: "100MB 이하 영상만 업로드할 수 있습니다." },
      { status: 400 },
    );
  }

  const { roomId } = await context.params;

  try {
    const message = await sendDealerChatAttachmentForSession(session, {
      roomId,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      bytes: await file.arrayBuffer(),
    });

    return NextResponse.json(message);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "첨부 전송에 실패했습니다.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
