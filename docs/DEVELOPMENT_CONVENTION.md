# DEVELOPMENT_CONVENTION.md

# 목적

이 문서는 `cargo-web`에서 실제 구현 시 따르는 파일 구조, 네이밍,
상태 관리, 코드 스타일 관례를 정의합니다.

## 1. 네이밍 규칙

### 1.1 파일명

- React component: `kebab-case.tsx`
- hook: `use-*.ts`
- query options / query helper: `*-query.ts`
- mutation helper: `*-mutation.ts`
- schema: `*-schema.ts`
- mapper / adapter: `*-mapper.ts`
- formatter: `format-*.ts`

예:
- `dealer-login-form.tsx`
- `use-deal-list-query.ts`
- `deal-summary-schema.ts`
- `chat-room-mapper.ts`

### 1.2 컴포넌트명

- Public component는 역할이 드러나는 PascalCase 사용
- route entry는 `DealerDealsPage`, `DealerChatDock`처럼 이름만 봐도
  소유 feature가 드러나도록 한다

비권장:
- `Index`, `Wrapper`, `Container`, `CommonBox`

## 2. 폴더 구조 관례

### 2.1 Feature 예시

```text
src/features/deals/
  components/
  hooks/
  lib/
  schemas/
  types/
  dealer-deals-page.tsx
```

권장:
- feature entry 파일은 얇게 유지
- 세부 구현은 `components/`, `hooks/`, `lib/`로 분리

### 2.2 Shared 예시

```text
src/shared/
  api/
  auth/
  config/
  ui/
  utils/
```

## 3. Component 분리 규칙

### 3.1 Route Entry

역할:
- params/search params 해석
- feature entry 연결
- metadata 연결

금지:
- 로컬 복잡 로직 축적
- 직접 fetch 남발

### 3.2 Feature Entry

역할:
- feature 화면 전체 조립
- query/mutation 연결
- loading/error/empty/success 상태 전환

### 3.3 UI Primitive

위치:
- `src/shared/ui`

역할:
- Button, Dialog, Input, Badge 같은 범용 UI

금지:
- deal/chat/auth에 종속된 비즈니스 표현

## 4. Server State / UI State 규칙

### 4.1 Server State

- TanStack Query 사용
- query key factory를 feature 단위로 정리
- mutation 후 invalidation 정책을 명시
- optimistic update는 필요한 경우만 제한적으로 사용

### 4.2 UI State

- local component state 우선
- URL이 source of truth가 되어야 하는 필터/탭/선택은 search params 사용
- shell-wide UI state만 전역 store 허용

## 5. Form 규칙

- 입력 검증은 Zod schema 기준
- 가능하면 schema를 submit payload와 공유
- 폼 상태 라이브러리 도입은 승인 후
- 작은 폼은 controlled input으로도 충분하면 과도한 추상화 금지

## 6. Fetch / API 규칙

- raw `fetch` 호출은 `shared/api` 또는 feature `lib`에 모은다
- component 내부에서 fetch 구현 상세를 직접 반복하지 않는다
- 응답 파싱은 schema 경계에서 수행한다
- 에러는 사용자 메시지와 로깅 정보를 분리한다

## 7. Styling 규칙

- Tailwind utility class를 기본으로 사용
- 반복되는 조합은 작은 component 또는 helper로 승격
- 디자인 토큰은 CSS variable 또는 shared constant로 정리
- 페이지 단위 inline style 남발 금지

## 8. 접근성 / 상호작용 규칙

- 버튼은 버튼으로, 링크는 링크로 만든다
- keyboard navigation을 고려한다
- dialog, drawer, dropdown은 focus 이동을 명확히 처리한다
- hover 전용 UX에 의존하지 않는다

## 9. 문서화 주석 스타일 (권장)

복잡한 파일에는 짧은 상단 주석을 권장한다.

예시:

```ts
/**
 * Purpose
 * - 거래 목록 화면의 query 조립과 필터 상태를 관리한다.
 *
 * Responsibility
 * - URL search params와 query options를 동기화한다.
 *
 * Related
 * - use-deal-list-query
 * - deal-list-filter-schema
 */
```

원칙:
- "왜 존재하는지 / 어디까지 책임인지"만 짧게 적는다.

## 10. 신규 기능 개발 순서 (표준 워크플로우)

1. 요구사항 / API 계약 확인
2. route 위치와 feature ownership 결정
3. schema / type / mapper 정의
4. query / mutation / action 작성
5. page / layout / component 조립
6. 테스트 및 정적 검증

## 11. 체크리스트

- [ ] route file이 feature 내부 구현을 과도하게 가지지 않는다
- [ ] raw response가 component로 직접 새지 않는다
- [ ] query key와 invalidation 정책이 명확하다
- [ ] client component 범위가 과도하지 않다
- [ ] feature-specific UI가 shared로 새지 않는다
