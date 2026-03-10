# ARCHITECTURE.md

# 목적

이 문서는 `cargo-web`의 아키텍처 경계와 의존성 방향을 정의합니다.
에이전트/개발자 모두 이 문서를 기준으로 소유권과 책임을 판단합니다.

`AGENTS.md`가 "강제 규칙"의 요약이라면, 이 문서는 상세 설명과 예시입니다.

## 1. 레이어 구조

기본 구조:

```text
src/
  app/
    (auth)/
    (protected)/
    api/
  features/
    auth/
    home/
    bids/
    deals/
    chat/
    mypage/
  entities/
    auth/
    dealer/
    deal/
    chat/
  shared/
    api/
    auth/
    config/
    lib/
    ui/
    utils/
```

중요:
- 물리 경로보다 "역할"과 "의존성 방향" 규칙이 우선이다.
- `app/`는 라우팅과 route composition을 소유한다.
- `features/`는 기능 응집도를 기준으로 분리한다.
- `entities/`는 외부 API와 UI 사이의 안정된 타입/스키마 계층이다.
- `shared/`는 여러 feature가 공통으로 사용하는 기반 도구만 둔다.

## 2. 의존성 방향 (가장 중요)

허용 방향:

```text
app -> features
app -> entities
app -> shared

features -> entities
features -> shared

entities -> shared
```

금지 방향:

```text
shared -> entities/features/app
entities -> features/app
sibling feature -> sibling feature (직접 import)
route file -> route file
```

핵심 의미:
- 페이지/레이아웃은 조립자이고, 비즈니스 세부 구현을 직접 가지지 않는다.
- feature는 UI와 서버 상태 orchestration에 집중한다.
- entities는 계약 안정화와 데이터 해석에 집중한다.
- shared는 범용 기반만 가진다.

## 3. 폴더별 책임

### 3.1 `src/app/*` (Route Composition Root)

허용:
- `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- metadata
- route-level access guard wiring
- route handlers
- search params / params 해석 후 feature entry에 전달

금지:
- API 응답 shape를 route 파일에서 직접 가공
- feature 내부 세부 hook 구현
- 재사용 가능한 비즈니스 로직 축적

### 3.2 `src/features/*` (Feature Layer)

허용:
- feature entry component
- feature-specific client components
- query/mutation hooks
- feature mappers
- feature-local zod schema
- UI state / view data

금지:
- 전역 route catalog 정의
- 공용 컴포넌트 축적
- 다른 feature 내부 구현 직접 참조

### 3.3 `src/entities/*` (Stable Domain-Facing Layer)

허용:
- entity type
- enum / value object
- API payload parser schema
- DTO -> entity adapter
- shared display helper that is not feature-specific

금지:
- React component
- browser event handling
- fetch client 직접 생성

### 3.4 `src/shared/*` (Cross-Cutting)

허용 예:
- API client
- auth/session helper
- env parser
- date / number / text formatter
- shared UI primitive
- design tokens

주의:
- shared에 feature-specific business rule이 쌓이지 않게 한다.
- 공용화 이유가 "여기저기서 대충 쓰일 것 같아서"이면 feature에 남긴다.

## 4. Server / Client Component 경계

원칙:
- 기본은 Server Component
- 브라우저 API, 이벤트 핸들러, 로컬 interactive state가 필요할 때만
  Client Component로 내린다

권장 흐름:
1. route/page에서 server data prefetch 또는 params 해석
2. feature entry에 최소 props 전달
3. interactive한 부분만 client component로 분리

금지:
- 전체 feature를 습관적으로 `"use client"`로 시작하는 방식
- 서버에서 처리 가능한 일을 client fetch로만 처리하는 방식

## 5. Data 경계

권장 흐름:

```text
external response
  -> shared/api client fetch
  -> feature/entity schema parse
  -> entity / view data
  -> component render
```

원칙:
- 외부 응답은 경계에서 검증한다.
- UI는 raw response에 직접 의존하지 않는다.
- 실패 메시지 포맷은 feature 또는 shared error mapper에서 통일한다.

## 6. Chat / Shell 분리

딜러 웹 특성상 채팅은 독립 페이지이면서 동시에 shell dock이 될 수 있다.

원칙:
- 채팅 메시지/방 목록 데이터는 `features/chat`
- dock 열림/닫힘/선택 방 상태는 shell state
- shell state와 business state를 섞지 않는다

권장 예:

```text
app shell
  -> chat dock open/close state
  -> selected room id

features/chat
  -> room list query
  -> room detail query
  -> send mutation
```

## 7. API Route / BFF 사용 기준

허용:
- 민감한 secret이 필요한 경우
- 클라이언트에 노출하면 안 되는 토큰 교환
- 여러 외부 API를 묶는 얇은 조합 계층

비권장:
- 단순 pass-through를 남용해서 프론트와 백엔드 사이에 불필요한 중간 계층 추가

원칙:
- 직접 호출 가능한 백엔드 계약은 우선 직접 호출
- BFF가 필요하면 "왜 필요한지"를 문서에 남긴다

## 8. 문서 우선 항목

아래 항목은 구현보다 먼저 문서화가 필요하다.
- 인증 흐름
- 권한/redirect 규칙
- 핵심 enum/status 표
- 업로드 경로 규칙
- 채팅/거래 상태 전이 정책
