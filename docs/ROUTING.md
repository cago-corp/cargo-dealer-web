# ROUTING.md

# 목적

이 문서는 Next.js App Router 기반 라우팅 규칙과 ownership을 정의합니다.

핵심 원칙:
- 라우팅 구성은 `src/app/*` 소유
- feature는 route segment 구조를 몰라도 동작 가능해야 한다
- auth/session redirect는 route boundary 또는 middleware에서만 처리한다

## 1. 라우팅 소유권

다음은 반드시 `src/app/*`에 위치해야 함:
- `page.tsx`
- `layout.tsx`
- `loading.tsx`
- `error.tsx`
- route metadata
- route handlers
- middleware 기반 redirect 정책

feature는 route file을 만들지 않는다.

## 2. Feature에서의 Navigation 방식

허용:
- `next/link`
- `useRouter`
- route helper
- app에서 전달된 callback

비권장:
- route string 상수를 feature 곳곳에 하드코딩
- feature 내부에서 인증 redirect 정책 판단

권장 패턴:
1. `shared`에 route helper를 둔다
2. page/layout에서 params를 해석한다
3. feature는 필요한 값만 props로 받는다

## 3. URL을 source of truth로 둘 상태

아래는 search params 또는 path params를 우선 고려:
- 탭
- 필터
- 정렬
- pagination
- 선택된 거래/채팅방 id

이유:
- 새로고침 / 공유 / 브라우저 뒤로가기 일관성 확보

## 4. Protected Route 규칙

원칙:
- 인증 필요한 구간은 route group 단위로 묶는다
- redirect는 page가 아니라 route boundary에서 처리한다

예시:

```text
src/app/
  (public)/
    login/
  (protected)/
    dashboard/
    deals/
    chat/
```

## 5. Chat Dock 규칙

딜러 웹에서 채팅은 페이지이자 shell dock이 될 수 있다.

원칙:
- URL은 현재 보고 있는 주요 화면을 유지
- chat dock open/close는 shell state
- 선택된 room은 URL 또는 shell state 중 하나를 source of truth로 정하고
  혼용하지 않는다

권장:
- full-page chat: `/chat/[roomId]`
- shell dock: 현재 route 유지 + `roomId`만 search params 또는 shell state로 관리

## 6. Route Handler 규칙

허용:
- BFF 성격의 얇은 request handler
- token exchange
- 서버 전용 env 사용 로직

금지:
- client UI 포맷팅 로직
- feature view model 역할

## 7. 테스트 가이드

우선순위:
- protected route redirect
- search params 유지
- unknown route / error boundary
- dock state와 route state 충돌 여부
