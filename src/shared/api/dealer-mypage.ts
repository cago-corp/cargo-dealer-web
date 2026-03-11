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
import {
  dealerCustomerServiceSchema,
  dealerInterestedVehicleCreateSchema,
  dealerInterestedVehicleSchema,
  dealerMyInfoSchema,
  dealerNicknameUpdateSchema,
  dealerNotificationSettingsSchema,
  dealerPhoneUpdateSchema,
  dealerCompanyNameUpdateSchema,
  dealerRecruiterRegistrationUpdateSchema,
  dealerReviewWorkspaceSchema,
  dealerTermSchema,
  dealerTermTypeSchema,
  type DealerCompanyNameUpdate,
  type DealerCustomerService,
  type DealerInterestedVehicleCreate,
  type DealerInterestedVehicle,
  type DealerMyInfo,
  type DealerNicknameUpdate,
  type DealerNotificationSettings,
  type DealerPhoneUpdate,
  type DealerRecruiterRegistrationUpdate,
  type DealerReviewWorkspace,
  type DealerTerm,
  type DealerTermType,
} from "@/entities/mypage/schemas/dealer-mypage-detail-schema";

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

let dealerMyInfoRecord = dealerMyInfoSchema.parse({
  dealerName: "한창훈",
  dealerNickname: "Cargo 압구정",
  phone: "010-1234-5678",
  email: "test1@gmail.com",
  companyName: "Cargo Auto Lounge",
  recruiterRegistrationNumber: null,
  approvalStatus: "active",
  joinedAt: "2026-01-03T03:20:00.000Z",
});

let dealerNotificationSettingsRecord = dealerNotificationSettingsSchema.parse({
  serviceAlertEnabled: true,
  marketingAlertEnabled: false,
  browserPushEnabled: false,
  browserPushStatusLabel: "브라우저 푸시는 추후 연동 예정입니다.",
  quietHoursEnabled: true,
  quietHoursRangeLabel: "22:00 - 08:00",
});

let dealerInterestedVehicleRecords = dealerInterestedVehicleSchema.array().parse([]);
let dealerInterestedVehicleSequence = 1;
let dealerBusinessCardFileName: string | null = null;
let dealerRecruiterCertificateFileName: string | null = null;

const dealerTermTypeRecords = dealerTermTypeSchema.array().parse([
  {
    id: "term-service",
    name: "서비스 이용약관",
    summary: "딜러 웹 이용 시 필요한 기본 서비스 이용 조건입니다.",
  },
  {
    id: "term-privacy",
    name: "개인정보 처리방침",
    summary: "개인정보 수집, 이용, 보관 및 파기 기준을 확인할 수 있습니다.",
  },
  {
    id: "term-marketing",
    name: "마케팅 정보 수신 동의",
    summary: "이벤트, 혜택, 프로모션 안내에 대한 수신 기준입니다.",
  },
]);

const dealerTermRecords = dealerTermSchema.array().parse([
  {
    id: "term-detail-service",
    typeId: "term-service",
    name: "서비스 이용약관",
    content:
      "제1조 목적\n이 약관은 CARGO 딜러 웹 서비스의 이용 조건과 절차를 규정합니다.\n\n제2조 서비스 범위\n회사는 딜러 회원에게 경매장 홈, 입찰, 거래, 채팅, 공지, 알림 설정 기능을 제공합니다.\n\n제3조 회원 의무\n딜러 회원은 등록 정보와 사업자 관련 정보를 최신 상태로 유지해야 하며, 고객 응대와 거래 진행에서 운영 정책을 준수해야 합니다.",
  },
  {
    id: "term-detail-privacy",
    typeId: "term-privacy",
    name: "개인정보 처리방침",
    content:
      "회사는 딜러 회원의 이름, 연락처, 업체명, 로그인 정보 및 거래 관련 활동 내역을 서비스 제공 목적 범위에서 처리합니다.\n\n보관 기간과 파기 기준은 관련 법령 및 내부 보안 정책을 따릅니다.\n\n개인정보 관련 문의는 고객센터 메뉴를 통해 접수할 수 있습니다.",
  },
  {
    id: "term-detail-marketing",
    typeId: "term-marketing",
    name: "마케팅 정보 수신 동의",
    content:
      "마케팅 수신 동의 시 프로모션, 수수료 할인, 이벤트, 신규 기능 소개 알림을 받을 수 있습니다.\n\n설정은 마이페이지 > 알림 설정에서 언제든 변경할 수 있습니다.",
  },
]);

const dealerCustomerServiceRecord = dealerCustomerServiceSchema.parse({
  heroTitle: "도움이 필요할 때 바로 확인할 수 있는 지원 정보",
  heroDescription:
    "거래 진행 중 막히는 부분이나 계정 정보 변경 요청은 아래 채널과 안내를 기준으로 처리합니다.",
  channels: [
    {
      id: "support-channel-1",
      label: "운영 문의",
      description: "거래 진행, 채팅, 공지사항 관련 운영 문의를 접수합니다.",
      availability: "평일 09:00 - 18:00",
    },
    {
      id: "support-channel-2",
      label: "계정 / 승인 문의",
      description: "회원 정보 변경, 승인 상태, 재심사 관련 문의에 사용합니다.",
      availability: "영업일 기준 순차 답변",
    },
    {
      id: "support-channel-3",
      label: "긴급 이슈 접수",
      description: "거래 차단, 결제/출고 단계 긴급 이슈는 공지된 긴급 채널 기준으로 처리합니다.",
      availability: "운영 정책 확인 필요",
    },
  ],
  faqs: [
    {
      id: "faq-1",
      question: "최종 계약을 보낸 뒤 다시 수정할 수 있나요?",
      answer: "고객 계약 전까지는 최종 계약을 다시 열어 수정하고 재전송할 수 있습니다.",
    },
    {
      id: "faq-2",
      question: "출고 완료된 거래는 어디서 확인하나요?",
      answer: "마이페이지의 거래 아카이브에서 종료된 거래와 채팅 기록을 함께 확인할 수 있습니다.",
    },
    {
      id: "faq-3",
      question: "알림이 오지 않으면 어디를 확인해야 하나요?",
      answer: "마이페이지의 알림 설정 상태와 브라우저/기기 알림 권한을 먼저 확인해 주세요.",
    },
  ],
});

const dealerReviewWorkspaceRecord = dealerReviewWorkspaceSchema.parse({
  reviewCount: 0,
  averageRating: 0,
  policySummary: "거래 완료 후 등록된 리뷰는 운영 정책 검수 후 노출됩니다.",
  emptyStateTitle: "아직 등록된 리뷰가 없습니다.",
  emptyStateDescription:
    "거래가 완료되면 고객 리뷰가 이 화면에 정리됩니다. 이후 평점, 최근 리뷰, 신고 내역을 한 번에 확인할 수 있도록 확장됩니다.",
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

export async function fetchDealerMyInfo(): Promise<DealerMyInfo> {
  await delay();

  return dealerMyInfoRecord;
}

export async function updateDealerNickname(
  input: DealerNicknameUpdate,
): Promise<DealerMyInfo> {
  await delay(90);

  const parsed = dealerNicknameUpdateSchema.parse(input);
  dealerMyInfoRecord = dealerMyInfoSchema.parse({
    ...dealerMyInfoRecord,
    dealerNickname: parsed.nickname,
  });
  dealerProfileRecord = dealerProfileSchema.parse({
    ...dealerProfileRecord,
    dealerNickname: parsed.nickname,
  });

  return dealerMyInfoRecord;
}

export async function updateDealerPhone(
  input: DealerPhoneUpdate,
): Promise<DealerMyInfo> {
  await delay(90);

  const parsed = dealerPhoneUpdateSchema.parse(input);
  dealerMyInfoRecord = dealerMyInfoSchema.parse({
    ...dealerMyInfoRecord,
    phone: parsed.phone,
  });

  return dealerMyInfoRecord;
}

export async function updateDealerCompanyName(
  input: DealerCompanyNameUpdate,
): Promise<DealerMyInfo> {
  await delay(100);

  const parsed = dealerCompanyNameUpdateSchema.parse(input);
  dealerMyInfoRecord = dealerMyInfoSchema.parse({
    ...dealerMyInfoRecord,
    companyName: parsed.companyName,
  });
  dealerProfileRecord = dealerProfileSchema.parse({
    ...dealerProfileRecord,
    companyName: parsed.companyName,
  });
  dealerBusinessCardFileName = parsed.businessCardFileName ?? dealerBusinessCardFileName;

  return dealerMyInfoRecord;
}

export async function updateDealerRecruiterRegistrationNumber(
  input: DealerRecruiterRegistrationUpdate,
): Promise<DealerMyInfo> {
  await delay(100);

  const parsed = dealerRecruiterRegistrationUpdateSchema.parse(input);
  dealerMyInfoRecord = dealerMyInfoSchema.parse({
    ...dealerMyInfoRecord,
    recruiterRegistrationNumber: parsed.recruiterRegistrationNumber,
  });
  dealerRecruiterCertificateFileName =
    parsed.certificateFileName ?? dealerRecruiterCertificateFileName;

  return dealerMyInfoRecord;
}

export async function fetchDealerNotificationSettings(): Promise<DealerNotificationSettings> {
  await delay();

  return dealerNotificationSettingsRecord;
}

export async function updateDealerNotificationSettings(
  nextSettings: DealerNotificationSettings,
) {
  await delay(90);

  dealerNotificationSettingsRecord = dealerNotificationSettingsSchema.parse(nextSettings);
  return dealerNotificationSettingsRecord;
}

export async function fetchDealerInterestedVehicles(): Promise<DealerInterestedVehicle[]> {
  await delay();

  return [...dealerInterestedVehicleRecords].sort(
    (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
  );
}

export async function createDealerInterestedVehicle(
  input: DealerInterestedVehicleCreate,
): Promise<DealerInterestedVehicle[]> {
  await delay(90);

  const parsed = dealerInterestedVehicleCreateSchema.parse(input);
  dealerInterestedVehicleRecords = dealerInterestedVehicleSchema.array().parse([
    ...dealerInterestedVehicleRecords,
    {
      id: `interested-vehicle-${String(dealerInterestedVehicleSequence).padStart(3, "0")}`,
      label: parsed.label,
      modelDetail: parsed.modelDetail,
      category: parsed.category,
      createdAt: new Date().toISOString(),
    },
  ]);
  dealerInterestedVehicleSequence += 1;

  return fetchDealerInterestedVehicles();
}

export async function removeDealerInterestedVehicle(vehicleId: string): Promise<DealerInterestedVehicle[]> {
  await delay(90);

  dealerInterestedVehicleRecords = dealerInterestedVehicleSchema.array().parse(
    dealerInterestedVehicleRecords.filter((item) => item.id !== vehicleId),
  );

  return fetchDealerInterestedVehicles();
}

export async function fetchDealerTermTypes(): Promise<DealerTermType[]> {
  await delay();

  return dealerTermTypeRecords;
}

export async function fetchDealerTerm(termTypeId: string): Promise<DealerTerm> {
  await delay();

  const term = dealerTermRecords.find((item) => item.typeId === termTypeId);

  if (!term) {
    throw new Error("약관 정보를 찾을 수 없습니다.");
  }

  return term;
}

export async function fetchDealerCustomerService(): Promise<DealerCustomerService> {
  await delay();

  return dealerCustomerServiceRecord;
}

export async function fetchDealerReviewWorkspace(): Promise<DealerReviewWorkspace> {
  await delay();

  return dealerReviewWorkspaceRecord;
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
