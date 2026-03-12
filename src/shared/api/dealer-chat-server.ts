import "server-only";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  dealerChatRoomListItemSchema,
  dealerChatRoomSchema,
  dealerChatMessageSchema,
  type DealerChatMessage,
  type DealerChatRoom,
  type DealerChatRoomListItem,
} from "@/entities/chat/schemas/dealer-chat-schema";
import type { DealerSession } from "@/shared/auth/auth-types";
import { getServerEnv } from "@/shared/config/env";
import {
  fetchDealerChatRoom as fetchMockDealerChatRoom,
  fetchDealerChatRoomList as fetchMockDealerChatRoomList,
  sendDealerChatMessage as sendMockDealerChatMessage,
} from "@/shared/api/dealer-marketplace";
import {
  fetchDealerDealListForSession,
  fetchDealerDealDetailForSession,
} from "@/shared/api/dealer-deal-server";

const chatRoomMemberSchema = z.object({
  chat_room_id: z.string(),
});

const chatRoomRecordSchema = z.object({
  id: z.string(),
  deal_id: z.string().nullable().optional(),
  profiles_user_id: z.string(),
  created_at: z.string(),
});

const profileUserRecordSchema = z.object({
  id: z.string(),
  name: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
});

const chatMessageRecordSchema = z.object({
  id: z.union([z.number().int(), z.string()]),
  room_id: z.string(),
  auth_users_id: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  file_url: z.string().nullable().optional(),
  metadata: z.unknown().nullable().optional(),
  created_at: z.string(),
  edited_at: z.string().nullable().optional(),
});

const chatReadStateRecordSchema = z.object({
  room_id: z.string(),
  last_read_message_id: z.union([z.number().int(), z.string()]).nullable().optional(),
});

const sendDealerChatMessageResultSchema = z.array(chatMessageRecordSchema).min(1);
export const DEALER_CHAT_IMAGE_UPLOAD_LIMIT_BYTES = 20 * 1024 * 1024;
export const DEALER_CHAT_VIDEO_UPLOAD_LIMIT_BYTES = 100 * 1024 * 1024;
export const DEALER_CHAT_FILE_UPLOAD_LIMIT_BYTES = 20 * 1024 * 1024;
const signedChatAttachmentUrlCache = new Map<string, { url: string; expiresAt: number }>();

const dealerChatAttachmentSpecMap = {
  jpg: {
    category: "image",
    mimeTypes: ["image/jpeg", "image/jpg"],
    maxSize: DEALER_CHAT_IMAGE_UPLOAD_LIMIT_BYTES,
  },
  jpeg: {
    category: "image",
    mimeTypes: ["image/jpeg", "image/jpg"],
    maxSize: DEALER_CHAT_IMAGE_UPLOAD_LIMIT_BYTES,
  },
  png: {
    category: "image",
    mimeTypes: ["image/png"],
    maxSize: DEALER_CHAT_IMAGE_UPLOAD_LIMIT_BYTES,
  },
  webp: {
    category: "image",
    mimeTypes: ["image/webp"],
    maxSize: DEALER_CHAT_IMAGE_UPLOAD_LIMIT_BYTES,
  },
  gif: {
    category: "image",
    mimeTypes: ["image/gif"],
    maxSize: DEALER_CHAT_IMAGE_UPLOAD_LIMIT_BYTES,
  },
  heic: {
    category: "image",
    mimeTypes: ["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"],
    maxSize: DEALER_CHAT_IMAGE_UPLOAD_LIMIT_BYTES,
  },
  heif: {
    category: "image",
    mimeTypes: ["image/heif", "image/heic", "image/heif-sequence", "image/heic-sequence"],
    maxSize: DEALER_CHAT_IMAGE_UPLOAD_LIMIT_BYTES,
  },
  mp4: {
    category: "video",
    mimeTypes: ["video/mp4"],
    maxSize: DEALER_CHAT_VIDEO_UPLOAD_LIMIT_BYTES,
  },
  mov: {
    category: "video",
    mimeTypes: ["video/quicktime"],
    maxSize: DEALER_CHAT_VIDEO_UPLOAD_LIMIT_BYTES,
  },
  webm: {
    category: "video",
    mimeTypes: ["video/webm"],
    maxSize: DEALER_CHAT_VIDEO_UPLOAD_LIMIT_BYTES,
  },
  pdf: {
    category: "file",
    mimeTypes: ["application/pdf", "application/octet-stream"],
    maxSize: DEALER_CHAT_FILE_UPLOAD_LIMIT_BYTES,
  },
  doc: {
    category: "file",
    mimeTypes: ["application/msword", "application/octet-stream"],
    maxSize: DEALER_CHAT_FILE_UPLOAD_LIMIT_BYTES,
  },
  docx: {
    category: "file",
    mimeTypes: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/octet-stream",
    ],
    maxSize: DEALER_CHAT_FILE_UPLOAD_LIMIT_BYTES,
  },
  xls: {
    category: "file",
    mimeTypes: ["application/vnd.ms-excel", "application/octet-stream"],
    maxSize: DEALER_CHAT_FILE_UPLOAD_LIMIT_BYTES,
  },
  xlsx: {
    category: "file",
    mimeTypes: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/octet-stream",
    ],
    maxSize: DEALER_CHAT_FILE_UPLOAD_LIMIT_BYTES,
  },
  txt: {
    category: "file",
    mimeTypes: ["text/plain", "application/octet-stream"],
    maxSize: DEALER_CHAT_FILE_UPLOAD_LIMIT_BYTES,
  },
} as const;

type ChatRoomRecord = z.output<typeof chatRoomRecordSchema>;
type ChatMessageRecord = z.output<typeof chatMessageRecordSchema>;

export async function fetchDealerChatRoomListForSession(
  session: DealerSession,
): Promise<DealerChatRoomListItem[]> {
  const backend = resolveDealerDataBackend(session);

  if (backend === "mock") {
    return fetchMockDealerChatRoomList();
  }

  if (backend === "spring") {
    throw new Error("Spring dealer chat backend is not implemented yet.");
  }

  const roomIds = await fetchDealerChatRoomIds(session);

  if (roomIds.length === 0) {
    return [];
  }

  const [rooms, profiles, recentMessages, readStates] = await Promise.all([
    fetchChatRooms(session, roomIds),
    fetchProfilesUser(session, roomIds),
    fetchRecentMessages(session, roomIds),
    fetchReadStates(session, roomIds),
  ]);
  const dealEntries = await Promise.all(
    rooms.flatMap((room) =>
      room.deal_id
        ? [
            fetchDealerDealDetailForSession(session, room.deal_id)
              .then((deal) => [room.deal_id as string, deal] as const)
              .catch(() => null),
          ]
        : [],
    ),
  );

  const roomMap = new Map(rooms.map((room) => [room.id, room]));
  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
  const readStateMap = new Map(readStates.map((state) => [state.room_id, state]));
  const dealMap = new Map(
    dealEntries.flatMap((entry) => (entry ? [entry] : [])),
  );
  const messagesByRoom = new Map<string, ChatMessageRecord[]>();

  for (const message of recentMessages) {
    const current = messagesByRoom.get(message.room_id);

    if (current) {
      current.push(message);
    } else {
      messagesByRoom.set(message.room_id, [message]);
    }
  }

  return roomIds
    .flatMap((roomId) => {
      const room = roomMap.get(roomId);

      if (!room || !room.deal_id) {
        return [];
      }

      const deal = dealMap.get(room.deal_id);

      if (!deal) {
        return [];
      }

      const profile = profileMap.get(room.profiles_user_id);
      const readState = readStateMap.get(roomId);
      const roomMessages = messagesByRoom.get(roomId) ?? [];
      const latestMessage = roomMessages[0] ?? null;
      const unreadCount = roomMessages.filter(
        (message) =>
          message.auth_users_id !== session.dealerId &&
          getNumericMessageId(message.id) >
            getNumericMessageId(readState?.last_read_message_id ?? null),
      ).length;

      return [
        dealerChatRoomListItemSchema.parse({
          id: room.id,
          dealId: deal.id,
          auctionId: deal.auctionId,
          statusCode: deal.statusCode,
          customerName: profile?.name ?? deal.customerName,
          customerPhone: profile?.phone ?? deal.customerPhone,
          vehicleLabel: deal.vehicleLabel,
          stageLabel: deal.stage,
          stageDescription: deal.statusDescription,
          lastMessage: latestMessage
            ? buildChatPreview(latestMessage)
            : "대화를 시작해 보세요.",
          lastMessageAt: toIsoDateTime(
            latestMessage?.created_at ?? room.created_at,
          ),
          unreadCount,
          isClosed: deal.stage === "출고 완료",
        }),
      ];
    })
    .sort((left, right) => Date.parse(right.lastMessageAt) - Date.parse(left.lastMessageAt));
}

export async function fetchDealerChatRoomForSession(
  session: DealerSession,
  roomId: string,
): Promise<DealerChatRoom> {
  const backend = resolveDealerDataBackend(session);

  if (backend === "mock") {
    return fetchMockDealerChatRoom(roomId);
  }

  if (backend === "spring") {
    throw new Error("Spring dealer chat backend is not implemented yet.");
  }

  const rooms = await fetchDealerChatRoomListForSession(session);
  const room = rooms.find((item) => item.id === roomId);

  if (!room) {
    throw new Error("채팅방을 찾을 수 없습니다.");
  }

  const [messages, dealDetail] = await Promise.all([
    fetchChatMessages(session, roomId),
    fetchDealerDealDetailForSession(session, room.dealId).catch(() => null),
  ]);

  return dealerChatRoomSchema.parse({
    ...room,
    purchaseMethod: dealDetail?.purchaseMethod ?? "현금",
    messages: await Promise.all(
      messages.map((message) => toDealerChatMessage(message, session)),
    ),
  });
}

export async function sendDealerChatMessageForSession(
  session: DealerSession,
  input: {
    roomId: string;
    body: string;
  },
): Promise<DealerChatMessage> {
  const backend = resolveDealerDataBackend(session);

  if (backend === "mock") {
    return sendMockDealerChatMessage({
      roomId: input.roomId,
      body: input.body,
    });
  }

  if (backend === "spring") {
    throw new Error("Spring dealer chat backend is not implemented yet.");
  }

  const env = getRequiredSupabaseDataEnv(session);
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/chat_message?select=*`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${env.accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    cache: "no-store",
    body: JSON.stringify({
      room_id: input.roomId,
      auth_users_id: session.dealerId,
      content: input.body.trim(),
    }),
  });

  const responseJson = await readJson(response);
  if (!response.ok) {
    throw new Error(getSupabaseErrorMessage(responseJson) ?? "메시지 전송에 실패했습니다.");
  }

  const inserted = sendDealerChatMessageResultSchema.parse(responseJson)[0];

  return toDealerChatMessage(inserted, session);
}

export async function sendDealerChatAttachmentForSession(
  session: DealerSession,
  input: {
    roomId: string;
    fileName: string;
    mimeType: string;
    size: number;
    bytes: ArrayBuffer;
  },
): Promise<DealerChatMessage> {
  const backend = resolveDealerDataBackend(session);

  if (backend === "mock") {
    throw new Error("Mock 채팅 첨부 전송은 아직 지원하지 않습니다.");
  }

  if (backend === "spring") {
    throw new Error("Spring dealer chat backend is not implemented yet.");
  }

  const validatedAttachment = validateDealerChatAttachment({
    fileName: input.fileName,
    mimeType: input.mimeType,
    size: input.size,
  });

  const room = await fetchChatRoomById(session, input.roomId);

  if (!room?.deal_id) {
    throw new Error("첨부를 전송할 채팅방을 찾을 수 없습니다.");
  }

  const storagePath = await uploadChatAttachmentToStorage(session, {
    roomId: input.roomId,
    dealId: room.deal_id,
    fileName: input.fileName,
    mimeType: validatedAttachment.mimeType,
    bytes: input.bytes,
  });

  const metadataJson = JSON.stringify({
    name: input.fileName,
    size: input.size,
    mime: validatedAttachment.mimeType,
  });

  const env = getRequiredSupabaseDataEnv(session);
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/chat_message?select=*`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${env.accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    cache: "no-store",
    body: JSON.stringify({
      room_id: input.roomId,
      auth_users_id: session.dealerId,
      content: metadataJson,
      file_url: storagePath,
    }),
  });

  const responseJson = await readJson(response);
  if (!response.ok) {
    throw new Error(getSupabaseErrorMessage(responseJson) ?? "첨부 전송에 실패했습니다.");
  }

  const inserted = sendDealerChatMessageResultSchema.parse(responseJson)[0];
  return toDealerChatMessage(inserted, session);
}

export async function markDealerChatRoomReadForSession(
  session: DealerSession,
  input: {
    roomId: string;
    lastMessageId: string;
  },
) {
  const backend = resolveDealerDataBackend(session);

  if (backend === "mock") {
    return;
  }

  if (backend === "spring") {
    throw new Error("Spring dealer chat backend is not implemented yet.");
  }

  const env = getRequiredSupabaseDataEnv(session);
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/chat_read_state`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${env.accessToken}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    cache: "no-store",
    body: JSON.stringify({
      room_id: input.roomId,
      auth_users_id: session.dealerId,
      last_read_message_id: Number(input.lastMessageId),
      last_read_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const responseJson = await readJson(response);
    throw new Error(getSupabaseErrorMessage(responseJson) ?? "읽음 처리에 실패했습니다.");
  }
}

export async function fetchDealerChatStreamCursorForSession(session: DealerSession) {
  const backend = resolveDealerDataBackend(session);

  if (backend !== "supabase") {
    return {
      cursor: `mock:${Date.now()}`,
    };
  }

  const roomIds = await fetchDealerChatRoomIds(session);

  if (roomIds.length === 0) {
    return { cursor: "empty" };
  }

  const [rooms, recentMessages] = await Promise.all([
    fetchChatRooms(session, roomIds),
    fetchRecentMessages(session, roomIds),
  ]);

  const latestRoomAt = rooms
    .map((room) => Date.parse(room.created_at))
    .sort((left, right) => right - left)[0] ?? 0;
  const latestMessageId = recentMessages
    .map((message) => getNumericMessageId(message.id))
    .sort((left, right) => right - left)[0] ?? 0;

  return {
    cursor: `${roomIds.length}:${latestRoomAt}:${latestMessageId}`,
  };
}

async function fetchDealerChatRoomIds(session: DealerSession) {
  const [memberRecords, deals] = await Promise.all([
    fetchTableRecords(session, "chat_room_member", {
      select: "chat_room_id",
      profiles_dealer_id: `eq.${session.dealerId}`,
    }),
    fetchDealerDealListForSession(session).catch(() => []),
  ]);

  const roomIds = new Set(
    chatRoomMemberSchema
      .array()
      .parse(memberRecords)
      .map((record) => record.chat_room_id),
  );

  for (const deal of deals) {
    if (!deal.chatRoomId.startsWith("pending:")) {
      roomIds.add(deal.chatRoomId);
    }
  }

  return [...roomIds];
}

async function fetchChatRooms(session: DealerSession, roomIds: string[]) {
  const records = await fetchTableRecords(session, "chat_room", {
    select: "id,deal_id,profiles_user_id,created_at",
    id: toPostgrestInFilter(roomIds),
  });

  return chatRoomRecordSchema.array().parse(records);
}

async function fetchChatRoomById(session: DealerSession, roomId: string) {
  const records = await fetchTableRecords(session, "chat_room", {
    select: "id,deal_id,profiles_user_id,created_at",
    id: `eq.${roomId}`,
    limit: "1",
  });

  return chatRoomRecordSchema.array().parse(records)[0] ?? null;
}

async function fetchProfilesUser(session: DealerSession, roomIds: string[]) {
  const rooms = await fetchChatRooms(session, roomIds);
  const userIds = [...new Set(rooms.map((room) => room.profiles_user_id))];

  if (userIds.length === 0) {
    return [];
  }

  const records = await fetchTableRecords(session, "profiles_user", {
    select: "id,name,phone",
    id: toPostgrestInFilter(userIds),
  });

  return profileUserRecordSchema.array().parse(records);
}

async function fetchRecentMessages(session: DealerSession, roomIds: string[]) {
  const messages = await fetchTableRecords(session, "chat_message", {
    select: "id,room_id,auth_users_id,content,file_url,metadata,created_at,edited_at",
    room_id: toPostgrestInFilter(roomIds),
    order: "created_at.desc",
    limit: "200",
  });

  return chatMessageRecordSchema.array().parse(messages);
}

async function fetchChatMessages(session: DealerSession, roomId: string) {
  const records = await fetchTableRecords(session, "chat_message", {
    select: "id,room_id,auth_users_id,content,file_url,metadata,created_at,edited_at",
    room_id: `eq.${roomId}`,
    order: "id.asc",
    limit: "200",
  });

  return chatMessageRecordSchema.array().parse(records);
}

async function fetchReadStates(session: DealerSession, roomIds: string[]) {
  const records = await fetchTableRecords(session, "chat_read_state", {
    select: "room_id,last_read_message_id",
    auth_users_id: `eq.${session.dealerId}`,
    room_id: toPostgrestInFilter(roomIds),
  });

  return chatReadStateRecordSchema.array().parse(records);
}

async function fetchTableRecords(
  session: DealerSession,
  tableName: string,
  searchParams: Record<string, string>,
) {
  const env = getRequiredSupabaseDataEnv(session);
  const requestUrl = new URL(`${env.SUPABASE_URL}/rest/v1/${tableName}`);

  for (const [key, value] of Object.entries(searchParams)) {
    requestUrl.searchParams.set(key, value);
  }

  const response = await fetch(requestUrl, {
    method: "GET",
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${env.accessToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const responseJson = await readJson(response);
  if (!response.ok) {
    return [];
  }

  return Array.isArray(responseJson) ? responseJson : [];
}

async function toDealerChatMessage(
  record: ChatMessageRecord,
  session: DealerSession,
): Promise<DealerChatMessage> {
  const metadata = mergeAttachmentMetadata(
    parseMetadata(record.metadata),
    parseAttachmentDescriptor(record.content),
  );
  const resolvedAttachmentUrl = record.file_url
    ? await createSignedChatAttachmentUrl(session, record.file_url)
    : null;
  const attachment =
    record.file_url && resolvedAttachmentUrl
      ? buildAttachment(record.file_url, metadata, resolvedAttachmentUrl)
      : null;
  const inferredKind = inferMessageKind(record, metadata, attachment);
  const customPayload = inferredKind === "custom" ? buildCustomPayload(metadata) : null;
  const body = getMessageBody(record, metadata, inferredKind);

  return dealerChatMessageSchema.parse({
    id: String(record.id),
    roomId: record.room_id,
    senderRole: inferSenderRole(record, session.dealerId, metadata),
    body,
    createdAt: toIsoDateTime(record.created_at),
    editedAt: record.edited_at ? toIsoDateTime(record.edited_at) : null,
    kind: inferredKind,
    attachment,
    customPayload,
    metadata,
  });
}

function inferSenderRole(
  record: ChatMessageRecord,
  dealerId: string,
  metadata: Record<string, unknown> | null,
) {
  const senderType = typeof metadata?.senderType === "string" ? metadata.senderType : null;

  if (senderType === "system" || metadata?.type === "system") {
    return "system";
  }

  if (record.auth_users_id === dealerId) {
    return "dealer";
  }

  return "customer";
}

function inferMessageKind(
  record: ChatMessageRecord,
  metadata: Record<string, unknown> | null,
  attachment: DealerChatMessage["attachment"],
) {
  if (metadata?.type === "system") {
    return "system" as const;
  }

  if (attachment) {
    return attachment.kind;
  }

  if (record.file_url) {
    return buildAttachment(record.file_url, metadata).kind;
  }

  const customType = typeof metadata?.customType === "string" ? metadata.customType : metadata?.type;

  if (typeof customType === "string" && customType !== "system") {
    return "custom" as const;
  }

  if (record.content?.trim()) {
    return "text" as const;
  }

  return "text" as const;
}

function buildAttachment(
  fileUrl: string,
  metadata: Record<string, unknown> | null,
  resolvedUrl?: string,
) {
  const normalizedUrl = resolvedUrl ?? fileUrl;
  const fileName =
    typeof metadata?.fileName === "string"
      ? metadata.fileName
      : fileUrl.split("/").at(-1) ?? null;
  const mimeType = typeof metadata?.mimeType === "string" ? metadata.mimeType : null;
  const extension = (fileName ?? "").split(".").at(-1)?.toLowerCase() ?? "";
  const isImage =
    mimeType?.startsWith("image/") ||
    ["jpg", "jpeg", "png", "gif", "webp", "heic"].includes(extension);
  const isVideo =
    mimeType?.startsWith("video/") ||
    ["mp4", "mov", "m4v", "webm", "avi"].includes(extension);

  return {
    url: normalizedUrl,
    fileName,
    mimeType,
    kind: isImage ? "image" : isVideo ? "video" : "file",
    thumbnailUrl:
      typeof metadata?.thumbnailUrl === "string" ? metadata.thumbnailUrl : null,
  } as const;
}

async function createSignedChatAttachmentUrl(
  session: DealerSession,
  path: string,
  expiresIn = 60 * 60,
) {
  if (path.startsWith("http")) {
    return path;
  }

  const cachedEntry = signedChatAttachmentUrlCache.get(path);
  if (cachedEntry && cachedEntry.expiresAt - Date.now() > 60 * 1000) {
    return cachedEntry.url;
  }

  const env = getRequiredSupabaseDataEnv(session);
  const encodedPath = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const requestUrl = `${env.SUPABASE_URL}/storage/v1/object/sign/chat-attached-files/${encodedPath}`;
  const response = await fetch(requestUrl, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${env.accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({ expiresIn }),
  });

  const responseJson = await readJson(response);

  if (
    response.ok &&
    responseJson &&
    typeof responseJson === "object" &&
    "signedURL" in responseJson &&
    typeof responseJson.signedURL === "string"
  ) {
    const nextUrl = responseJson.signedURL.startsWith("http")
      ? responseJson.signedURL
      : `${env.SUPABASE_URL}/storage/v1${responseJson.signedURL}`;
    signedChatAttachmentUrlCache.set(path, {
      url: nextUrl,
      expiresAt: Date.now() + expiresIn * 1000,
    });
    return nextUrl;
  }

  return null;
}

function buildCustomPayload(metadata: Record<string, unknown> | null) {
  if (!metadata) {
    return null;
  }

  const type =
    typeof metadata.customType === "string"
      ? metadata.customType
      : typeof metadata.type === "string"
        ? metadata.type
        : "custom";
  const data = isRecord(metadata.data) ? metadata.data : metadata;

  return {
    type,
    title: inferCustomMessageTitle(type, metadata, data),
    description: inferCustomMessageDescription(type, metadata, data),
    data,
  };
}

function getMessageBody(
  record: ChatMessageRecord,
  metadata: Record<string, unknown> | null,
  kind: DealerChatMessage["kind"],
) {
  const content = record.content?.trim();

  if (content) {
    return content;
  }

  if (kind === "image") {
    return "사진";
  }

  if (kind === "video") {
    return "동영상";
  }

  if (kind === "file") {
    return "파일";
  }

  if (kind === "custom") {
    return inferCustomMessageTitle(
      typeof metadata?.customType === "string"
        ? metadata.customType
        : typeof metadata?.type === "string"
          ? metadata.type
          : "custom",
      metadata,
      isRecord(metadata?.data) ? metadata.data : metadata,
    );
  }

  return "";
}

function buildChatPreview(record: ChatMessageRecord) {
  const metadata = parseMetadata(record.metadata);
  const attachment = record.file_url ? buildAttachment(record.file_url, metadata) : null;
  const kind = inferMessageKind(record, metadata, attachment);

  if (kind === "image") {
    return "(사진)";
  }

  if (kind === "video") {
    return "(동영상)";
  }

  if (kind === "file") {
    return "(파일)";
  }

  if (kind === "custom") {
    const type =
      typeof metadata?.customType === "string"
        ? metadata.customType
        : typeof metadata?.type === "string"
          ? metadata.type
          : "custom";
    const data = isRecord(metadata?.data) ? metadata.data : metadata;

    if (type === "ESTIMATE") {
      return "최종 견적서";
    }

    if (type === "IDENTITY_VERIFIED") {
      return "본인 인증 완료";
    }

    if (type === "STATUS_CHANGE") {
      return getStatusChangeLabel(data) ?? "상태 변경";
    }

    return inferCustomMessageTitle(type, metadata, data);
  }

  return getMessageBody(record, metadata, kind) || "대화를 시작해 보세요.";
}

function parseMetadata(value: unknown) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return isRecord(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  return isRecord(value) ? value : null;
}

function inferCustomMessageTitle(
  type: string,
  metadata: Record<string, unknown> | null,
  data: Record<string, unknown> | null,
) {
  if (typeof metadata?.title === "string" && metadata.title.trim().length > 0) {
    return metadata.title;
  }

  if (type === "ESTIMATE") {
    return "최종 계약 발송";
  }

  if (type === "IDENTITY_VERIFIED") {
    return "본인 인증 완료";
  }

  if (type === "STATUS_CHANGE") {
    return getStatusChangeLabel(data) ?? "상태 변경";
  }

  return "안내 메시지";
}

function inferCustomMessageDescription(
  type: string,
  metadata: Record<string, unknown> | null,
  data: Record<string, unknown> | null,
) {
  if (typeof metadata?.description === "string" && metadata.description.trim().length > 0) {
    return metadata.description;
  }

  if (type === "STATUS_CHANGE") {
    return typeof data?.description === "string"
      ? data.description
      : "거래 단계가 변경되었습니다.";
  }

  if (type === "ESTIMATE") {
    return "고객에게 전달된 최신 최종 계약서입니다.";
  }

  if (type === "IDENTITY_VERIFIED") {
    return "고객 본인 인증이 완료되었습니다.";
  }

  return null;
}

function getStatusChangeLabel(data: Record<string, unknown> | null) {
  return typeof data?.to_status_name === "string" && data.to_status_name.trim().length > 0
    ? data.to_status_name
    : null;
}

function parseAttachmentDescriptor(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);

    if (!isRecord(parsed)) {
      return null;
    }

    return {
      fileName: typeof parsed.name === "string" ? parsed.name : null,
      mimeType: typeof parsed.mime === "string" ? parsed.mime : null,
    };
  } catch {
    return null;
  }
}

function mergeAttachmentMetadata(
  metadata: Record<string, unknown> | null,
  descriptor: { fileName: string | null; mimeType: string | null } | null,
) {
  if (!metadata && !descriptor) {
    return null;
  }

  return {
    ...(metadata ?? {}),
    ...(descriptor?.fileName ? { fileName: descriptor.fileName } : {}),
    ...(descriptor?.mimeType ? { mimeType: descriptor.mimeType } : {}),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getNumericMessageId(value: string | number | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function toPostgrestInFilter(values: string[]) {
  return `in.(${values.map((value) => `"${value}"`).join(",")})`;
}

function resolveDealerDataBackend(session: DealerSession) {
  const env = getServerEnv();
  return env.DEALER_DATA_BACKEND ?? session.backend;
}

async function uploadChatAttachmentToStorage(
  session: DealerSession,
  input: {
    roomId: string;
    dealId: string;
    fileName: string;
    mimeType: string;
    bytes: ArrayBuffer;
  },
) {
  const env = getRequiredSupabaseDataEnv(session);
  const extension = getFileExtension(input.fileName, input.mimeType);
  const storageFileName = extension ? `${randomUUID()}.${extension}` : randomUUID();
  const storagePath = `deal/${input.dealId}/room/${input.roomId}/${storageFileName}`;
  const encodedPath = storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  const response = await fetch(
    `${env.SUPABASE_URL}/storage/v1/object/chat-attached-files/${encodedPath}`,
    {
      method: "POST",
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.accessToken}`,
        "Content-Type": input.mimeType || "application/octet-stream",
        "x-upsert": "false",
      },
      cache: "no-store",
      body: Buffer.from(input.bytes),
    },
  );

  if (!response.ok) {
    const responseJson = await readJson(response);
    throw new Error(getSupabaseErrorMessage(responseJson) ?? "파일 업로드에 실패했습니다.");
  }

  return storagePath;
}

function getFileExtension(fileName: string, mimeType: string) {
  const fileExtension = fileName.split(".").at(-1)?.trim().toLowerCase();

  if (fileExtension) {
    return fileExtension;
  }

  const mimeExtension = mimeType.split("/").at(-1)?.trim().toLowerCase();
  return mimeExtension || "";
}

export function validateDealerChatAttachment(input: {
  fileName: string;
  mimeType: string;
  size: number;
}) {
  const extension = input.fileName.split(".").at(-1)?.trim().toLowerCase();

  if (!extension || !(extension in dealerChatAttachmentSpecMap)) {
    throw new Error("지원하지 않는 첨부 형식입니다.");
  }

  const spec = dealerChatAttachmentSpecMap[extension as keyof typeof dealerChatAttachmentSpecMap];
  const normalizedMimeType = normalizeAttachmentMimeType(extension, input.mimeType);

  if (!normalizedMimeType || !spec.mimeTypes.includes(normalizedMimeType as never)) {
    throw new Error("첨부 파일 형식을 다시 확인해 주세요.");
  }

  if (input.size > spec.maxSize) {
    if (spec.category === "video") {
      throw new Error("100MB 이하 영상만 업로드할 수 있습니다.");
    }

    if (spec.category === "image") {
      throw new Error("20MB 이하 이미지만 업로드할 수 있습니다.");
    }

    throw new Error("20MB 이하 파일만 업로드할 수 있습니다.");
  }

  return {
    category: spec.category,
    extension,
    mimeType: normalizedMimeType,
  };
}

function normalizeAttachmentMimeType(extension: string, rawMimeType: string) {
  const normalizedMimeType = rawMimeType.trim().toLowerCase();
  const canonicalMimeTypeByExtension: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    heic: "image/heic",
    heif: "image/heif",
    mp4: "video/mp4",
    mov: "video/quicktime",
    webm: "video/webm",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    txt: "text/plain",
  };

  if (!normalizedMimeType || normalizedMimeType === "application/octet-stream") {
    return canonicalMimeTypeByExtension[extension] ?? normalizedMimeType;
  }

  if (normalizedMimeType === "image/heic-sequence") {
    return "image/heic";
  }

  if (normalizedMimeType === "image/heif-sequence") {
    return "image/heif";
  }

  if (normalizedMimeType === "image/jpg") {
    return "image/jpeg";
  }

  return normalizedMimeType;
}

function getRequiredSupabaseDataEnv(session: DealerSession) {
  const env = getServerEnv();
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY || !session.accessToken) {
    throw new Error("Supabase dealer chat data env is not configured.");
  }

  return {
    SUPABASE_URL: env.SUPABASE_URL,
    SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY,
    accessToken: session.accessToken,
  };
}

function toIsoDateTime(value: string) {
  return new Date(value).toISOString();
}

function getSupabaseErrorMessage(payload: unknown) {
  if (payload && typeof payload === "object" && "message" in payload) {
    return typeof payload.message === "string" ? payload.message : null;
  }

  return null;
}

async function readJson(response: Response) {
  return response.json().catch(() => null);
}
