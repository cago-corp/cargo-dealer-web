import {
  dealerChatRoomListItemSchema,
  dealerChatMessageSchema,
  dealerChatRoomSchema,
} from "@/entities/chat/schemas/dealer-chat-schema";

export async function fetchDealerChatRoomListFromApi() {
  const response = await fetch("/api/dealer/chat/rooms", {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
  });

  return readApiResponse(response, dealerChatRoomListItemSchema.array());
}

export async function fetchDealerChatRoomFromApi(roomId: string) {
  const response = await fetch(`/api/dealer/chat/rooms/${roomId}`, {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
  });

  return readApiResponse(response, dealerChatRoomSchema);
}

export async function sendDealerChatMessageFromApi(input: {
  roomId: string;
  body: string;
}) {
  const response = await fetch(`/api/dealer/chat/rooms/${input.roomId}/messages`, {
    method: "POST",
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ body: input.body }),
  });

  return readApiResponse(response, dealerChatMessageSchema);
}

export async function markDealerChatRoomReadFromApi(input: {
  roomId: string;
  lastMessageId: string;
}) {
  const response = await fetch(`/api/dealer/chat/rooms/${input.roomId}/read`, {
    method: "POST",
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ lastMessageId: input.lastMessageId }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? payload.message
        : null;

    throw new Error(
      typeof message === "string" ? message : "읽음 처리에 실패했습니다.",
    );
  }
}

async function readApiResponse<T>(
  response: Response,
  schema: {
    parse: (payload: unknown) => T;
  },
) {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? payload.message
        : null;

    throw new Error(
      typeof message === "string" ? message : "채팅 데이터를 불러오지 못했습니다.",
    );
  }

  return schema.parse(payload);
}
