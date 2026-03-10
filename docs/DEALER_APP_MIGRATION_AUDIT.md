# DEALER_APP_MIGRATION_AUDIT.md

## 목적

이 문서는 Flutter dealer 앱을 web으로 이식하기 위한 기준 인벤토리다.

원칙:
- Flutter dealer 앱의 현재 화면/기능/상태 전이를 빠짐없이 식별한다.
- web 구현은 mobile app의 사용자 경험과 의미를 최대한 일치시킨다.
- 플랫폼 차이 때문에 UX 의사결정이 필요한 경우, 구현 전에 사용자 확인을 받는다.

분석 기준 시점:
- Flutter 모노레포 경로: `/Users/hanchanghun/AndroidStudioProjects/cargo`
- web 경로: `/Users/hanchanghun/AndroidStudioProjects/cargo-web`
- 분석 일자: 2026-03-10

## Web IA 확정 사항

2026-03-10 기준으로 dealer web의 좌측 메인 내비는 다음으로 확정했다.

- `경매장 홈`
- `찜한 차`
- `내 입찰`
- `내 거래`
- `마이 페이지`

추가 원칙:
- Flutter `home`의 `전체 / 찜한 차`는 web에서 `경매장 홈 / 찜한 차`로 분리한다.
- Flutter `quote`의 `내 입찰 / 내 거래`는 web에서 별도 진입으로 분리한다.
- chat은 좌측 메인 내비에서 제외하고 우측 고정 채팅 레일 + 전용 페이지로 유지한다.

## 1. 최상위 상태 머신

Flutter dealer 앱의 진입 흐름은 단순 로그인 여부가 아니라 다음 상태 전이를 가진다.

1. `loading`
  - splash에서 bootstrap + integrity check 완료 전
2. `loggedOut`
  - 로그인 화면과 signup 흐름만 허용
3. `incompleteSignup`
  - auth 유저는 있으나 dealer profile 미완성
  - signup form/card/complete로 강제 이동
4. `pendingApproval`
  - 이메일 인증, 명함 승인 미완료
  - `signupComplete` 또는 `pendingApproval`만 허용
5. `loggedIn`
  - `/home`, `/quote`, `/chat`, `/mypage` 접근 허용
  - 로그인 전에 접근하려던 경로가 있으면 복귀

근거 파일:
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/shared/domain/domain_dealer/lib/usecases/app_dealer_auth_usecase.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/shared/domain/domain_dealer/lib/usecases/app_dealer_auth_usecase.dart)
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/app/app_dealer/lib/core/navigation/dealer_router_redirect.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/app/app_dealer/lib/core/navigation/dealer_router_redirect.dart)

web 이식 메모:
- web도 auth/session만으로 끝내지 말고 `incompleteSignup`, `pendingApproval`을 별도 route state로 유지해야 한다.
- post-login redirect path 복구는 dealer 앱 UX와 동일하게 유지해야 한다.

## 2. Flutter Route Inventory

### 공용 / 인증

| Path | Screen | 역할 | 비고 |
| --- | --- | --- | --- |
| `/` | `DealerSplashScreen` | bootstrap, integrity gate | bootstrap 오류 UI 존재 |
| `/login` | `DealerLoginScreen` | 이메일/비밀번호 로그인 | 실패 toast, 회원가입 진입 |
| `/signup-terms` | `TermsAgreementScreen` | 약관 동의 | 필수 약관 2개 |
| `/signup-form` | `DealerSignupScreen` | 회원가입 기본 정보 입력 | recovery mode 지원 |
| `/signup-card` | `BusinessCardScreen` | 명함/업체 정보 입력 | 이미지 업로드 |
| `/signup-complete` | `SignupCompleteScreen` | 가입 완료 안내 | 로그아웃 후 로그인 화면 이동 |
| `/pending-approval` | `PendingApprovalScreen` | 승인 대기 상태 확인 | 이메일 재전송 placeholder |

### shell 외 상세 진입

| Path | Screen | 역할 | 비고 |
| --- | --- | --- | --- |
| `/contract/input/:dealId` | `ContractInputScreen` | 최종 진행 견적 입력 | 채팅에서 진입 |
| `/deal/:dealId` | `MyDealDetailScreen` | 거래 상세 root 진입 | 채팅/직접 링크 진입 |
| `/bid-wizard` | `BidWizardScreen` | 입찰 단계형 폼 | query/extra payload 필요 |
| `/bid-success` | `BidSuccessScreen` | 입찰 완료 요약 | MY견적/홈 이동 |

### shell branch 1: home

| Path | Screen | 역할 | 비고 |
| --- | --- | --- | --- |
| `/home` | `DealerHomeScreen` | 전체/찜한 차 탭 | 알림 버튼 placeholder |
| `/home/auctions/:auctionId` | `AuctionDetailScreen` | 경매 상세 | 하단 CTA 상태 분기 |

### shell branch 2: quote

| Path | Screen | 역할 | 비고 |
| --- | --- | --- | --- |
| `/quote` | `DealerQuoteScreen` | 대시보드 + 입찰/거래 탭 | 검색/정렬 일부 placeholder |
| `/quote/:auctionId` | `MyBidDetailScreen` | 내 입찰 상세 | 즐겨찾기, 입찰 순위 |
| `/quote/deal/:dealId` | `MyDealDetailScreen` | 거래 상세 | chat CTA 포함 |

### shell branch 3: chat

| Path | Screen | 역할 | 비고 |
| --- | --- | --- | --- |
| `/chat` | `DealerChatListScreen` | 채팅방 목록 | refresh/resume 반영 |
| `/chat/:roomId` | `DealerChatScreen` | 채팅 상세 | 계약 상태 header, 파일 전송 |

### shell branch 4: mypage

| Path | Screen | 역할 | 비고 |
| --- | --- | --- | --- |
| `/mypage` | `DealerMypageScreen` | 마이페이지 허브 | 프로필/설정/빠른 액션 |
| `/mypage/notifications` | `DealerNotificationListScreen` | 알림 리스트 | 세부 구현 존재 |
| `/mypage/my-info` | `MypageMyInfoScreen` | 내정보 관리 | 수정 서브 화면 진입 |
| `/mypage/review` | `ReviewView` | 리뷰 화면 | 존재 |
| `/mypage/announcements` | `DealerAnnouncementsScreen` | 공지사항 리스트 | infinite scroll |
| `/mypage/announcements/:noticeId` | `DealerAnnouncementDetailScreen` | 공지 상세 | 첨부파일 지원 |
| `/mypage/announcements/information/:infoId` | `DealerAnnouncementInfoDetailScreen` | 공지 안내 상세 | content payload 기반 |
| `/mypage/interested-vehicles` | `DealerInterestVehicleScreen` | 관심 차량 관리 | 추가 버튼 있음 |
| `/mypage/interested-vehicle-selection` | `DealerInterestVehicleSelectionPlaceholderScreen` | 관심 차량 선택 placeholder | 미완성 |
| `/mypage/terms` | `TermsScreen` | 약관 목록/상세 | 실제 데이터 기반 |
| `/mypage/customer-service` | `CustomerServiceScreen` | 고객센터 | placeholder |
| `/mypage/notification-settings` | `NotificationSettingScreen` | 알림 설정 | optimistic save |
| `/mypage/webview` | `WebViewScreen` | 웹뷰 | title/url query 기반 |

근거 파일:
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/app/app_dealer/lib/core/navigation/dealer_router_routes.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/app/app_dealer/lib/core/navigation/dealer_router_routes.dart)
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/shared/core/lib/navigation/route_name.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/shared/core/lib/navigation/route_name.dart)
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/shared/core/lib/navigation/route_payloads.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/shared/core/lib/navigation/route_payloads.dart)

## 3. Feature Audit

### 3.1 Splash / App Bootstrap

주요 UX:
- bootstrap loading text 단계 변경: `앱 초기화 중...`, `보안 검사 중...`, `앱 준비 완료...`
- integrity 실패 시 종료 유도
- router redirect가 splash gate를 기다림

핵심 의존성:
- `appBootstrapProvider`
- `checkDeviceIntegrity`
- `splashMinimumDisplayProvider`
- `splashIntegrityReadyProvider`

web 이식 시 주의:
- mobile의 device integrity 개념은 web에서 직접 대응되지 않는다.
- 그러나 splash gate, bootstrap 실패 UI, redirect timing은 동일하게 유지할 수 있다.

근거:
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/splash_dealer/lib/screens/dealer_splash_screen.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/splash_dealer/lib/screens/dealer_splash_screen.dart)

### 3.2 Auth / Signup / Approval

화면:
- 로그인
- 약관 동의
- 회원가입 폼
- 명함 등록
- 가입 완료
- 승인 대기

주요 UX:
- 로그인 실패는 inline validation + runtime error message
- signup은 recovery mode 지원
  - 이미 auth user가 있으면 email 고정, password 입력 생략
  - 가입 중단 복귀 snackbar 노출
- 약관 전체 동의 / 개별 동의
- 명함 이미지는 gallery picker 기반
- 승인 대기 화면에서 이메일 인증 완료 여부, 관리자 명함 확인 여부를 분리 표기

핵심 의존성:
- `LoginUseCase`
- `SignupUseCase`
- `AppDealerAuthUseCase`
- `LogoutUseCase`
- current auth user

web 이식 시 주의:
- `incompleteSignup` 복구 UX를 유지해야 한다.
- `pendingApproval`는 별도 화면/배너가 아니라 별도 상태 전이로 유지해야 한다.
- 이미지 업로드는 실제 저장소와 독립된 adapter를 둬야 한다.

근거:
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/auth_dealer/lib/screens/dealer_login_screen.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/auth_dealer/lib/screens/dealer_login_screen.dart)
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/auth_dealer/lib/screens/signup/terms_agreement_screen.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/auth_dealer/lib/screens/signup/terms_agreement_screen.dart)
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/auth_dealer/lib/screens/signup/dealer_signup_screen.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/auth_dealer/lib/screens/signup/dealer_signup_screen.dart)
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/auth_dealer/lib/screens/signup/business_card_screen.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/auth_dealer/lib/screens/signup/business_card_screen.dart)
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/auth_dealer/lib/screens/signup/signup_complete_screen.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/auth_dealer/lib/screens/signup/signup_complete_screen.dart)
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/auth_dealer/lib/screens/pending_approval_screen.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/auth_dealer/lib/screens/pending_approval_screen.dart)
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/auth_dealer/lib/viewmodels/dealer_signup_viewmodel.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/auth_dealer/lib/viewmodels/dealer_signup_viewmodel.dart)

### 3.3 Home / Auction / Bid Flow

화면:
- home main
- auction detail
- bid wizard
- bid success

주요 UX:
- home은 2탭: `전체`, `찜한 차`
- custom header with cargo logo and notification icon
- list는 10초 polling
- 즐겨찾기 토글은 optimistic update
- auction detail 하단 CTA는 상태 기반
  - 내 입찰 있음: `입찰 완료 (내역 보기)`
  - 경매 종료: disabled
  - 경매중: `입찰하기`
- bid wizard는 multi-step flow
  - 서비스 선택
  - 가격 입력
  - 캐피탈 선택
- purchaseMethod에 따라 step 구성이 달라짐
- bid success는 요약 카드와 CTA 두 개를 제공
  - `MY견적 바로가기`
  - `홈으로 돌아가기`

핵심 의존성:
- `GetDealerAuctionsBriefUseCase`
- `PostToggleDealerAuctionFavoriteUseCase`
- `GetDealerAuctionDetailWithLogUseCase`
- `GetCapitalListUseCase`
- `GetServiceOptionsUseCase`
- `SubmitBidUseCase`

web 이식 시 주의:
- table/grid로 바뀌더라도 “입찰 가능/내 입찰/경매 종료” CTA 의미는 동일해야 한다.
- wizard는 모달/stepper/page 중 어느 UI를 쓰더라도 step validation과 summary payload는 유지해야 한다.
- polling과 refresh semantics는 query policy로 재현해야 한다.

근거:
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/home_dealer/lib/screens/dealer_home_screen.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/home_dealer/lib/screens/dealer_home_screen.dart)
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/home_dealer/lib/screens/auction_detail_screen.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/home_dealer/lib/screens/auction_detail_screen.dart)
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/home_dealer/lib/screens/bid_wizard_screen.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/home_dealer/lib/screens/bid_wizard_screen.dart)
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/home_dealer/lib/screens/bid_success_screen.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/home_dealer/lib/screens/bid_success_screen.dart)
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/home_dealer/lib/viewmodels/dealer_home_viewmodel.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/home_dealer/lib/viewmodels/dealer_home_viewmodel.dart)
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/home_dealer/lib/utils/auction_detail_action_resolver.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/home_dealer/lib/utils/auction_detail_action_resolver.dart)

### 3.4 Quote / Bid / Deal

화면:
- quote dashboard
- my bid list
- my bid detail
- my deal list
- my deal detail

주요 UX:
- 상단 dashboard summary card 존재
- 내부 탭은 `내 입찰` / `내 거래`
- quote 탭 재진입/새로고침 시 dashboard, bids, deals 동시 refresh
- app lifecycle `resumed`에서도 refresh
- my bid detail:
  - 종료된 경매 접근 시 목록 갱신 후 뒤로 복귀
  - 즐겨찾기 토글
  - 입찰 순위 확인 버튼
- my deal list:
  - 카드별 채팅 진입 CTA
  - deal detail 진입
- my deal detail:
  - 상태 변경
  - 날짜 변경
  - 거래 취소
  - 하단 chat CTA

핵심 의존성:
- `GetDealerDashboardSummaryUseCase`
- `GetDealerMyAuctionsBriefUseCase`
- `GetDealerBidRankUseCase`
- `GetDealerMyDealsUseCase`
- `GetDealerMyDealByDealIdUseCase`
- `GetChatRoomIdUseCase`
- `PostUpdateDealStatusUseCase`
- `UpdateDealExpectedDateUseCase`
- `CancelDealUseCase`

web 이식 시 주의:
- quote는 단순 목록이 아니라 summary + tab + list의 결합 화면이다.
- deal detail의 stepper/상태 전환은 business-critical해서 시각 구조가 달라도 순서/행동은 같아야 한다.
- chat과 deal 사이 deep-link는 필수다.

근거:
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/quote_dealer/lib/screens/dealer_quote_screen.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/quote_dealer/lib/screens/dealer_quote_screen.dart)
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/quote_dealer/lib/screens/bids/my_bid_list_screen.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/quote_dealer/lib/screens/bids/my_bid_list_screen.dart)
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/quote_dealer/lib/screens/bids/my_bid_detail_screen.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/quote_dealer/lib/screens/bids/my_bid_detail_screen.dart)
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/quote_dealer/lib/screens/deals/my_deal_list_screen.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/quote_dealer/lib/screens/deals/my_deal_list_screen.dart)
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/quote_dealer/lib/screens/deals/my_deal_detail_screen.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/quote_dealer/lib/screens/deals/my_deal_detail_screen.dart)
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/quote_dealer/lib/viewmodels/my_quote_dashboard_viewmodel.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/quote_dealer/lib/viewmodels/my_quote_dashboard_viewmodel.dart)
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/quote_dealer/lib/viewmodels/deals/my_deal_detail_viewmodel.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/quote_dealer/lib/viewmodels/deals/my_deal_detail_viewmodel.dart)
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/quote_dealer/lib/utils/deals/open_deal_chat_entry_from_ref.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/quote_dealer/lib/utils/deals/open_deal_chat_entry_from_ref.dart)

### 3.5 Chat / Contract

화면:
- chat list
- chat detail
- contract input

주요 UX:
- chat list는 route 복귀와 app resume 때 silent refresh
- room empty/error/skeleton state 구분
- chat detail:
  - room messages + deal info 동시 로드
  - realtime subscription
  - mark-read
  - file upload with optimistic message
  - video 100MB 제한
  - 계약 상태 header
  - `거래 상세` 이동 CTA
  - 출고 완료 시 입력 비활성화
- contract input:
  - 구매 방식에 따라 입력폼 변화
  - number pad / selection / multi-select bottom sheet
  - 하단 고정 submit CTA

핵심 의존성:
- `GetChatRoomsUseCase`
- `GetMessagesUseCase`
- `SendMessageUseCase`
- `SubscribeMessagesUseCase`
- `MarkReadUseCase`
- `UploadFileUseCase`
- `GetChatDealInfoUseCase`
- `GetContractInitDataUseCase`
- `SubmitFinalEstimateUseCase`

web 이식 시 주의:
- 사용자가 이미 채팅 도크를 원한다고 정했으므로 shell state와 room data를 분리해야 한다.
- full page `/chat`와 우측 채팅 레일이 공존하더라도 동일한 room data source를 공유해야 한다.
- file upload, optimistic send, closed-room input lock은 반드시 동일해야 한다.

확정된 web 방향:
- chat은 protected route 우측 고정 채팅 레일을 기본 진입점으로 둔다.
- 좌측 메인 navigation에는 chat을 넣지 않는다.
- `/chat` full-page route는 유지하되 dock CTA와 deal/quote deep link로 진입한다.

근거:
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/chat_dealer/lib/screens/dealer_chat_list_screen.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/chat_dealer/lib/screens/dealer_chat_list_screen.dart)
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/chat_dealer/lib/screens/dealer_chat_screen.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/chat_dealer/lib/screens/dealer_chat_screen.dart)
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/chat_dealer/lib/screens/contract_input_screen.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/chat_dealer/lib/screens/contract_input_screen.dart)
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/chat_dealer/lib/viewmodels/dealer_chat_list_viewmodel.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/chat_dealer/lib/viewmodels/dealer_chat_list_viewmodel.dart)
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/chat_dealer/lib/viewmodels/dealer_chat_viewmodel.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/chat_dealer/lib/viewmodels/dealer_chat_viewmodel.dart)

### 3.6 Mypage / Profile / Notices / Settings

화면:
- mypage hub
- notification list
- my info
- phone verification intro/webview
- nickname/company/password/recruiter registration update
- announcements list/detail/info detail
- interest vehicles
- terms
- customer service
- notification settings
- review

주요 UX:
- profile card + quick actions + settings menu로 허브 구성
- my info는 profile photo, nickname, phone, company, recruiter registration, password, logout, withdraw entry 보유
- 일부 기능은 준비 중 placeholder
  - profile photo upload
  - member withdrawal
  - customer service
  - interested vehicle selection
- announcements는 상단 info preview + paginated list + detail + attachments
- notification settings는 optimistic save
- large text mode toggle 존재

핵심 의존성:
- `GetAuthStateStreamUseCase`
- `GetDealerProfileUseCase`
- `UpdateGreetingUseCase`
- `UpdateNameAndPhoneUseCase`
- `UpdateNicknameUseCase`
- `UpdateDealerPasswordUseCase`
- `GetNotificationUseCase`
- `UpdateNotificationUseCase`
- `GetTermUseCase`
- `GetTermTypeUseCase`
- `GetAnnouncementsUseCase`
- `GetAnnouncementDetailUseCase`
- `GetAnnouncementInformationUseCase`

web 이식 시 주의:
- mypage는 단순 settings 페이지가 아니라 업무성 entry point도 포함한다.
- placeholder 기능과 미완성 정책도 그대로 기록해야 한다.
- phone verification은 webview 의존이 있어 platform 차이 판단이 필요하다.

근거:
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/mypage_dealer/lib/screens/dealer_mypage_screen.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/mypage_dealer/lib/screens/dealer_mypage_screen.dart)
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/mypage_dealer/lib/screens/mypage_my_info_screen.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/mypage_dealer/lib/screens/mypage_my_info_screen.dart)
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/mypage_dealer/lib/screens/dealer_announcements_screen.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/mypage_dealer/lib/screens/dealer_announcements_screen.dart)
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/mypage_dealer/lib/screens/dealer_announcement_detail_screen.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/mypage_dealer/lib/screens/dealer_announcement_detail_screen.dart)
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/mypage_dealer/lib/screens/notification_settings_screen.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/mypage_dealer/lib/screens/notification_settings_screen.dart)
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/mypage_dealer/lib/screens/customer_service_screen.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/mypage_dealer/lib/screens/customer_service_screen.dart)
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/mypage_dealer/lib/viewmodels/dealer_mypage_viewmodel.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/mypage_dealer/lib/viewmodels/dealer_mypage_viewmodel.dart)
- [/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/mypage_dealer/lib/viewmodels/dealer_announcements_viewmodel.dart](/Users/hanchanghun/AndroidStudioProjects/cargo/packages/features/dealer/mypage_dealer/lib/viewmodels/dealer_announcements_viewmodel.dart)

## 4. UX Invariants To Preserve

아래는 visual redesign 여부와 상관없이 유지해야 하는 사용자 경험 규칙이다.

1. 로그인 전 접근한 보호 경로는 로그인 후 복귀한다.
2. 승인 대기 / 가입 미완료 / 로그인 완료 상태는 서로 다른 화면 정책을 가진다.
3. 탭 재진입, route 복귀, app resume 시 silent refresh가 걸린다.
4. home 목록, chat 목록, quote 데이터는 새로고침과 background 복귀에 민감하다.
5. favorite toggle, file upload는 optimistic UX를 가진다.
6. quote와 deal은 chat과 서로 deep link로 이어진다.
7. deal 단계 변경과 날짜 수정은 업무 흐름의 핵심이라 의미를 바꾸면 안 된다.
8. chat은 계약 상태를 단순 메시지 리스트가 아니라 deal context와 함께 보여준다.
9. 하단 고정 CTA, 단계형 wizard, summary card 등 “행동을 유도하는 구조”는 유지해야 한다.

## 5. Web Migration Order

권장 순서:

1. auth state machine 정식화
   - splash
   - login
   - signup
   - pending approval
2. home / auction / bid flow
3. quote dashboard / bid / deal
4. 우측 고정 채팅 레일 + full page chat + contract input
5. mypage 전체

이 순서를 권장하는 이유:
- Flutter dealer 앱의 실제 진입 흐름을 먼저 보존해야 이후 보호 경로/redirect가 안정된다.
- home과 quote가 핵심 업무 플로우를 대부분 차지한다.
- chat은 cross-feature link가 많아 앞선 기능이 있어야 완성도가 올라간다.

## 6. 결정 필요 항목

아래는 platform 차이로 인해 구현 전에 사용자 확인이 필요한 항목이다.

1. splash의 `device integrity check`
   - mobile 고유 개념이라 web에서 동일 복제 불가
   - 대체로는 bootstrap/loading gate만 유지하거나, 브라우저/환경 점검 gate로 치환해야 한다
2. mobile bottom navigation의 web 대응
   - 현재 web skeleton은 좌측 shell
   - Flutter는 하단 탭 + 상세 push 구조
   - navigation 위치는 다르더라도 정보 구조와 tab ownership은 같게 가져갈지 확인 필요
3. 우측 고정 채팅 레일 노출 범위
   - 데스크톱 protected route에 항상 노출
   - 좌측 메인 navigation에는 포함하지 않음
   - 작은 화면에서는 compact toggle fallback 허용
4. phone verification / webview 기반 화면
   - 별도 브라우저 팝업
   - in-app page
   - 외부 vendor redirect
5. file upload와 video compression
   - mobile은 로컬 파일 접근 + video compress
   - web은 browser upload 흐름으로 재설계 필요

## 7. Web Repo Immediate Implications

현재 web repo에서 바로 반영해야 하는 기준:

- route 명명과 feature ownership은 Flutter inventory를 기준으로 확장한다.
- `src/shared/auth/*`는 backend provider 교체 지점으로 유지한다.
- chat은 shell state와 business state를 분리한다.
- quote/deal/chat 사이 cross-link를 먼저 고려한 route helper가 필요하다.
- 화면 구현 전에 각 feature마다 schema, query key, mapper, route entry를 먼저 고정한다.

## 8. 다음 구현 단위

다음으로 바로 구현할 단위:

1. auth route를 Flutter 상태 머신에 맞춰 세분화
2. `/home` route와 `전체/찜한 차` 탭 구조를 Flutter 기준으로 재구성
3. `/quote`를 dashboard + `내 입찰/내 거래` 탭 구조로 교체
4. 우측 고정 채팅 레일을 실제 chat list data와 연결
5. 누락 screen을 체크리스트로 분할해 순차 이식
