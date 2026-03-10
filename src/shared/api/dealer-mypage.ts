import {
  dealerAnnouncementDetailSchema,
  dealerAnnouncementInfoSchema,
  dealerAnnouncementPageSchema,
  dealerAnnouncementSummarySchema,
  type DealerAnnouncementDetail,
  type DealerAnnouncementInfo,
  type DealerAnnouncementPage,
} from "@/entities/announcement/schemas/dealer-announcement-schema";
import {
  dealerProfileSchema,
  type DealerProfile,
} from "@/entities/dealer/schemas/dealer-profile-schema";
import {
  dealerNotificationItemSchema,
  type DealerNotificationItem,
} from "@/entities/notification/schemas/dealer-notification-schema";

const dealerMypageLatency = 140;
const announcementPageSize = 4;

let dealerProfileRecord = dealerProfileSchema.parse({
  id: "dealer-001",
  dealerName: "한창훈",
  dealerNickname: "Cargo 압구정",
  companyName: "Cargo Auto Lounge",
  ownerName: "한창훈",
  approvalStatus: "active",
  branchCount: 3,
});

let dealerNotificationRecords = dealerNotificationItemSchema.array().parse([
  {
    id: "dealer-noti-1",
    type: "system",
    title: "소중한 후기가 도착했어요",
    body: "리뷰 관리 화면에서 고객 후기를 확인해 주세요.",
    createdAt: "2026-03-10T00:40:00.000Z",
    isUnread: false,
    highlighted: false,
    target: { kind: "review", value: null },
  },
  {
    id: "dealer-noti-2",
    type: "chat",
    title: "한*우 고객님이 메시지를 보냈습니다",
    body: "계약자 정보 전달했습니다. 확인 부탁드립니다.",
    createdAt: "2026-03-10T01:20:00.000Z",
    isUnread: true,
    highlighted: true,
    target: { kind: "chat", value: "room-006" },
  },
  {
    id: "dealer-noti-3",
    type: "auction",
    title: "딜러님의 견적이 선택되었습니다",
    body: "고객과의 거래가 시작되었습니다. 거래 상태를 확인해 주세요.",
    createdAt: "2026-03-10T02:05:00.000Z",
    isUnread: true,
    highlighted: true,
    target: { kind: "deal", value: "deal-007" },
  },
  {
    id: "dealer-noti-4",
    type: "system",
    title: "공지사항이 업데이트되었습니다",
    body: "3월 운영 정책 변경 사항을 확인해 주세요.",
    createdAt: "2026-03-09T11:30:00.000Z",
    isUnread: false,
    highlighted: false,
    target: { kind: "announcement", value: "notice-004" },
  },
  {
    id: "dealer-noti-5",
    type: "auction",
    title: "입찰이 마감되었습니다",
    body: "결과는 내 입찰 화면에서 확인할 수 있습니다.",
    createdAt: "2026-03-09T06:10:00.000Z",
    isUnread: false,
    highlighted: false,
    target: { kind: "bid", value: "auction-005" },
  },
]);

const announcementInformationRecord = dealerAnnouncementInfoSchema.parse({
  id: "info-001",
  title: "서비스 운영 안내",
  content:
    "공지사항과 운영 정책은 수시로 업데이트됩니다. 중요한 변경 사항은 공지 목록 상단에서 먼저 확인해 주세요.",
});

let dealerAnnouncementRecords = dealerAnnouncementDetailSchema.array().parse([
  {
    id: "notice-001",
    title: "3월 상담 운영 시간 변경 안내",
    content:
      "상담 운영 시간이 평일 오전 9시부터 오후 7시까지로 조정되었습니다. 긴급 문의는 고객센터 메뉴를 이용해 주세요.",
    viewCount: 184,
    isNew: true,
    isRead: false,
    createdAt: "2026-03-10T01:00:00.000Z",
    attachments: [],
  },
  {
    id: "notice-002",
    title: "거래 단계별 서류 제출 기준 안내",
    content:
      "서류 확인 단계에서는 기본 신분증과 사업자등록증 사본이 필요합니다. 추가 서류 요청 시 채팅으로 안내드립니다.",
    viewCount: 126,
    isNew: true,
    isRead: false,
    createdAt: "2026-03-09T08:20:00.000Z",
    attachments: [
      {
        id: "attachment-002-1",
        name: "dealer-document-checklist.pdf",
        sizeLabel: "PDF · 1.2MB",
        url: "#",
      },
    ],
  },
  {
    id: "notice-003",
    title: "수수료 할인 프로모션 연장",
    content:
      "참여 딜러 대상 수수료 할인 혜택이 이번 달 말까지 연장됩니다. 상세 조건은 첨부 파일을 확인해 주세요.",
    viewCount: 208,
    isNew: false,
    isRead: true,
    createdAt: "2026-03-08T03:15:00.000Z",
    attachments: [
      {
        id: "attachment-003-1",
        name: "promotion-detail.pdf",
        sizeLabel: "PDF · 860KB",
        url: "#",
      },
    ],
  },
  {
    id: "notice-004",
    title: "3월 운영 정책 변경 사항",
    content:
      "출고 준비 단계의 일정 입력 기준과 고객 응대 SLA가 일부 조정되었습니다. 상세 내용을 반드시 확인해 주세요.",
    viewCount: 241,
    isNew: false,
    isRead: false,
    createdAt: "2026-03-07T09:40:00.000Z",
    attachments: [],
  },
  {
    id: "notice-005",
    title: "알림 설정 메뉴 점검 예정 안내",
    content:
      "일부 알림 설정 저장 기능이 점검될 예정입니다. 점검 시간 동안 설정 변경이 지연될 수 있습니다.",
    viewCount: 88,
    isNew: false,
    isRead: false,
    createdAt: "2026-03-06T06:30:00.000Z",
    attachments: [],
  },
  {
    id: "notice-006",
    title: "딜러 리뷰 정책 안내",
    content:
      "거래 완료 후 등록되는 리뷰는 마이페이지의 리뷰 관리 메뉴에서 확인할 수 있습니다. 허위 리뷰 신고도 지원합니다.",
    viewCount: 97,
    isNew: false,
    isRead: false,
    createdAt: "2026-03-05T07:10:00.000Z",
    attachments: [],
  },
]);

function delay(ms = dealerMypageLatency) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function toAnnouncementSummary(detail: DealerAnnouncementDetail) {
  return dealerAnnouncementSummarySchema.parse({
    id: detail.id,
    title: detail.title,
    content: detail.content,
    viewCount: detail.viewCount,
    isNew: detail.isNew,
    isRead: detail.isRead,
    createdAt: detail.createdAt,
  });
}

export async function fetchDealerProfile(): Promise<DealerProfile> {
  await delay();

  return dealerProfileRecord;
}

export async function fetchDealerNotifications(): Promise<DealerNotificationItem[]> {
  await delay();

  return [...dealerNotificationRecords].sort(
    (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
  );
}

export async function markAllDealerNotificationsAsRead() {
  await delay(90);

  dealerNotificationRecords = dealerNotificationRecords.map((item) => ({
    ...item,
    isUnread: false,
    highlighted: false,
  }));
}

export async function markDealerNotificationAsRead(notificationId: string) {
  await delay(70);

  dealerNotificationRecords = dealerNotificationRecords.map((item) =>
    item.id === notificationId
      ? { ...item, isUnread: false, highlighted: false }
      : item,
  );
}

export async function fetchDealerAnnouncementInfo(): Promise<DealerAnnouncementInfo> {
  await delay();

  return announcementInformationRecord;
}

export async function fetchDealerAnnouncementInfoDetail(
  infoId: string,
): Promise<DealerAnnouncementInfo> {
  await delay();

  if (announcementInformationRecord.id !== infoId) {
    throw new Error("안내 정보를 찾을 수 없습니다.");
  }

  return announcementInformationRecord;
}

export async function fetchDealerAnnouncementsPage(
  cursor = 0,
): Promise<DealerAnnouncementPage> {
  await delay();

  const sortedAnnouncements = [...dealerAnnouncementRecords].sort(
    (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
  );
  const items = sortedAnnouncements
    .slice(cursor, cursor + announcementPageSize)
    .map(toAnnouncementSummary);
  const nextCursor =
    cursor + announcementPageSize < sortedAnnouncements.length
      ? cursor + announcementPageSize
      : null;

  return dealerAnnouncementPageSchema.parse({
    items,
    nextCursor,
  });
}

export async function fetchDealerAnnouncementDetail(
  noticeId: string,
): Promise<DealerAnnouncementDetail> {
  await delay();

  const targetIndex = dealerAnnouncementRecords.findIndex((item) => item.id === noticeId);

  if (targetIndex === -1) {
    throw new Error("공지사항을 찾을 수 없습니다.");
  }

  dealerAnnouncementRecords[targetIndex] = {
    ...dealerAnnouncementRecords[targetIndex],
    isRead: true,
    viewCount: dealerAnnouncementRecords[targetIndex].viewCount + 1,
  };

  return dealerAnnouncementRecords[targetIndex];
}
